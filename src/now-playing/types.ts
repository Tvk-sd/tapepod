// Now Playing — source-agnostic port. Mock and Spotify both implement it.
// (CONTEXT.md: Now Playing context.)

export interface NowPlayingSnapshot {
  track: { title: string; artist: string; durationMs: number } | null;
  /** Position within the current track, ms. */
  positionMs: number;
  isPlaying: boolean;
  /** When this reading was taken (ms epoch) — anchor for local interpolation. */
  fetchedAt: number;
}

export interface NowPlayingSource {
  /** One reading of current playback. Spotify: GET /me/player. Mock: computed. */
  poll(): Promise<NowPlayingSnapshot>;
}

// What the Deck consumes. Derived by useNowPlaying from the snapshot + local
// interpolation + reel-angle integration.
export interface DeckState {
  progress: number; // 0..1 through the current track
  supplyAngle: number;
  takeupAngle: number;
  isPlaying: boolean;
  trackTitle: string | null;
  trackArtist: string | null;
}
