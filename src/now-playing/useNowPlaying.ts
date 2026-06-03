import { useEffect, useRef, useState, useCallback } from 'react';
import { reelGeometry, DeckSpec } from '../reel-physics/reelPhysics';
import { NowPlayingSource, DeckState } from './types';

// useNowPlaying — drives the Deck from any NowPlayingSource.
//
// The feel problem: a source can only be polled every ~2s, but the reels need to
// move every frame. So we DON'T render poll values directly:
//   - a per-frame rAF loop advances position locally (smooth)
//   - every pollMs we read the source's true position and EASE toward it,
//     snapping only on a big drift or a track/play-state change.
// This keeps the "weighty, not jumpy" feel while staying honest to the source.

const SPIN_RATE = 2.2;     // base spin (rad/s) for a full reel
const SNAP_MS = 2000;      // drift past this -> snap instead of ease
const EASE = 0.3;          // fraction of drift corrected per poll

const EMPTY: DeckState = {
  progress: 0,
  supplyAngle: 0,
  takeupAngle: 0,
  isPlaying: false,
  trackTitle: null,
  trackArtist: null,
};

export function useNowPlaying(source: NowPlayingSource, spec: DeckSpec, pollMs = 2000) {
  const [state, setState] = useState<DeckState>(EMPTY);

  const pos = useRef(0);
  const dur = useRef(1);
  const srcPlaying = useRef(false);
  const localPause = useRef(false);
  const title = useRef<string | null>(null);
  const artist = useRef<string | null>(null);
  const supply = useRef(0);
  const takeup = useRef(0);
  const lastT = useRef<number | null>(null);

  const toggle = useCallback(() => {
    localPause.current = !localPause.current;
  }, []);

  // Poll loop: read truth, resync local position toward it.
  useEffect(() => {
    let alive = true;
    const doPoll = async () => {
      try {
        const s = await source.poll();
        if (!alive) return;
        srcPlaying.current = s.isPlaying;
        dur.current = s.track?.durationMs || 1;
        const changed = s.track?.title !== title.current;
        title.current = s.track?.title ?? null;
        artist.current = s.track?.artist ?? null;

        const drift = s.positionMs - pos.current;
        if (changed || Math.abs(drift) > SNAP_MS) {
          pos.current = s.positionMs; // snap
        } else {
          pos.current += drift * EASE; // ease toward truth
        }
      } catch {
        // keep last known state on a failed poll
      }
    };
    doPoll();
    const id = setInterval(doPoll, pollMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [source, pollMs]);

  // Per-frame advance + reel-angle integration.
  useEffect(() => {
    let raf: number;
    const tick = (t: number) => {
      const dt = lastT.current == null ? 0 : (t - lastT.current) / 1000;
      lastT.current = t;

      const playing = srcPlaying.current && !localPause.current;
      if (playing && dt > 0) {
        pos.current = Math.min(dur.current, pos.current + dt * 1000);
        const progress = dur.current > 0 ? pos.current / dur.current : 0;
        const g = reelGeometry(progress, spec);
        supply.current += g.supplySpeed * SPIN_RATE * dt;
        takeup.current += g.takeupSpeed * SPIN_RATE * dt;
      }

      const progress = dur.current > 0 ? Math.max(0, Math.min(1, pos.current / dur.current)) : 0;
      setState({
        progress,
        supplyAngle: supply.current,
        takeupAngle: takeup.current,
        isPlaying: playing,
        trackTitle: title.current,
        trackArtist: artist.current,
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spec]);

  return { state, toggle };
}
