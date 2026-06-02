# Tapepod — Project Tracker

## Status: 2D Deck MVP — first visual milestone shipped ✅

A flat 2D line-art cassette **Deck** renders and animates on web (localhost),
matching the reference image. Reel winding is driven by the area-conserving Reel
Physics core.

## What exists

| Area | State |
|------|-------|
| Concept / domain model | `CONTEXT.md` (DDD: contexts, aggregates, glossary, user stories) |
| Visual direction | `docs/adr/0001-visual-direction.md` — **A (2D) = MVP, B (3D) = vision** |
| Expo app (web + iOS targets) | scaffolded, runs |
| Reel Physics (core, pure math) | `src/reel-physics/reelPhysics.ts` — 13 assertions pass |
| Mock playback (stand-in Now Playing) | `src/playback/useMockPlayback.ts` — ping-pong loop |
| Deck renderer (SVG) | `src/deck/Deck.tsx` — reels, tape belt, ticks, scrubber |
| Screen + chrome | `App.tsx` — header, title, pills, tap-to-pause |

## Verified

- Reel math: `node src/reel-physics/reelPhysics.assert.ts` — 13/13 pass
  (endpoints, area conservation, inverse spin, clamping).
- Render at p≈0 (lopsided reels, converging belt) and p=0.5 (equal reels,
  parallel belt) via headless screenshot. Layout correct across the range.

## NOT yet verified

- **Motion / feel** — that the reels animate smoothly and feel "weighty, not
  jumpy" (the PRD's #1 risk). Headless stills can't show this. Needs a human
  watching `localhost:8081`. This is Till's aesthetic call.

## Run it

```
npx expo start --web      # then open http://localhost:8081
```

## Next candidates (not started)

- Tune the feel knobs by eye (SPEC radii, SPIN_RATE, duration) — see below.
- Reel Physics: wire jest-expo so the assertions run as `npm test`.
- Album label on the tape (PRD 19); "no tape loaded" state (PRD 25).
- Real Now Playing engine (Spotify / Apple Music) behind the mock's interface.
- iOS simulator pass (the SVG should port unchanged).

## Feel knobs (Till tunes by eye)

- `SPEC.hubRadius` / `SPEC.maxRadius` (`App.tsx`) — reel size swing range
- `SPIN_RATE` (`useMockPlayback.ts`) — base spin speed
- `durationSeconds` (`App.tsx`) — how fast the mock tape plays through
