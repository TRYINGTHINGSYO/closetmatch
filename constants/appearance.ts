import type { ThemeColors } from '@/constants/theme';

export type AppearanceMode = 'system' | 'light' | 'dark';
export type ColorThemeId =
  | 'sage'
  | 'blush'
  | 'ocean'
  | 'sunset'
  | 'lavender'
  | 'rose'
  | 'ink'
  | 'custom';
export type BackgroundStyleId = 'soft-gradient' | 'linen' | 'night' | 'photo';

export interface AppearancePreferences {
  mode: AppearanceMode;
  colorTheme: ColorThemeId;
  accentColor: string | null;
  backgroundStyle: BackgroundStyleId;
  backgroundImageUri: string | null;
}

export const DEFAULT_APPEARANCE: AppearancePreferences = {
  mode: 'system',
  colorTheme: 'sage',
  accentColor: null,
  backgroundStyle: 'soft-gradient',
  backgroundImageUri: null,
};

export const COLOR_THEMES: {
  id: ColorThemeId;
  label: string;
  accent: string;
}[] = [
  { id: 'sage', label: 'Sage', accent: '#1F7A6B' },
  { id: 'blush', label: 'Blush', accent: '#C45C6A' },
  { id: 'ocean', label: 'Ocean', accent: '#2A6F97' },
  { id: 'sunset', label: 'Sunset', accent: '#D97706' },
  { id: 'lavender', label: 'Lavender', accent: '#7C5CBF' },
  { id: 'rose', label: 'Rose', accent: '#B76E79' },
  { id: 'ink', label: 'Ink', accent: '#334155' },
  { id: 'custom', label: 'Custom', accent: '#1F7A6B' },
];

export const BACKGROUND_STYLES: { id: BackgroundStyleId; label: string; detail: string }[] = [
  { id: 'soft-gradient', label: 'Soft wash', detail: 'Gentle gradient tinted by your color' },
  { id: 'linen', label: 'Linen', detail: 'Warm paper-like background' },
  { id: 'night', label: 'Night', detail: 'Dark closet lighting' },
  { id: 'photo', label: 'My photo', detail: 'Use a photo from your library' },
];

export const APPEARANCE_MODES: { id: AppearanceMode; label: string }[] = [
  { id: 'system', label: 'Match device' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export function normalizeHex(input: string): string | null {
  const raw = input.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toUpperCase()}`;
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`.toUpperCase();
  }
  return null;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

function mixHex(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(A.r + (B.r - A.r) * t, A.g + (B.g - A.g) * t, A.b + (B.b - A.b) * t);
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function resolveAccent(appearance: AppearancePreferences): string {
  if (appearance.colorTheme === 'custom') {
    return normalizeHex(appearance.accentColor ?? '') ?? '#1F7A6B';
  }
  return COLOR_THEMES.find((t) => t.id === appearance.colorTheme)?.accent ?? '#1F7A6B';
}

export function applyAppearance(
  base: ThemeColors,
  appearance: AppearancePreferences,
  isDark: boolean
): ThemeColors {
  const accent = resolveAccent(appearance);
  const paper = isDark ? '#111816' : '#FFFFFF';
  const inkMix = isDark ? '#F2F6F4' : '#1C2421';
  let next: ThemeColors = {
    ...base,
    accent,
    accentSoft: mixHex(accent, paper, isDark ? 0.78 : 0.86),
    accentDeep: mixHex(accent, '#000000', isDark ? 0.18 : 0.28),
    success: accent,
    heroGlow: mixHex(accent, paper, isDark ? 0.7 : 0.55),
    gradientStart: mixHex(accent, base.bg, isDark ? 0.82 : 0.88),
    gradientEnd: mixHex(accent, isDark ? '#1A1814' : '#F7F4EF', isDark ? 0.9 : 0.92),
  };

  if (appearance.backgroundStyle === 'linen') {
    if (isDark) {
      next = {
        ...next,
        bg: '#1A1612',
        bgElevated: '#241F1A',
        gradientStart: mixHex(accent, '#1C1814', 0.88),
        gradientEnd: '#161310',
        border: '#3A322B',
      };
    } else {
      next = {
        ...next,
        bg: '#F4EFE6',
        bgElevated: '#FFFBF4',
        gradientStart: mixHex(accent, '#F3EBDD', 0.9),
        gradientEnd: '#EFE6D6',
        border: '#E4D9C8',
      };
    }
  }

  if (appearance.backgroundStyle === 'night') {
    next = {
      ...next,
      bg: '#101614',
      bgElevated: '#1A221F',
      ink: '#F4F7F6',
      inkMuted: '#C5D2CD',
      inkSoft: '#9AADA6',
      border: '#3E4E48',
      overlay: 'rgba(0, 0, 0, 0.55)',
      gradientStart: mixHex(accent, '#121918', 0.78),
      gradientEnd: '#0C100F',
      heroGlow: mixHex(accent, '#0C100F', 0.55),
      accentSoft: mixHex(accent, '#121918', 0.72),
    };
  }

  const photoOn =
    appearance.backgroundStyle === 'photo' && Boolean(appearance.backgroundImageUri);
  if (photoOn) {
    next = {
      ...next,
      gradientStart: rgba(isDark || appearance.backgroundStyle === 'night' ? '#101614' : next.bg, 0.72),
      gradientEnd: rgba(isDark || appearance.backgroundStyle === 'night' ? '#0C100F' : next.bg, 0.84),
    };
  }

  // Keep text contrast if someone picks a very light custom accent on light mode.
  const accentRgb = hexToRgb(accent);
  const accentLuma = (accentRgb.r * 299 + accentRgb.g * 587 + accentRgb.b * 114) / 1000;
  if (!isDark && appearance.backgroundStyle !== 'night' && accentLuma > 180) {
    next.accentDeep = mixHex(accent, inkMix, 0.45);
  }

  return next;
}
