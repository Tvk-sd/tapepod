// Tape Curation — domain types. (CONTEXT.md: core domain.)
// A Tape is the single loaded collection of tracks. A physical cassette holds a
// bounded amount — so does this: at most MAX_TRACKS.

export interface Track {
  id: string;
  title: string;
  artist: string;
  /** Length in seconds. Sums into the tape's total duration. */
  durationSec: number;
}

export interface Tape {
  title: string;
  tracks: Track[];
}

/** The hard cap. A tape is "full" at 20 — like a real cassette's runtime. */
export const MAX_TRACKS = 20;
