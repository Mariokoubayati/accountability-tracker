export const Colors = {
  bg: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceAlt: '#222222',
  accent: '#00FF87',
  danger: '#FF3B30',
  punishment: '#8B0000',
  warning: '#FF9500',
  text: '#FFFFFF',
  textMuted: '#888888',
  border: '#2A2A2A',
} as const;

export type ColorKey = keyof typeof Colors;
