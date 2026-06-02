# ADR-0001 — Visual direction of the Deck

- **Status:** Accepted — 2026-06-03
- **Date:** 2026-06-03
- **Decision:** Direction **A** is the MVP. Direction **B** is the long-term vision.
- **Context owner:** Tapepod / Rendering bounded context

## Issue

The PRD ([PRD-001](../PRD-001-tapepod-mvp.md)) and the latest reference image point
in two different visual directions for the **Deck** (the player itself). We need to
decide which is the destination before building the Rendering context.

This decision is **isolated to Rendering**. The core domain — Tape Curation, Reel
Physics, Now Playing — is render-agnostic (Reel Physics is pure math by design), so
the rest of [CONTEXT.md](../../CONTEXT.md) holds either way.

## The two directions

### A — Flat 2D line-art *(the reference image)*
Monochrome deck, single yellow accent, Teenage Engineering registration marks
(`+` / `×` reel centers, crosshairs), a clean tape path between two hubs, a
scrubber timeline below. Looks like a flat, head-on rendering of a cassette mechanism.

- **For:** fastest path to a player that *looks finished*; the reel feel (the #1
  PRD risk) can be locked early with Skia/SVG; reads as crafted and intentional;
  trivially reusable as the Widget face.
- **Against:** less "physical object" than the PRD's stated ambition; no obvious
  home for the gyroscope-tilt premium hook.

### B — 3D transparent Walkman *(the PRD as written)*
A 3D cassette player with realistic material depth, reflections, housing shadow,
and **device-tilt parallax** via the gyroscope. The "Teenage Engineering object you
can feel the weight of."

- **For:** matches the PRD's premium thesis; the tilt interaction is a strong
  paid-unlock differentiator vs. VinylPod's flat spin.
- **Against:** 3D in Expo (react-three-fiber / expo-gl) is heavy; "transparent
  Walkman" material quality is genuinely hard to nail — high risk of an ugly first
  result; slower to a reactable visual.

## Decision

**A is the MVP; B is the vision.**

Ship the flat 2D line-art Deck (direction A) — it is the fastest route to a player
that looks finished and to locking the reel feel, which the PRD names as the #1 risk.
The 3D transparent Walkman with gyroscope tilt (direction B) remains the long-term
destination and will be revisited as a premium layer behind its own ADR once the
reel feel and MVP are shipped.

This is safe because Reel Physics is pure math — its reel-geometry output feeds the
3D renderer unchanged later. Building A now does not foreclose B.

## Consequences

- **Rendering (MVP):** Skia/SVG, flat 2D, monochrome + yellow accent, TE registration
  marks. The Deck doubles as the Widget face.
- **Motion Engine:** **out of MVP scope.** Deferred to the vision (direction B).
  Tilt user stories (PRD 21, 22) are post-MVP.
- **Reel Physics:** unchanged — the same geometry output drives the 2D Deck now and
  the 3D Deck later.
- **B revisited later:** the 3D Walkman becomes a future enhancement behind a new ADR,
  scoped only if the tilt interaction earns its complexity.
