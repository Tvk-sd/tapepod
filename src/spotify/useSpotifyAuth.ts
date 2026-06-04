import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_DISCOVERY,
  SPOTIFY_SCOPES,
  REDIRECT_URI,
} from './config';

// Required for the web popup flow: when the auth tab redirects back to the app,
// this hands the result to the original tab and closes the popup. Without it the
// popup reopens the app but the original tab never connects.
WebBrowser.maybeCompleteAuthSession();

// Spotify auth — OAuth 2.0 Authorization Code + PKCE via expo-auth-session.
// No client secret, no backend. Tokens persist; access token auto-refreshes.

const TOKEN_KEY = 'tapepod.spotify.token.v1';
// Shared across tabs on web so OAuth still completes when the browser opens
// Spotify in a sibling tab (e.g. Cursor's embedded browser) instead of a popup.
const PKCE_KEY = 'tapepod.spotify.pkce.v1';

function persistToken(res: AuthSession.TokenResponse, setToken: (t: Token) => void) {
  const t: Token = {
    accessToken: res.accessToken,
    refreshToken: res.refreshToken ?? '',
    expiresAt: Date.now() + (res.expiresIn ?? 3600) * 1000,
  };
  setToken(t);
  AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(t)).catch(() => {});
}

function clearWebAuthQuery() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.search = '';
  window.history.replaceState({}, '', url.toString());
}

interface Token {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // ms epoch
}

export function useSpotifyAuth() {
  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const resumeStarted = useRef(false);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: SPOTIFY_CLIENT_ID,
      scopes: SPOTIFY_SCOPES,
      redirectUri: REDIRECT_URI,
      usePKCE: true,
    },
    SPOTIFY_DISCOVERY,
  );

  // Restore a saved token on mount.
  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY)
      .then((raw) => {
        if (raw) setToken(JSON.parse(raw) as Token);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Exchange the auth code for tokens once the redirect returns (popup flow).
  useEffect(() => {
    if (response?.type === 'success' && request?.codeVerifier) {
      AuthSession.exchangeCodeAsync(
        {
          clientId: SPOTIFY_CLIENT_ID,
          code: response.params.code as string,
          redirectUri: REDIRECT_URI,
          extraParams: { code_verifier: request.codeVerifier },
        },
        SPOTIFY_DISCOVERY,
      )
        .then((res) => {
          persistToken(res, setToken);
          if (Platform.OS === 'web') {
            localStorage.removeItem(PKCE_KEY);
            clearWebAuthQuery();
          }
        })
        .catch(() => {});
    }
  }, [response, request]);

  // Sibling-tab / same-tab redirect: complete OAuth when URL has ?code= on web.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || resumeStarted.current) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return;

    resumeStarted.current = true;
    const raw = localStorage.getItem(PKCE_KEY);
    if (!raw) {
      clearWebAuthQuery();
      return;
    }

    let pkce: { codeVerifier: string; state: string };
    try {
      pkce = JSON.parse(raw) as { codeVerifier: string; state: string };
    } catch {
      localStorage.removeItem(PKCE_KEY);
      clearWebAuthQuery();
      return;
    }

    if (params.get('state') !== pkce.state) {
      localStorage.removeItem(PKCE_KEY);
      clearWebAuthQuery();
      return;
    }

    AuthSession.exchangeCodeAsync(
      {
        clientId: SPOTIFY_CLIENT_ID,
        code,
        redirectUri: REDIRECT_URI,
        extraParams: { code_verifier: pkce.codeVerifier },
      },
      SPOTIFY_DISCOVERY,
    )
      .then((res) => {
        persistToken(res, setToken);
        localStorage.removeItem(PKCE_KEY);
        clearWebAuthQuery();
      })
      .catch(() => {
        localStorage.removeItem(PKCE_KEY);
        clearWebAuthQuery();
      });
  }, []);

  const login = useCallback(() => {
    if (Platform.OS === 'web' && request?.codeVerifier) {
      localStorage.setItem(
        PKCE_KEY,
        JSON.stringify({ codeVerifier: request.codeVerifier, state: request.state }),
      );
    }
    promptAsync();
  }, [promptAsync, request]);

  const logout = useCallback(() => {
    setToken(null);
    AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
  }, []);

  // Returns a valid access token, refreshing if it's near expiry.
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!token) return null;
    if (Date.now() < token.expiresAt - 60_000) return token.accessToken;
    if (!token.refreshToken) return null;
    try {
      const res = await AuthSession.refreshAsync(
        { clientId: SPOTIFY_CLIENT_ID, refreshToken: token.refreshToken },
        SPOTIFY_DISCOVERY,
      );
      const t: Token = {
        accessToken: res.accessToken,
        refreshToken: res.refreshToken ?? token.refreshToken,
        expiresAt: Date.now() + (res.expiresIn ?? 3600) * 1000,
      };
      setToken(t);
      AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(t)).catch(() => {});
      return t.accessToken;
    } catch {
      return null;
    }
  }, [token]);

  return {
    isAuthed: !!token,
    loading,
    login,
    logout,
    getAccessToken,
    canPrompt: !!request,
  };
}
