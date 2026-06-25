# Tapepod — Handoff (project paused)

**Paused:** 2026-06-24 · **Branch:** `main` · **Last commit:** `91f7012`

> BLUF: Working 2D cassette Deck MVP with live Spotify playback control
> (play/pause/skip drives the reels). Project is being **paused**. Two loose
> ends to know about before resuming — an unpushed commit and a parked stash
> (see "Loose ends" below). Next feature when work resumes is **Spotify Phase 2
> (real catalog)**.

---

## Loose ends — read first

| # | Thing | State | Action when resuming |
|---|-------|-------|----------------------|
| 1 | Latest commit `91f7012` ("Add design system docs and polish the app shell") | **Local only — `main` is ahead of `origin/main` by 1.** Not backed up to GitHub. | `git push` to back it up (decide before relying on it). |
| 2 | Cassette visual-direction rework | **Parked in `stash@{0}`** ("cassette visual direction - parked"). Till reviewed it and preferred the previous version, so it was stashed, not committed. Includes a new `src/deck/Cassette.tsx`, a draft `docs/adr/0003-archive-cassette-visual-direction.md`, and edits to App/Deck/TapeEditor/tokens + design docs. | Decide: revisit (`git stash pop`) or discard (`git stash drop`). Don't let it rot — a stash is easy to forget. |

## Where things stand

A flat 2D line-art cassette **Deck** renders and animates on web. Reels are
driven by the area-conserving Reel Physics core. Spotify is wired for **real
playback control** in the browser.

| Area | State |
|------|-------|
| Concept / domain model | `CONTEXT.md` (contexts, aggregates, glossary, user stories) |
| Visual direction | `docs/adr/0001-visual-direction.md` — A (2D) = MVP, B (3D) = vision |
| Expo app (web + iOS targets) | scaffolded, runs |
| Reel Physics (pure core) | `src/reel-physics/reelPhysics.ts` — 13 assertions pass |
| Deck renderer (SVG) | `src/deck/Deck.tsx` — reels, tape belt, ticks, scrubber |
| Tape Curation | `src/tape-curation/` — types, logic, persistence, editor UI |
| Mock catalog (stand-in) | `src/catalog/mockCatalog.ts` — fake track ids |
| Spotify Phase 1 (mirror) | DONE, live-tested. PKCE auth; mirror drives reels. |
| Spotify Phase 3 (control) | DONE, live-tested. `src/spotify/useWebPlayback.ts` — app is a Spotify device, event-driven reels. Web only. |
| Screen + chrome | `App.tsx` — header ▶ PLAY control, title, pills, add-songs |

## Verified

- Reel math: `npx tsx src/reel-physics/reelPhysics.assert.ts` — 13/13.
- Tape curation: `npx tsx src/tape-curation/tape.assert.ts` — 8/8.
- Render + add-songs editor + empty state via headless screenshot.
- Spotify control: live-tested in browser (play/pause/skip).

## NOT verified

- **Motion / feel** — whether reels animate "weighty, not jumpy" (PRD #1 risk).
  Needs a human watching `localhost:8081`. Till's aesthetic call.

## Next when resuming (priority order)

1. **Spotify Phase 2 — SpotifyCatalog**: search + load real albums so a *curated
   tape* plays real Spotify tracks (mock catalog has fake ids today).
2. Resolve the parked cassette stash (loose end #2).
3. iOS: native App Remote SDK for playback (web SDK is browser-only).
4. iOS simulator pass (SVG + RN UI should port unchanged).
5. Polish: "done" button right-edge padding in TapeEditor at narrow widths.

## Run it

```
npx expo start --web      # then open http://localhost:8081
```

## Feel knobs (Till tunes by eye)

- `SPEC.hubRadius` / `SPEC.maxRadius` (`App.tsx`) — reel size swing range
- `SPIN_RATE` (`src/playback/useMockPlayback.ts`) — base spin speed
- `durationSeconds` (`App.tsx`) — mock tape play-through speed

## Repo

Public: https://github.com/Tvk-sd/tapepod
