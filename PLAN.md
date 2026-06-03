# PLAN — Spotify control: Tapepod as a player (Web Playback SDK)

## Goal
Tapepod becomes a Spotify player in the browser tab (Premium). Play/pause/skip
from the app; reels driven by SDK events (kills the ~2s mirror delay).

## Approach
- Web Playback SDK (`https://sdk.scdn.co/spotify-player.js`, web-only, Premium).
- Creates a "Tapepod" device in Spotify Connect.
- On a user gesture (deck tap), activate audio + transfer playback here.
- player_state_changed events → cached snapshot → existing useNowPlaying (no poll lag).
- Controls: play/pause (deck tap), prev/next buttons.

## Scope changes (forces re-consent)
- Add scopes: streaming, user-read-email, user-read-private, user-modify-playback-state.
- Till must logout → reconnect to grant new scopes.

## Known limits
- Web-only. iOS uses native App Remote SDK later (separate).
- "Play MY curated tape" needs real Spotify track URIs = Phase 2 (real catalog).
  This step controls the user's actual Spotify playback in-browser; loading a
  specific album as the tape comes with Phase 2.
- Browser autoplay policy: audio must start from a click (deck tap = gesture).
- Best in Chrome; Safari support is flaky.

## Steps
- [ ] config: add scopes
- [ ] src/spotify/useWebPlayback.ts — load SDK, init player, connect, state+controls
- [ ] NowPlayingSource backed by SDK event cache (web, when connected)
- [ ] App: controls row (prev / play-pause / next), deck tap = play/pause
- [ ] verify compile + render; Till live-tests playback
- [ ] commit

## Notes
- (none yet)
