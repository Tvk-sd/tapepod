# Product

## Register

product

## Users

Design-literate iOS music listeners (roughly 25–38) who own objects they chose on purpose: mechanical keyboards, record players, Teenage Engineering gear. They listen on Spotify or Apple Music but want the act of playing music to feel deliberate and physical, not passive mirroring. Context: home screen glance, pocket session, one album loaded at a time.

## Product Purpose

Tapepod is a cassette-tape music widget and interactive player. The widget is the crafted shop window; the app is where you load one album (up to 20 tracks) into the deck and watch supply and take-up reels reflect real playback. Success: the interface disappears into the task while the deck feels like a precision object worth keeping on the home screen and worth the one-time premium unlock.

## Brand Personality

Intentional, weighty, crafted. Voice is quiet and confident: hardware labeling, not marketing copy. The deck reads like Teenage Engineering registration marks and line art, not illustration for its own sake. Delight comes from mechanics (reels, load, progress), not decoration.

## Anti-references

- SaaS dashboard patterns: card grids, gradient accents, hero metrics, eyebrow kickers, ghost-card borders with wide drop shadows, modal-first flows for simple tasks.
- Generic streaming app chrome that could be reskinned Spotify or Apple Music.
- Passive mirror widgets where the UI spins but never reflects deliberate curation.

Note: VinylPod-style decorative spin and crowded vinyl aesthetics are out of scope for the product metaphor; cassette mechanics and bounded tape loading are the differentiator.

## Design Principles

1. **Object first.** Every screen serves the deck or loading the tape; nothing competes with the mechanism.
2. **Deliberate load.** One album, max 20 tracks. Empty and full states teach the metaphor; never look broken.
3. **Mechanics are the UI.** Reel geometry, scrubber, play state, and pause behavior carry information; avoid redundant chrome.
4. **Earned familiarity.** Controls and density should feel trustworthy to someone who uses Linear or native iOS music apps; invent affordances only when the cassette metaphor requires it.
5. **MVP honesty.** Ship flat 2D line-art (ADR-0001 Direction A) with yellow accent on near-black; defer 3D Walkman until it can match the same craft bar.

## Accessibility & Inclusion

Target **WCAG 2.1 AAA where feasible** on in-app UI: contrast on small labels (play/pause, track meta), minimum touch targets, visible focus, and `prefers-reduced-motion` respected for reel animation and transitions. iOS VoiceOver labels on transport and tape actions. Dark UI is the default (`userInterfaceStyle: dark`); do not rely on low-contrast grey for essential controls.
