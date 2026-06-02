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
| **Tape Curation** (add songs) | `src/tape-curation/` — types, pure logic, persistence hook, editor UI |
| Mock catalog (stand-in Album Catalog) | `src/catalog/mockCatalog.ts` |
| Screen + chrome | `App.tsx` — header, title, pills, tap-to-pause, add-songs |

## Repo
Public: https://github.com/Tvk-sd/tapepod (account Tvk-sd)

## Verified

- Reel math: `npx tsx src/reel-physics/reelPhysics.assert.ts` — 13/13 pass.
- Tape curation: `npx tsx src/tape-curation/tape.assert.ts` — 8/8 pass
  (add, dedupe, remove, 20-track cap rejects 21st, duration, empty tape).
- Render at p≈0 and p=0.5 via headless screenshot. Add-songs editor + empty
  "no tape loaded" state verified by screenshot.

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
- Wire jest-expo so the assertions run as `npm test` (currently `npx tsx`).
- Album label / artwork on the tape (PRD 19).
- Real Album Catalog (Spotify / Apple Music) behind the mock catalog's interface.
- Real Now Playing engine behind the mock playback interface.
- iOS simulator pass (the SVG + RN UI should port unchanged).
- Polish: "done" button right-edge padding in TapeEditor at narrow widths.

## Feel knobs (Till tunes by eye)

- `SPEC.hubRadius` / `SPEC.maxRadius` (`App.tsx`) — reel size swing range
- `SPIN_RATE` (`useMockPlayback.ts`) — base spin speed
- `durationSeconds` (`App.tsx`) — how fast the mock tape plays through
