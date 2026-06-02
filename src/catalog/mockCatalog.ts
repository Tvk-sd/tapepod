import { Track } from '../tape-curation/types';

// Mock catalog — stands in for the Album Catalog context until Spotify / Apple
// Music are wired (CONTEXT.md). Same Track shape the real loader will return, so
// only the source swaps later — the curation flow above it stays identical.

export const MOCK_CATALOG: Track[] = [
  { id: 't1', title: 'Midnight City', artist: 'M83', durationSec: 244 },
  { id: 't2', title: 'Nightcall', artist: 'Kavinsky', durationSec: 257 },
  { id: 't3', title: 'Teardrop', artist: 'Massive Attack', durationSec: 329 },
  { id: 't4', title: 'Genesis', artist: 'Grimes', durationSec: 254 },
  { id: 't5', title: 'Oblivion', artist: 'Grimes', durationSec: 251 },
  { id: 't6', title: 'Time', artist: 'Hans Zimmer', durationSec: 275 },
  { id: 't7', title: 'Strobe', artist: 'deadmau5', durationSec: 627 },
  { id: 't8', title: 'Innerbloom', artist: 'RÜFÜS DU SOL', durationSec: 593 },
  { id: 't9', title: 'Resonance', artist: 'HOME', durationSec: 213 },
  { id: 't10', title: 'Sunset Lover', artist: 'Petit Biscuit', durationSec: 234 },
  { id: 't11', title: 'Open Eye Signal', artist: 'Jon Hopkins', durationSec: 477 },
  { id: 't12', title: 'An Ending (Ascent)', artist: 'Brian Eno', durationSec: 264 },
];

export const fmtDuration = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};
