import { useEffect, useState, useCallback } from 'react';
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

interface Token {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // ms epoch
}

export function useSpotifyAuth() {
  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Exchange the auth code for tokens once the redirect returns.
  useEffect(() => {
    if (response?.type === 'success' && request?.codeVerifier) {
      AuthSession.exchangeCodeAsync(
        {
          clientId: SPOTIFY_CLIENT_ID,
          code: response.params.code,
          redirectUri: REDIRECT_URI,
          extraParams: { code_verifier: request.codeVerifier },
        },
        SPOTIFY_DISCOVERY,
      )
        .then((res) => {
          const t: Token = {
            accessToken: res.accessToken,
            refreshToken: res.refreshToken ?? '',
            expiresAt: Date.now() + (res.expiresIn ?? 3600) * 1000,
          };
          setToken(t);
          AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(t)).catch(() => {});
        })
        .catch(() => {});
    }
  }, [response, request]);

  const login = useCallback(() => {
    promptAsync();
  }, [promptAsync]);

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
