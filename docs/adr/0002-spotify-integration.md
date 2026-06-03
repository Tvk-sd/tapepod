# ADR-0002 — Spotify integration: Web API, mirror-first, client-side PKCE

- **Status:** Accepted — 2026-06-03
- **Context owner:** Now Playing + Album Catalog contexts

## Issue

We need real Spotify data flowing into Tapepod in a way we can **test now**, with
the least surface area. Spotify exposes three different APIs with very different
capabilities and constraints; picking the wrong one stalls testing.

## Decision

1. **Use the Spotify Web API (REST), not the Web Playback SDK.** The Web Playback
   SDK is browser-only and Premium-only; it won't run on iOS. The Web API works on
   web *and* native and covers everything we need to test (current playback state,
   search, albums).

2. **Mirror first.** The first testable milestone is *reading* the user's current
   Spotify playback (`GET /me/player`) and driving the reels from real
   `progress_ms` / `is_playing`. This validates the Now Playing → Reel Physics
   pipeline with real data, works on **Spotify Free**, and needs no playback
   control. Controlling playback (playing the loaded tape) comes later and needs
   Premium.

3. **Client-side OAuth 2.0 with PKCE — no backend.** PKCE issues access + refresh
   tokens without a client secret, so the test build needs no server. (A token
   broker — e.g. a Supabase edge function — is a production hardening option, not a
   testing blocker.)

4. **Ports & adapters.** Define source-agnostic interfaces (`NowPlayingSource`,
   `Catalog`); the mock and Spotify both implement them. Switching source is a
   config flag, so offline/mock development continues unaffected.

## Hard constraints (verified)

- **Redirect URI:** `localhost` is **rejected** since 2025-04-09. Use the loopback
  IP `http://127.0.0.1:8081` for web, and a custom app scheme for native. HTTP is
  only permitted for loopback addresses.
- **Implicit grant is deprecated** — Authorization Code + PKCE only.
- **Premium gates control:** reading `/me/player` works on Free; `PUT /me/player/play`
  and the Web Playback SDK require Premium.
- **Dev-mode apps** are limited to ~25 manually allowlisted Spotify accounts.

## Consequences

- Fast path to testing real data without Premium or a backend.
- Mock adapters stay; they become the offline contract the Spotify adapters must match.
- Playing the *loaded tape* (vs mirroring whatever's on Spotify) is deferred to a
  Premium phase. Album-level reel progress (PRD story 4) is likewise deferred —
  mirror mode tests track-level progress.
- Full design: `docs/design/spotify-integration.md`.
