// Standalone assertions for Tape Curation invariants.
// Run:  node src/tape-curation/tape.assert.ts   (Node >= 23.6 strips types)

import { emptyTape, addTrack, removeTrack, isFull, totalDuration } from './tape.ts';
import { MAX_TRACKS } from './types.ts';
import type { Track } from './types.ts';

let failures = 0;
function ok(name: string, cond: boolean) {
  if (!cond) { failures++; console.error(`  ✗ ${name}`); }
  else console.log(`  ✓ ${name}`);
}

const track = (id: string, dur = 200): Track => ({ id, title: id, artist: 'x', durationSec: dur });

// Add + total duration
let t = emptyTape();
t = addTrack(t, track('a', 100));
t = addTrack(t, track('b', 150));
ok('adds tracks', t.tracks.length === 2);
ok('sums duration', totalDuration(t) === 250);

// Dedupe: same id twice is a no-op
const before = t;
t = addTrack(t, track('a', 100));
ok('rejects duplicate', t === before && t.tracks.length === 2);

// Remove
t = removeTrack(t, 'a');
ok('removes track', t.tracks.length === 1 && t.tracks[0].id === 'b');

// Cap: filling to MAX, then the next add is rejected
let cap = emptyTape();
for (let i = 0; i < MAX_TRACKS; i++) cap = addTrack(cap, track(`c${i}`));
ok('fills to MAX_TRACKS', cap.tracks.length === MAX_TRACKS && isFull(cap));
const capBefore = cap;
cap = addTrack(cap, track('overflow'));
ok('rejects 21st track', cap === capBefore && cap.tracks.length === MAX_TRACKS);

// Empty tape
ok('empty tape has zero duration', totalDuration(emptyTape()) === 0);
ok('empty tape is not full', !isFull(emptyTape()));

console.log(failures === 0 ? '\nAll tape-curation assertions passed.' : `\n${failures} FAILED.`);
process.exit(failures === 0 ? 0 : 1);
