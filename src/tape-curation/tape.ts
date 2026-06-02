// Tape Curation — pure logic. Owns the tape's invariants. No UI, no storage.
// (CONTEXT.md: "owns the intentionality of the product".)

import { Track, Tape, MAX_TRACKS } from './types';

export const emptyTape = (title = 'untitled'): Tape => ({ title, tracks: [] });

export const isFull = (tape: Tape): boolean => tape.tracks.length >= MAX_TRACKS;

export const hasTrack = (tape: Tape, id: string): boolean =>
  tape.tracks.some((t) => t.id === id);

/**
 * Add a track. Two invariants enforced here:
 *   - the tape is bounded at MAX_TRACKS — a full tape rejects new tracks
 *   - no duplicates — the same song can't appear twice
 * Returns the tape unchanged if either rule blocks the add (callers can compare
 * by reference or check isFull/hasTrack to message the user).
 */
export function addTrack(tape: Tape, track: Track): Tape {
  if (isFull(tape)) return tape;
  if (hasTrack(tape, track.id)) return tape;
  return { ...tape, tracks: [...tape.tracks, track] };
}

export function removeTrack(tape: Tape, id: string): Tape {
  return { ...tape, tracks: tape.tracks.filter((t) => t.id !== id) };
}

/** Total runtime of the tape in seconds — drives the reel timescale. */
export const totalDuration = (tape: Tape): number =>
  tape.tracks.reduce((sum, t) => sum + t.durationSec, 0);
