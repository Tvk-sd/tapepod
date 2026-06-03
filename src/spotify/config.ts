import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';

// Spotify app config. Client ID is public (PKCE needs no secret) and read from
// EXPO_PUBLIC_SPOTIFY_CLIENT_ID at build time.
export const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? '';

export const SPOTIFY_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

// Read (mirror) + control (Web Playback SDK). `streaming` + user-read-email/private
// are required by the Web Playback SDK; user-modify-playback-state lets us transfer
// playback to the Tapepod device and skip tracks.
export const SPOTIFY_SCOPES = [
  'user-read-playback-state',
  'user-read-currently-playing',
  'user-modify-playback-state',
  'streaming',
  'user-read-email',
  'user-read-private',
];

// Web: the loopback IP exactly — Spotify rejects `localhost` (see ADR-0002).
// Open the app at http://127.0.0.1:8081 for the redirect to match.
// Native: the custom scheme registered as tapepod://callback.
export const REDIRECT_URI =
  Platform.OS === 'web'
    ? 'http://127.0.0.1:8081'
    : makeRedirectUri({ scheme: 'tapepod', path: 'callback' });
