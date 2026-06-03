import { NowPlayingSnapshot, NowPlayingSource } from './types';

// SpotifyNowPlaying — reads the user's current playback (mirror mode).
// GET /me/player returns 204 when no device is active -> treated as "nothing
// playing", not an error.

const IDLE: NowPlayingSnapshot = {
  track: null,
  positionMs: 0,
  isPlaying: false,
  fetchedAt: 0,
};

export async function fetchNowPlaying(accessToken: string): Promise<NowPlayingSnapshot> {
  const res = await fetch('https://api.spotify.com/v1/me/player', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // 204/202 = no active device / nothing playing.
  if (res.status === 204 || res.status === 202) {
    return { ...IDLE, fetchedAt: Date.now() };
  }
  if (!res.ok) throw new Error(`spotify /me/player ${res.status}`);

  const d: any = await res.json();
  const item = d.item;
  return {
    track: item
      ? {
          title: item.name,
          artist: (item.artists ?? []).map((a: any) => a.name).join(', '),
          durationMs: item.duration_ms ?? 0,
        }
      : null,
    positionMs: d.progress_ms ?? 0,
    isPlaying: !!d.is_playing,
    fetchedAt: Date.now(),
  };
}

export function createSpotifySource(
  getAccessToken: () => Promise<string | null>,
): NowPlayingSource {
  return {
    async poll() {
      const token = await getAccessToken();
      if (!token) return { ...IDLE, fetchedAt: Date.now() };
      return fetchNowPlaying(token);
    },
  };
}
