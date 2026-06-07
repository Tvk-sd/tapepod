// Visual tokens from DESIGN.md — single source for app shell colors and spacing.

export const colors = {
  void: '#0B0B0B',
  inkHeader: '#D8D8D8',
  inkControl: '#ADADAD',
  accentYellow: '#E9E64B',
  serviceSpotify: '#1DB954',
} as const;

export const spacing = {
  frameX: 16,
  section: 28,
  stack: 18,
  btnX: 18,
  btnY: 8,
} as const;

export const radius = {
  pill: 18,
} as const;

export const layout = {
  frameMax: 480,
  deckMax: 460,
} as const;

export const motion = {
  pressOpacity: 0.85,
  disabledOpacity: 0.45,
} as const;
