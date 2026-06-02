import React from 'react';
import Svg, {
  Rect,
  Circle,
  Line,
  G,
  Path,
} from 'react-native-svg';
import { reelGeometry, DeckSpec } from '../reel-physics/reelPhysics';

// Deck — the flat 2D line-art cassette mechanism (CONTEXT.md: Rendering, MVP).
// Pure presentation: consumes progress + reel angles, draws the reels, the tape
// path between them, the registration marks, and the scrubber. No logic.

const YELLOW = '#E9E64B';
const BG = '#0B0B0B';
const WELL_FILL = '#161616';
const WELL_STROKE = '#242424';
const TRACK_GRAY = '#3A3A3A';

// Drawing canvas. Reels sit on the upper area, scrubber along the bottom.
const VB_W = 1000;
const VB_H = 760;
const LEFT = { x: 300, y: 330 };
const RIGHT = { x: 700, y: 330 };
const WELL_R = 180; // the faint outer reel "well"

type Pt = { x: number; y: number };

// External tangent between two circles (the tape path "belt"). Returns the two
// touch points on the chosen side. side = +1 / -1 picks the two sides.
function externalTangent(c1: Pt, r1: number, c2: Pt, r2: number, side: 1 | -1) {
  const dx = c2.x - c1.x;
  const dy = c2.y - c1.y;
  const d = Math.hypot(dx, dy);
  const ux = dx / d;
  const uy = dy / d; // unit center line
  const along = (r1 - r2) / d; // normal component along the center line
  const k = Math.sqrt(Math.max(0, 1 - along * along));
  // N = along * u + side * k * perp(u), where perp(u) = (-uy, ux)
  const nx = along * ux + side * k * -uy;
  const ny = along * uy + side * k * ux;
  return {
    p1: { x: c1.x + r1 * nx, y: c1.y + r1 * ny },
    p2: { x: c2.x + r2 * nx, y: c2.y + r2 * ny },
  };
}

// Four short radial ticks at the pack edge — these make the spin VISIBLE
// (a plain circle spinning shows nothing). Rotated by the reel's angle.
function Ticks({ c, r, angleRad }: { c: Pt; r: number; angleRad: number }) {
  const deg = (angleRad * 180) / Math.PI;
  const len = 14;
  const ticks = [0, 90, 180, 270].map((a) => {
    const rad = (a * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);
    return (
      <Line
        key={a}
        x1={c.x + (r - len) * dx}
        y1={c.y + (r - len) * dy}
        x2={c.x + r * dx}
        y2={c.y + r * dy}
        stroke={YELLOW}
        strokeWidth={2.5}
      />
    );
  });
  return <G transform={`rotate(${deg} ${c.x} ${c.y})`}>{ticks}</G>;
}

// Hub centre mark: '+' for supply, '×' for take-up (matches the reference).
function HubMark({ c, kind }: { c: Pt; kind: 'plus' | 'cross' }) {
  const s = 12;
  const a = kind === 'plus' ? 0 : 45;
  return (
    <G transform={`rotate(${a} ${c.x} ${c.y})`}>
      <Line x1={c.x - s} y1={c.y} x2={c.x + s} y2={c.y} stroke={YELLOW} strokeWidth={2.5} />
      <Line x1={c.x} y1={c.y - s} x2={c.x} y2={c.y + s} stroke={YELLOW} strokeWidth={2.5} />
    </G>
  );
}

interface DeckProps {
  width: number;
  spec: DeckSpec;
  progress: number;
  supplyAngle: number;
  takeupAngle: number;
}

export default function Deck({ width, spec, progress, supplyAngle, takeupAngle }: DeckProps) {
  const height = (width * VB_H) / VB_W;
  const g = reelGeometry(progress, spec);

  // Tape path: external tangents between the two pack circles.
  const top = externalTangent(LEFT, g.supplyRadius, RIGHT, g.takeupRadius, 1);
  const bottom = externalTangent(LEFT, g.supplyRadius, RIGHT, g.takeupRadius, -1);

  // Scrubber geometry.
  const sx = 150;
  const ex = 850;
  const sy = 660;
  const playheadX = sx + (ex - sx) * progress;
  const segCount = 26;
  const segGap = 6;
  const segW = (ex - sx - segGap * (segCount - 1)) / segCount;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${VB_W} ${VB_H}`}>
      <Rect x={0} y={0} width={VB_W} height={VB_H} fill={BG} />

      {/* Reel wells (faint outer circles) */}
      <Circle cx={LEFT.x} cy={LEFT.y} r={WELL_R} fill={WELL_FILL} stroke={WELL_STROKE} strokeWidth={2} />
      <Circle cx={RIGHT.x} cy={RIGHT.y} r={WELL_R} fill={WELL_FILL} stroke={WELL_STROKE} strokeWidth={2} />

      {/* Tape path (the yellow belt wrapping both packs) */}
      <Line x1={top.p1.x} y1={top.p1.y} x2={top.p2.x} y2={top.p2.y} stroke={YELLOW} strokeWidth={2} />
      <Line x1={bottom.p1.x} y1={bottom.p1.y} x2={bottom.p2.x} y2={bottom.p2.y} stroke={YELLOW} strokeWidth={2} />

      {/* Tape packs (filled with bg so the belt appears to wrap the rim) */}
      <Circle cx={LEFT.x} cy={LEFT.y} r={g.supplyRadius} fill={BG} stroke={YELLOW} strokeWidth={3} />
      <Circle cx={RIGHT.x} cy={RIGHT.y} r={g.takeupRadius} fill={BG} stroke={YELLOW} strokeWidth={3} />

      {/* Spin made visible + hub marks */}
      <Ticks c={LEFT} r={g.supplyRadius} angleRad={supplyAngle} />
      <Ticks c={RIGHT} r={g.takeupRadius} angleRad={takeupAngle} />
      <HubMark c={LEFT} kind="plus" />
      <HubMark c={RIGHT} kind="cross" />

      {/* Scrubber: segmented gray track, yellow progress fill, playhead block */}
      {Array.from({ length: segCount }).map((_, i) => {
        const x = sx + i * (segW + segGap);
        const filled = x + segW <= playheadX;
        return (
          <Rect
            key={i}
            x={x}
            y={sy}
            width={segW}
            height={10}
            rx={2}
            fill={filled ? YELLOW : TRACK_GRAY}
          />
        );
      })}
      <Line x1={playheadX} y1={sy - 26} x2={playheadX} y2={sy + 28} stroke={YELLOW} strokeWidth={2} />
      <Rect x={playheadX - 13} y={sy - 46} width={26} height={22} rx={4} fill={YELLOW} />
    </Svg>
  );
}
