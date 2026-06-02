// Reel Physics — pure math. Given playback progress and the deck spec, compute
// the geometry of both cassette reels. No UI, no side effects.
// (CONTEXT.md: core domain — owns "the feel".)
//
// Model: tape moves supply -> take-up at CONSTANT linear speed (it passes the
// head at a fixed rate). Tape volume is conserved, so the cross-sectional AREA
// of the tape pack is conserved between the two reels. Because area ~ r², the
// pack RADIUS follows a square-root curve in progress — fast change near empty,
// slow near full. That sqrt curve is what makes a real cassette feel mechanical
// rather than linear.
//
// Rotation: for constant linear speed v, angular speed ω = v / r. So an emptier
// reel (small r) spins FASTER and a fuller reel spins SLOWER. The supply reel
// speeds up as it empties; the take-up reel slows as it fills. This inverse
// relationship is the authentic detail — reels do not hold constant RPM.

export interface DeckSpec {
  /** Radius of the bare hub (empty spool). Keep > 0 so radius never hits zero. */
  hubRadius: number;
  /** Radius of a reel wound completely full of tape. */
  maxRadius: number;
}

export interface ReelGeometry {
  /** Radius of the supply (left) tape pack — shrinks as the song plays. */
  supplyRadius: number;
  /** Radius of the take-up (right) tape pack — grows as the song plays. */
  takeupRadius: number;
  /** Relative angular speed of the supply reel (1 = a full reel). */
  supplySpeed: number;
  /** Relative angular speed of the take-up reel (1 = a full reel). */
  takeupSpeed: number;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/**
 * @param progress 0..1 through the loaded tape (0 = start, 1 = end).
 * @param spec     hub + max radii defining the reel geometry.
 */
export function reelGeometry(progress: number, spec: DeckSpec): ReelGeometry {
  const p = clamp01(progress);
  const { hubRadius: h, maxRadius: m } = spec;

  // Area of one full reel's tape pack (π cancels everywhere, so drop it).
  const tapeArea = m * m - h * h;

  // Take-up holds fraction p of the tape; supply holds the rest. Radius is the
  // sqrt of (hub area + held tape area) — area conservation.
  const takeupRadius = Math.sqrt(h * h + p * tapeArea);
  const supplyRadius = Math.sqrt(h * h + (1 - p) * tapeArea);

  // ω ∝ 1/r, normalised so a full reel (r = m) spins at 1.0.
  return {
    supplyRadius,
    takeupRadius,
    supplySpeed: m / supplyRadius,
    takeupSpeed: m / takeupRadius,
  };
}
