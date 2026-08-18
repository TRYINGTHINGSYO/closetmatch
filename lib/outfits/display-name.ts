import type { ClothingItem, OutfitRole } from '@/types';
import { colorFamily } from '@/lib/clothing/colors';
import { toFahrenheit } from '@/lib/weather/atmosphere';

export function itemSummaryLine(
  items: Array<Pick<ClothingItem, 'name'> | null | undefined>,
  limit = 3
): string {
  const names = items.map((item) => item?.name).filter((name): name is string => Boolean(name));
  if (names.length <= limit) return names.join(' · ');
  return `${names.slice(0, limit).join(' · ')} +${names.length - limit}`;
}

export function outfitDisplayName(input: {
  items: Array<Pick<ClothingItem, 'primary_color' | 'category' | 'style_tags' | 'warmth_score'>>;
  occasion?: string | null;
  weatherCondition?: string | null;
  feelsLike?: number | null;
  temperatureUnit?: 'f' | 'c';
  savedName?: string | null;
}): string {
  const saved = input.savedName?.trim();
  if (saved && !isGenericSavedName(saved)) return saved;

  const occasion = (input.occasion ?? 'Everyday').trim();
  const items = input.items;
  const feels =
    input.feelsLike == null ? null : toFahrenheit(input.feelsLike, input.temperatureUnit ?? 'f');
  const colors = items.map((item) => item.primary_color);
  const families = new Set(colors.map(colorFamily));
  const hasOuter = items.some((item) => item.category === 'outerwear');
  const casual = /everyday|casual|weekend/i.test(occasion);
  const work = /work|office|interview/i.test(occasion);

  if (feels != null && feels >= 85 && casual) return 'Warm-weather basics';
  if (feels != null && feels >= 85 && work) return 'Lightweight work look';
  if (feels != null && feels < 50 && hasOuter) return 'Weekend layers';
  if (hasOuter && casual) return 'Weekend layers';
  if (families.size === 1 && families.has('neutral')) return 'Casual neutrals';
  if (colors.length >= 2 && colors.every((c) => colorFamily(c) === colorFamily(colors[0]))) {
    return 'Clean monochrome';
  }
  if (work) return 'Everyday work look';
  if (/date/i.test(occasion)) return 'Date-night look';
  if (/formal/i.test(occasion)) return 'Formal look';
  if (/athletic|exercise/i.test(occasion)) return 'Easy athletic look';
  if (casual) return 'Everyday casual';
  return occasion ? `${occasion} look` : 'Everyday look';
}

export function isGenericSavedName(name: string): boolean {
  return /^(saved look|worn|today)\b/i.test(name.trim());
}

export function roleLabel(role?: OutfitRole | string | null): string {
  if (!role) return 'piece';
  return role.replace(/_/g, ' ');
}
