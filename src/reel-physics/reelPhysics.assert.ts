// Standalone assertions for the Reel Physics core (PRD's #1 test target).
// No test runner yet — run directly:  node src/reel-physics/reelPhysics.assert.ts
// (Node >= 23.6 strips the types natively.)

import { reelGeometry } from './reelPhysics.ts';
import type { DeckSpec } from './reelPhysics.ts';

const spec: DeckSpec = { hubRadius: 72, maxRadius: 150 };
let failures = 0;

function ok(name: string, cond: boolean) {
  if (!cond) {
    failures++;
    console.error(`  ✗ ${name}`);
  } else {
    console.log(`  ✓ ${name}`);
  }
}
const near = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) < eps;

// Endpoints: at start, supply is full and take-up is bare hub; reversed at end.
const start = reelGeometry(0, spec);
ok('progress 0 → supply full', near(start.supplyRadius, spec.maxRadius));
ok('progress 0 → take-up bare hub', near(start.takeupRadius, spec.hubRadius));

const end = reelGeometry(1, spec);
ok('progress 1 → supply bare hub', near(end.supplyRadius, spec.hubRadius));
ok('progress 1 → take-up full', near(end.takeupRadius, spec.maxRadius));

// Area conservation: supply² + takeup² is constant across all progress values.
const total = spec.maxRadius ** 2 + spec.hubRadius ** 2;
for (const p of [0, 0.25, 0.5, 0.75, 1]) {
  const g = reelGeometry(p, spec);
  ok(`area conserved @ p=${p}`, near(g.supplyRadius ** 2 + g.takeupRadius ** 2, total));
}

// Spin is inverse to radius: the emptier reel spins faster.
const mid = reelGeometry(0.3, spec); // supply fuller than take-up here
ok('emptier reel spins faster', mid.takeupSpeed > mid.supplySpeed);
ok('full reel spins at 1.0', near(start.supplySpeed, 1));

// Clamping: out-of-range progress is treated as the nearest endpoint.
ok('progress < 0 clamps to 0', near(reelGeometry(-0.5, spec).supplyRadius, spec.maxRadius));
ok('progress > 1 clamps to 1', near(reelGeometry(2, spec).takeupRadius, spec.maxRadius));

console.log(failures === 0 ? '\nAll reel-physics assertions passed.' : `\n${failures} FAILED.`);
process.exit(failures === 0 ? 0 : 1);
