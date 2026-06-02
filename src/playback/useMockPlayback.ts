import { useEffect, useRef, useState, useCallback } from 'react';
import { reelGeometry, DeckSpec } from '../reel-physics/reelPhysics';

// Mock playback — advances progress so we can SEE the reels wind without wiring
// Spotify / Apple Music yet. Stands in for the Now Playing context (CONTEXT.md).
// Ping-pongs at the ends (winds forward, then back) so there is no full->empty
// snap — this is a feel-tuning toy, not the real transport.

export interface PlaybackState {
  /** 0..1 through the loaded tape. */
  progress: number;
  /** Accumulated supply-reel rotation, radians (for drawing spin). */
  supplyAngle: number;
  /** Accumulated take-up-reel rotation, radians. */
  takeupAngle: number;
  isPlaying: boolean;
}

export interface MockOptions {
  durationSeconds?: number;
  /** Seed the starting position (0..1). Useful for verifying mid-tape render. */
  initialProgress?: number;
  /** Start playing immediately. */
  autoplay?: boolean;
}

// Baseline spin in radians/sec for a FULL reel. Emptier reels scale up from here
// (see reelPhysics). Pure feel knob — turn it up for a livelier deck.
const SPIN_RATE = 2.2;

export function useMockPlayback(spec: DeckSpec, opts: MockOptions = {}) {
  const { durationSeconds = 30, initialProgress = 0, autoplay = true } = opts;

  const [state, setState] = useState<PlaybackState>({
    progress: initialProgress,
    supplyAngle: 0,
    takeupAngle: 0,
    isPlaying: autoplay,
  });

  // Mutable refs the rAF loop reads/writes without forcing re-renders each frame.
  const playing = useRef(autoplay);
  const progress = useRef(initialProgress);
  const dir = useRef<1 | -1>(1); // ping-pong direction
  const supplyAngle = useRef(0);
  const takeupAngle = useRef(0);
  const lastT = useRef<number | null>(null);

  const toggle = useCallback(() => {
    playing.current = !playing.current;
    setState((s) => ({ ...s, isPlaying: playing.current }));
  }, []);

  useEffect(() => {
    let raf: number;

    const tick = (t: number) => {
      const dtMs = lastT.current == null ? 0 : t - lastT.current;
      lastT.current = t;
      const dt = dtMs / 1000; // seconds

      if (playing.current && dt > 0) {
        // Advance, reflecting at the ends so the reels reverse rather than snap.
        let next = progress.current + (dir.current * dt) / durationSeconds;
        if (next >= 1) {
          next = 1 - (next - 1);
          dir.current = -1;
        } else if (next <= 0) {
          next = -next;
          dir.current = 1;
        }
        progress.current = next;

        // Integrate rotation from the per-reel angular speeds; reverse with dir.
        const g = reelGeometry(progress.current, spec);
        supplyAngle.current += dir.current * g.supplySpeed * SPIN_RATE * dt;
        takeupAngle.current += dir.current * g.takeupSpeed * SPIN_RATE * dt;

        setState({
          progress: progress.current,
          supplyAngle: supplyAngle.current,
          takeupAngle: takeupAngle.current,
          isPlaying: true,
        });
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spec, durationSeconds]);

  return { state, toggle };
}
