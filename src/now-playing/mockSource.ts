import { NowPlayingSource } from './types';

// Mock source — used when not connected to Spotify. Loops a fake track at the
// given duration so the reels keep winding offline. Same port as Spotify.
export function createMockSource(durationSec = 30): NowPlayingSource {
  const start = Date.now();
  const durationMs = durationSec * 1000;
  return {
    async poll() {
      const positionMs = (Date.now() - start) % durationMs;
      return {
        track: { title: 'tape preview', artist: 'mock', durationMs },
        positionMs,
        isPlaying: true,
        fetchedAt: Date.now(),
      };
    },
  };
}
