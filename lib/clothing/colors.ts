/** Named wardrobe colors → fill hex. Unknown names fall back, never crash. */
const NAMED_FILLS: Record<string, string> = {
  black: '#1C1C1C',
  white: '#F3EFE6',
  gray: '#8B918C',
  grey: '#8B918C',
  navy: '#1E3A5F',
  blue: '#3B6EA5',
  'light blue': '#8BB6D6',
  green: '#3F6B4A',
  olive: '#6B7340',
  brown: '#6B4A32',
  beige: '#C4B49A',
  khaki: '#C4B49A',
  cream: '#E8DCC8',
  red: '#9A3B38',
  burgundy: '#6E2C3A',
  pink: '#C9899A',
  purple: '#6A4C8A',
  orange: '#C56A32',
  yellow: '#D4B84A',
  gold: '#C6A35A',
  silver: '#B7BDC4',
  multicolor: '#7A8C85',
  unknown: '#7A8C85',
};

export type GarmentPalette = {
  fill: string;
  accent: string;
  outline: string;
  isDark: boolean;
  isLight: boolean;
};

function parseHex(input: string): string | null {
  const raw = input.trim();
  if (/^#([0-9a-fA-F]{6})$/.test(raw)) return raw.toUpperCase();
  if (/^#([0-9a-fA-F]{3})$/.test(raw)) {
    const h = raw.slice(1);
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toUpperCase();
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

function luma(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function mix(hex: string, other: string, t: number): string {
  const A = hexToRgb(hex);
  const B = hexToRgb(other);
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${c(A.r + (B.r - A.r) * t)}${c(A.g + (B.g - A.g) * t)}${c(A.b + (B.b - A.b) * t)}`;
}

export function resolveColorFill(name: string | null | undefined): string {
  if (!name) return NAMED_FILLS.unknown;
  const hex = parseHex(name);
  if (hex) return hex;
  const key = name.trim().toLowerCase();
  if (NAMED_FILLS[key]) return NAMED_FILLS[key];
  const token = key.split(/[\s,/]+/)[0];
  return NAMED_FILLS[token] ?? NAMED_FILLS.unknown;
}

export function garmentPalette(primary: string, secondary?: string | null): GarmentPalette {
  const fill = resolveColorFill(primary);
  const accent = secondary ? resolveColorFill(secondary) : mix(fill, '#FFFFFF', 0.18);
  const dark = luma(fill) < 70;
  const light = luma(fill) > 200;
  return {
    fill,
    accent,
    outline: dark ? 'rgba(255,255,255,0.28)' : light ? 'rgba(28,36,33,0.16)' : 'rgba(28,36,33,0.12)',
    isDark: dark,
    isLight: light,
  };
}

export function colorFamily(name: string): 'neutral' | 'blue' | 'warm' | 'other' {
  const key = name.trim().toLowerCase();
  if (['black', 'white', 'gray', 'grey', 'cream', 'beige', 'khaki', 'silver'].includes(key)) {
    return 'neutral';
  }
  if (key.includes('blue') || key === 'navy') return 'blue';
  if (['brown', 'orange', 'yellow', 'gold', 'red', 'burgundy'].includes(key)) return 'warm';
  return 'other';
}
