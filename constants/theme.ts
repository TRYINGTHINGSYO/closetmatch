export const colors = {
  light: {
    bg: '#F3F5F4',
    bgElevated: '#FFFFFF',
    ink: '#1C2421',
    inkMuted: '#5C6B66',
    inkSoft: '#8A9A94',
    accent: '#1F7A6B',
    accentSoft: '#D8EDE8',
    accentDeep: '#145A4F',
    danger: '#B42318',
    warning: '#B54708',
    success: '#1F7A6B',
    border: '#D7E0DC',
    overlay: 'rgba(28, 36, 33, 0.45)',
    gradientStart: '#E8F0ED',
    gradientEnd: '#F7F4EF',
    heroGlow: '#C5DDD6',
  },
  dark: {
    bg: '#121816',
    bgElevated: '#1A221F',
    ink: '#F2F6F4',
    inkMuted: '#A8B8B2',
    inkSoft: '#7A8C85',
    accent: '#3DB89F',
    accentSoft: '#1E3D36',
    accentDeep: '#2A9D8F',
    danger: '#F97066',
    warning: '#FDB022',
    success: '#3DB89F',
    border: '#2A3531',
    overlay: 'rgba(0, 0, 0, 0.55)',
    gradientStart: '#15201C',
    gradientEnd: '#1A1814',
    heroGlow: '#1F3A33',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
} as const;

export const typography = {
  brand: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 34,
    lineHeight: 40,
  },
  hero: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 28,
    lineHeight: 34,
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 17,
    lineHeight: 24,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    lineHeight: 18,
  },
  button: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    lineHeight: 20,
  },
} as const;

export type ThemeColors = {
  bg: string;
  bgElevated: string;
  ink: string;
  inkMuted: string;
  inkSoft: string;
  accent: string;
  accentSoft: string;
  accentDeep: string;
  danger: string;
  warning: string;
  success: string;
  border: string;
  overlay: string;
  gradientStart: string;
  gradientEnd: string;
  heroGlow: string;
};

