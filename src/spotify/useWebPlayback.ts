import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { NowPlayingSnapshot, NowPlayingSource } from '../now-playing/types';

// Web Playback SDK — turns the browser tab into a Spotify Connect device named
// "Tapepod" (Premium, web-only). Gives event-based playback state (no poll lag)
// and transport control. Every window/document/SDK reference is web-guarded so
// the native build doesn't crash.

const SDK_SRC = 'https://sdk.scdn.co/spotify-player.js';

declare global {
  interface Window {
    Spotify?: any;
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

const IDLE: NowPlayingSnapshot = { track: null, positionMs: 0, isPlaying: false, fetchedAt: 0 };

export function useWebPlayback(
  isAuthed: boolean,
  getAccessToken: () => Promise<string | null>,
) {
  const [ready, setReady] = useState(false);
  const player = useRef<any>(null);
  const deviceId = useRef<string | null>(null);
  const snap = useRef<NowPlayingSnapshot>({ ...IDLE });
  const activated = useRef(false);

  // Keep the token fn current without re-initialising the player each refresh.
  const tokenFn = useRef(getAccessToken);
  useEffect(() => {
    tokenFn.current = getAccessToken;
  }, [getAccessToken]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !isAuthed || typeof document === 'undefined') return;
    let cancelled = false;

    const init = () => {
      if (cancelled || !window.Spotify) return;
      const p = new window.Spotify.Player({
        name: 'Tapepod',
        getOAuthToken: (cb: (t: string) => void) => {
          tokenFn.current().then((t) => t && cb(t));
        },
        volume: 0.8,
      });
      player.current = p;

      p.addListener('ready', ({ device_id }: any) => {
        deviceId.current = device_id;
        setReady(true);
      });
      p.addListener('not_ready', () => setReady(false));
      p.addListener('player_state_changed', (state: any) => {
        if (!state) {
          snap.current = { ...IDLE, fetchedAt: Date.now() };
          return;
        }
        const t = state.track_window?.current_track;
        snap.current = {
          track: t
            ? {
                title: t.name,
                artist: (t.artists ?? []).map((a: any) => a.name).join(', '),
                durationMs: t.duration_ms ?? state.duration ?? 0,
              }
            : null,
          positionMs: state.position ?? 0,
          isPlaying: !state.paused,
          fetchedAt: Date.now(),
        };
      });

      p.connect();
    };

    if (window.Spotify) {
      init();
    } else {
      window.onSpotifyWebPlaybackSDKReady = init;
      if (!document.querySelector(`script[src="${SDK_SRC}"]`)) {
        const s = document.createElement('script');
        s.src = SDK_SRC;
        s.async = true;
        document.body.appendChild(s);
      }
    }

    return () => {
      cancelled = true;
      try {
        player.current?.disconnect();
      } catch {}
      setReady(false);
    };
  }, [isAuthed]);

  // The SDK cache exposed as a NowPlayingSource (poll returns latest event state).
  const source = useRef<NowPlayingSource>({
    async poll() {
      return { ...snap.current, fetchedAt: Date.now() };
    },
  }).current;

  const ensureActive = useCallback(async () => {
    const p = player.current;
    if (p && !activated.current && typeof p.activateElement === 'function') {
      try {
        await p.activateElement(); // browser autoplay policy: unlock audio on a gesture
      } catch {}
      activated.current = true;
    }
  }, []);

  // First play: nothing is on this device yet -> transfer the user's playback here.
  const transferHere = useCallback(async () => {
    const id = deviceId.current;
    const tok = await tokenFn.current();
    if (!id || !tok) return;
    await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_ids: [id], play: true }),
    }).catch(() => {});
  }, []);

  const toggle = useCallback(async () => {
    const p = player.current;
    if (!p) return;
    await ensureActive();
    const state = await p.getCurrentState();
    if (!state) await transferHere(); // device idle -> bring playback to Tapepod
    else await p.togglePlay();
  }, [ensureActive, transferHere]);

  const next = useCallback(async () => {
    await ensureActive();
    player.current?.nextTrack?.();
  }, [ensureActive]);

  const prev = useCallback(async () => {
    await ensureActive();
    player.current?.previousTrack?.();
  }, [ensureActive]);

  return { ready, source, controls: { toggle, next, prev } };
}
