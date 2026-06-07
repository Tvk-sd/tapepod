---
name: Tapepod
description: Flat line-art cassette deck on near-black, one yellow accent, hardware labeling voice.
colors:
  void: "#0B0B0B"
  surface: "#101010"
  well-fill: "#161616"
  well-stroke: "#242424"
  divider: "#1C1C1C"
  sheet-border: "#262626"
  track-gray: "#3A3A3A"
  ink-primary: "#F2F2F2"
  ink-secondary: "#EDEDED"
  ink-header: "#D8D8D8"
  ink-muted: "#777777"
  ink-meta: "#666666"
  ink-label: "#555555"
  ink-control: "#ADADAD"
  accent-yellow: "#E9E64B"
  service-spotify: "#1DB954"
  disabled: "#5A5A5A"
typography:
  headline:
    fontFamily: "System"
    fontSize: "22px"
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: "1px"
  title:
    fontFamily: "System"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "1px"
  body:
    fontFamily: "System"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0px"
  label:
    fontFamily: "System"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "1px"
  caption:
    fontFamily: "System"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "1px"
  micro:
    fontFamily: "System"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "2px"
rounded:
  pill: "18px"
  sheet: "20px"
  scrub-seg: "2px"
  playhead: "4px"
spacing:
  frame-x: "16px"
  section: "28px"
  stack: "18px"
  row-y: "12px"
  btn-x: "18px"
  btn-y: "8px"
components:
  button-add-tape:
    backgroundColor: "transparent"
    textColor: "{colors.accent-yellow}"
    rounded: "{rounded.pill}"
    padding: "8px 18px"
  button-spotify:
    backgroundColor: "{colors.service-spotify}"
    textColor: "{colors.void}"
    rounded: "{rounded.pill}"
    padding: "8px 18px"
  button-spotify-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.service-spotify}"
    rounded: "{rounded.pill}"
    padding: "8px 18px"
  control-play:
    backgroundColor: "transparent"
    textColor: "{colors.ink-control}"
    typography: "{typography.caption}"
    padding: "8px"
---

# Design System: Tapepod

## 1. Overview

**Creative North Star: "The Registration Mark Deck"**

Tapepod looks like a flat, head-on cassette mechanism drawn with registration marks and one signal color. The UI is near-black void; the deck is the hero; chrome is hardware labeling (lowercase, letter-spaced, no marketing voice). Density is calm: one column, max 480px frame, nothing competing with reel geometry.

This system explicitly rejects SaaS dashboard patterns from PRODUCT.md: card grids, gradient accents, hero metrics, eyebrow kickers, ghost-card borders with wide drop shadows, and modal-first flows for tasks that belong inline.

**Key Characteristics:**

- Restrained palette: tinted neutrals on `#0B0B0B` plus yellow accent on ≤10% of any screen.
- System typography only (SF Pro / system-ui); weight and letter-spacing carry hierarchy, not font pairing.
- Flat elevation: depth via surface steps (`#101010`, `#161616`) and 1px dividers, never drop shadows.
- Primary actions are outline pills; filled buttons reserved for external service (Spotify) only.
- The Deck SVG owns motion and progress; surrounding UI stays static and quiet.

## 2. Colors: The Mechanism Palette

Monochrome void with one product accent and one service color. Yellow marks structure (tape path, reels, scrubber, primary product actions). Green is Spotify-only.

### Primary

- **Signal Yellow** (`#E9E64B` / oklch(88% 0.19 102)): Reel strokes, tape path, scrubber fill, playhead block, track index numbers, tape editor actions, and the `edit tape` / `+ add songs` outline button. Never used as a large fill field.

### Secondary

- **Spotify Green** (`#1DB954` / oklch(65% 0.20 145)): Connect/disconnect Spotify only. Do not reuse for in-app success states or generic CTAs.

### Neutral

- **Void** (`#0B0B0B`): App background, deck canvas fill, tape pack interior.
- **Surface Raised** (`#101010`): Bottom sheet (tape editor) background.
- **Well Fill** (`#161616`): Reel well interior behind packs.
- **Well Stroke** (`#242424`): Outer reel well ring.
- **Divider** (`#1C1C1C`): List row separators in tape editor.
- **Sheet Edge** (`#262626`): Top border on editor sheet.
- **Track Gray** (`#3A3A3A`): Unfilled scrubber segments.
- **Ink Header** (`#D8D8D8`): Now-playing artist/title in app header.
- **Ink Primary** (`#F2F2F2`): Sheet title (`tape`).
- **Ink Secondary** (`#EDEDED`): Track titles in lists.
- **Ink Muted** (`#777777`): Artist names, secondary list copy.
- **Ink Meta** (`#666666`): Duration summaries, helper meta lines.
- **Ink Label** (`#555555`): Uppercase section labels (`catalog`).
- **Ink Control** (`#ADADAD`): Play/pause transport label (target for AAA on void; legacy `#888888` in code must migrate).
- **Disabled** (`#5A5A5A`): Added-to-tape checkmarks, blocked catalog rows at 35% opacity.

### Named Rules

**The One Signal Rule.** Yellow appears on mechanism lines and one product action per screen. If yellow is on a card background, a gradient, and a button simultaneously, the screen is over-signaled.

**The Service Color Rule.** Green is Spotify's lane. Never use `#1DB954` for Tapepod-native actions like load tape or play.

## 3. Typography

**Display Font:** System (SF Pro on iOS, system-ui on web)
**Body Font:** System (same stack throughout)
**Label Font:** System (uppercase micro labels only)

**Character:** Quiet hardware labeling. Light weight for editorial sheet titles; semibold for header track info; lowercase preferred except transport glyphs (`▶ PLAY` / `❚❚ PAUSE`) and short uppercase section labels.

### Hierarchy

- **Headline** (300, 22px, letter-spacing 1px): Tape editor sheet title.
- **Title** (600, 18px, letter-spacing 1px): Now-playing line in app header; single line, truncates with ellipsis.
- **Body** (400, 15px): Track titles in editor lists.
- **Label** (600, 14px, letter-spacing 1px): Pill button text (`connect spotify`, `edit tape`).
- **Caption** (400, 12px, letter-spacing 1px): Play/pause control, artist names, durations (tabular nums on durations).
- **Micro** (400, 11px, letter-spacing 2px, uppercase): Section labels only (`catalog`).

### Named Rules

**The Lowercase Voice Rule.** UI copy stays lowercase except transport state, section micro-labels, and proper nouns. No title-case marketing headings.

**The Tabular Time Rule.** Durations use tabular numerals (`fontVariant: tabular-nums`) so list columns stay aligned.

## 4. Elevation

Flat by default. Depth is tonal: void → raised surface → well fill, separated by 1px hairline borders (`#1C1C1C`, `#262626`). No box shadows on buttons, cards, or sheets.

The tape editor uses a dimmed backdrop (`rgba(0,0,0,0.6)`) plus a sheet with 20px top radius. That is the only "lift" metaphor; it must not pair with drop shadow.

### Named Rules

**The No Ghost Card Rule.** Never combine `border: 1px solid` with soft wide drop shadows on the same element. Pick a hairline border or a surface step, not both as decoration.

**The Flat Deck Rule.** The Deck SVG sits directly on void. Do not wrap it in a bordered card or panel.

## 5. Components

Hardware-quiet controls. Buttons are pills; primary product action is yellow outline; play is text-only.

### Buttons

- **Shape:** Full pill (18px radius), horizontal padding 18px, vertical 8px.
- **Product primary (`edit tape`, `+ add songs`):** Transparent fill, 1px yellow border, yellow label text.
- **Spotify connect:** Filled `#1DB954`, void ink text, semibold 14px.
- **Spotify connected:** Ghost outline green, green label.
- **Hover / Focus:** On web, visible focus ring using yellow at 2px outline offset; pressed state reduces opacity to 0.85. No scale bounce.

### Play / Pause Control

- **Style:** Text-only pressable, no border or background.
- **Label:** `▶ PLAY` or `❚❚ PAUSE`, caption size, `#ADADAD` on void (AAA target).
- **Hit area:** Minimum 44×44pt via hitSlop; deck tap also toggles playback.

### Tape Editor Sheet

- **Corner Style:** 20px top radius only.
- **Background:** `#101010` with 1px `#262626` top border.
- **Backdrop:** 60% black scrim.
- **Internal Padding:** 20px horizontal, 20px top, 32px bottom.
- **Rows:** 12px vertical padding, `#1C1C1C` bottom divider, yellow index column, remove/add affordance at row end.

### List Rows

- **Default:** Title `#EDEDED` 15px, artist `#777777` 12px, duration `#888888` 13px tabular.
- **Disabled:** 35% opacity when track already on tape or tape full.
- **Full tape:** Count label switches to yellow (`20/20 · full`).

### Deck (signature component)

- **Canvas:** `#0B0B0B`, responsive width capped at 460px in frame.
- **Mechanism colors:** Yellow strokes 2–3px; wells `#161616` / `#242424`; scrubber segments `#3A3A3A` unfilled, yellow filled.
- **Registration marks:** Supply hub `+`, take-up hub `×`, yellow 2.5px lines.
- **Motion:** Reel rotation and scrubber progress only; respect `prefers-reduced-motion` by pausing animation, not hiding the deck.

## 6. Do's and Don'ts

Concrete guardrails tied to PRODUCT.md anti-references and WCAG 2.1 AAA target.

### Do:

- **Do** keep the deck as the largest visual element on the player screen.
- **Do** use yellow for mechanism lines and one native product action per view.
- **Do** use `#ADADAD` or lighter for essential control text on `#0B0B0B` (AAA ≥7:1).
- **Do** use 44pt minimum touch targets on all pressables (`hitSlop` where visual size is smaller).
- **Do** label pressables for VoiceOver (`Play`, `Pause`, `Connect Spotify`, `Disconnect Spotify`).

### Don't:

- **Don't** use SaaS dashboard patterns: card grids, gradient accents, hero metrics, eyebrow kickers, ghost-card borders with wide drop shadows, modal-first flows for simple tasks.
- **Don't** clone generic streaming app chrome (album art hero, gradient player backgrounds, shuffle row of circular icons).
- **Don't** use `#888888` for play/pause or other essential controls on void; it fails AAA.
- **Don't** add drop shadows to pills, sheets, or the deck wrapper.
- **Don't** use yellow as a full-screen or large-panel fill; it is a signal stroke, not a surface.
- **Don't** nest cards or add side-stripe accent borders on list rows.
- **Don't** use uppercase body copy beyond micro section labels and transport state.
