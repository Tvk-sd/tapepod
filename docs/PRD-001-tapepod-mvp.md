# PRD-001 — Tapepod MVP

## Problem Statement

Music listeners who care deeply about design and physical objects have no home screen widget that treats music as an intentional, tactile experience. The dominant option in this space — VinylPod — is passive and weightless: a spinning disc that mirrors whatever happens to be playing, with a paywall around basic widget sizes and no creative expression beyond watching something rotate. It looks decorative. It doesn't feel like an object.

The user this product is for — design-literate, 25–38, owns things they didn't need (a mechanical keyboard, an Alessi coffee maker, a record player) — can immediately tell the difference between something crafted and something reskinned. They want to participate in design culture at an accessible price point. VinylPod does not give them that. The vinyl aesthetic is already crowded; the cassette tape format — with its connotations of mixtapes, Walkmans, deliberate curation — is underserved.

The specific gap: no music widget makes the act of choosing what to listen to feel meaningful, and none feels physically present on the screen.

## Solution

Tapepod is a cassette tape music widget and interactive player for iOS. It has two faces:

**The widget** — a lovingly rendered ambient home screen presence showing the cassette deck. Static but crafted. The shop window.

**The app** — a 3D physical cassette player that responds to device tilt via the gyroscope, giving the object weight and depth. The tape reels are functional: the supply reel shrinks and the take-up reel grows in real time as a song plays, reflecting both song progress and album duration. Loading a tape is a deliberate act: the user selects one album (up to 20 tracks) to load into the deck. This is the payoff for unlocking premium.

The aesthetic reference is the transparent Sony Walkman — precision hardware, visible mechanics, nothing decorative that isn't also structural. The product should feel like a Teenage Engineering object: intentional, weighty, and worth $4.99.

## User Stories

1. As a design-conscious iOS user, I want a home screen widget that shows my currently playing music through a cassette tape aesthetic, so that my home screen feels curated and intentional.
2. As a user, I want the cassette tape reels to spin in real time as my music plays, so that the widget feels alive rather than decorative.
3. As a user, I want the supply reel to visibly shrink and the take-up reel to visibly grow as a song progresses, so that I can see how far through the track I am at a glance.
4. As a user, I want the reel sizes to reflect the album's total duration across all tracks, so that I understand how much of the full album remains.
5. As a user, I want to open the app and see a 3D cassette player that responds to how I tilt my device, so that the object feels like it has physical weight and presence.
6. As a user, I want the 3D player to show realistic material depth — reflections, housing shadows, mechanical detail — so that it reads as a physical object rather than a flat illustration.
7. As a user, I want to select one album to "load into the deck", so that my listening session feels like a deliberate choice rather than passive mirroring.
8. As a user, I want the app to enforce a maximum of 20 tracks per loaded tape, so that the curation feels intentional and bounded like a physical cassette.
9. As a user, I want to connect my Spotify account, so that I can play and display music from my Spotify library.
10. As a user, I want to connect my Apple Music account, so that I can play and display music from my Apple Music library.
11. As a user, I want the widget to display the album artwork of the currently loaded tape, so that I can identify what's playing at a glance.
12. As a user, I want the widget to update in real time as the song progresses, so that the reel animation reflects my actual playback state.
13. As a user, I want the free version to show the widget on my home screen, so that I can experience Tapepod before committing to a purchase.
14. As a user, I want to unlock the full 3D interactive player with a one-time purchase, so that I pay once and own the experience permanently.
15. As a user, I want the purchase to be $4.99 as a one-time payment, so that I'm not locked into a subscription for a personal aesthetic tool.
16. As a user, I want the widget to be available in small, medium, and large sizes, so that I can choose how much home screen space to dedicate to it.
17. As a user, I want the app to remember which album I last loaded, so that I don't have to re-select it each time I open the app.
18. As a user, I want the cassette player to pause the reel animation when music is paused, so that the physical metaphor stays consistent.
19. As a user, I want the album art to appear as a label on the cassette in the 3D view, so that the tape feels personalised to what's loaded.
20. As a user, I want the app to work without an active internet connection once an album is loaded, so that the widget remains functional during playback.
21. As a user, I want the 3D player to feel responsive to subtle device tilts, not just dramatic movements, so that the physicality is always present.
22. As a user, I want the tilt response to feel like the object has mass — slow, weighty, not jumpy — so that the experience matches the aesthetic.
23. As a user, I want to be able to search for and select an album from within the Tapepod app, so that I don't have to leave the app to load a tape.
24. As a user, I want the album search to pull from whichever streaming service I have connected, so that my library is available directly.
25. As a user, I want the widget to display a tactful "no tape loaded" state if I haven't selected an album yet, so that the widget doesn't look broken on first install.
26. As a potential buyer, I want to see the 3D player in a preview mode before purchasing, so that I know what I'm paying for.
27. As a user who has purchased premium, I want my purchase to restore correctly if I reinstall the app, so that I don't lose what I paid for.

## Implementation Decisions

### Modules

**Now Playing Engine**
Connects to Spotify and Apple Music and exposes a unified `NowPlaying` interface: current track metadata, album, playback progress (0–1), duration, and playing/paused state. Hides the API differences between the two services behind a single interface. This is the source of truth for all playback state in the app.

**Tape Reel Animator**
Pure computation module. Given a playback progress value (0–1) and a total album duration, calculates the geometric properties of both cassette reels (radius, rotation speed). No UI, no side effects. This module owns the physics feel of the product — the easing, the moment of inertia, the way the reel slows slightly as it gets larger.

**Motion Engine**
Reads the device gyroscope and accelerometer via Core Motion, applies smoothing and damping to produce a normalised `DeviceOrientation` output (pitch, roll). The 3D Walkman Renderer consumes this. The damping constants are the primary lever for making the object feel heavy vs. floaty.

**3D Walkman Renderer**
Consumes `NowPlaying`, reel geometry from Tape Reel Animator, and `DeviceOrientation` from Motion Engine. Renders the interactive 3D cassette player. Responsible for material quality, depth cues, shadow, and parallax layering. This module is visual output only — it does not contain business logic.

**Album Loader**
Fetches album data from Spotify or Apple Music API and returns a normalised `Album` value: title, artist, track list (max 20), total duration, and artwork URL. Abstracts the two APIs into one shape. Used by the Tape Curator and the 3D Walkman Renderer.

**Tape Curator**
Manages the single loaded tape state. Enforces the one-album, 20-track maximum constraint. Validates an album selection before committing it to the deck. Persists the loaded album across sessions. This module owns the intentionality of the product — it is the difference between Tapepod and a passive mirror widget.

**Widget Bridge**
Writes current playback state (track title, album art URL, reel progress) to App Group shared storage. The WidgetKit extension reads from this storage. This is a thin, platform-specific layer — it should do nothing except serialise and write.

**WidgetKit Extension**
Native Swift. Reads from App Group shared storage, renders the ambient home screen widget in small, medium, and large sizes. Does not contain business logic. The widget is a static or lightly animated render — it is the shop window, not the product.

**Premium Gate**
Wraps StoreKit. Manages the one-time purchase state for the $4.99 unlock. Controls access to the full 3D Walkman experience. Supports purchase restoration. The free tier exposes the home screen widget only.

### Architectural decisions

- Spotify and Apple Music are supported at launch. SoundCloud is deferred — the developer API is restricted and web-player integration is in-app only (no widget support). SoundCloud is a post-MVP addition.
- The widget (WidgetKit) is iOS-native Swift. The app shell is React Native / Expo. Communication between them uses App Group shared storage — a standard iOS pattern for this architecture.
- Album mode is the only load mechanic at MVP. Playlist pull (linking an existing Spotify/Apple Music playlist) is v1.1.
- The 3D tilt interaction lives in the app only. The home screen widget cannot respond to gyroscope input — this is an iOS platform constraint.
- Pricing is a one-time $4.99 IAP. No subscription. Free tier = widget teaser. Paid tier = full 3D experience + all widget sizes.

## Testing Decisions

### What makes a good test

Test external behaviour, not implementation details. A good test describes what the module promises to callers — given this input, produce this output — without knowing how the module achieves it. Tests should survive internal refactors without breaking.

### Modules to test

**Tape Reel Animator** — highest priority. Pure input/output math. Given progress and duration, assert correct reel radii and rotation values. Cover edge cases: progress = 0, progress = 1, very short tracks, very long albums.

**Now Playing Engine** — test the state machine. Assert correct transitions between playing, paused, and stopped states. Assert that the unified `NowPlaying` interface correctly normalises inputs from both Spotify and Apple Music mock responses.

**Motion Engine** — test damping and normalisation. Given raw gyroscope inputs, assert that output orientation values stay within expected bounds and respond with the correct lag/smoothing behaviour.

**Album Loader** — test the normalisation layer. Given mock Spotify and Apple Music API responses, assert that the output `Album` shape is identical. Test the 20-track cap: assert that albums with more than 20 tracks are truncated correctly.

**Tape Curator** — test validation logic and persistence. Assert that loading an album with >20 tracks is rejected or truncated. Assert that the loaded album survives app restart. Assert that loading a new album replaces the previous one.

**Premium Gate** — test purchase state. Assert that the free tier correctly restricts access to the 3D view. Assert that a completed purchase unlocks it. Assert that restore purchases correctly reinstates the unlocked state.

### Modules not tested

3D Walkman Renderer, Widget Bridge, and WidgetKit Extension are not unit-tested — they produce visual or platform-specific output that is better verified by inspection and device testing.

## Out of Scope

- SoundCloud integration (API restrictions; deferred post-MVP)
- Playlist pull from Spotify or Apple Music (v1.1)
- Android support (post-MVP)
- Multiple tape design variants / themes (post-MVP)
- Mixtape sharing or social features (future)
- Physical product / hardware (long-term vision)
- Custom track ordering within a loaded tape
- Any form of audio processing, equalisation, or remix functionality

## Further Notes

### Competitive context

Tapepod's primary competitor is VinylPod (App Store rating 4.4, 490 ratings, $3.99 one-time IAP). VinylPod's weaknesses, directly from user reviews:

- Widget sizes paywalled (users find it petty)
- No creative expression — users explicitly ask for stickers, decorations, player variants
- Spotify connectivity is unreliable (recurring complaint)
- The widget feels flat and digital — no weight, no physicality

Tapepod's counter-position: craft over decoration, functional reels over passive spin, one deliberate album over whatever happens to be playing. The cassette format is underserved — no direct competitor owns it.

### Aesthetic reference

The Sony Walkman TC-D5M with transparent housing. Visible mechanics. Nothing decorative that isn't also structural. Teenage Engineering's approach to digital objects: the feeling of precision hardware, not a UI skin.

### Distribution

The build will be documented publicly across Instagram, Substack, and YouTube as a build-in-public series. The making-of content is part of the go-to-market strategy. The target audience follows process as closely as product. Shipping before the reel animation feels right is the primary risk to avoid.

### Pricing rationale

$4.99 one-time is intentionally above VinylPod's $3.99. The premium signals craft confidence without leaving the impulse-buy range for the target user. A limited-time introductory price of $2.99 for the first 500 purchasers may be used at launch to reward early adopters.
