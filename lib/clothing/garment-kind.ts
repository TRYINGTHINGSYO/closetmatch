import type { ClothingCategory, ClothingItem, OutfitRole } from '@/types';

export type GarmentKind =
  | 'tee'
  | 'shirt'
  | 'hoodie'
  | 'pants'
  | 'shorts'
  | 'dress'
  | 'skirt'
  | 'sneakers'
  | 'boots'
  | 'loafers'
  | 'jacket'
  | 'hat'
  | 'watch'
  | 'bag'
  | 'generic';

function haystack(item: Pick<ClothingItem, 'name' | 'subcategory' | 'category'>): string {
  return `${item.subcategory} ${item.name} ${item.category}`.toLowerCase();
}

export function garmentKind(
  item: Pick<ClothingItem, 'name' | 'subcategory' | 'category' | 'sleeve_length'>,
  role?: OutfitRole | string | null
): GarmentKind {
  const text = haystack(item);
  const category = item.category as ClothingCategory;

  if (category === 'shoes' || role === 'shoes' || role === 'socks') {
    if (text.includes('boot')) return 'boots';
    if (text.includes('loafer') || text.includes('oxford') || text.includes('dress')) return 'loafers';
    return 'sneakers';
  }

  if (category === 'bottom' || role === 'bottom') {
    if (text.includes('skirt')) return 'skirt';
    if (text.includes('short')) return 'shorts';
    return 'pants';
  }

  if (category === 'one_piece' || role === 'one_piece' || text.includes('dress') || text.includes('romper')) {
    return 'dress';
  }

  if (category === 'outerwear' || role === 'outerwear' || text.includes('jacket') || text.includes('coat') || text.includes('parka')) {
    return 'jacket';
  }

  if (category === 'accessory' || role?.includes('accessory') || role === 'watch' || role === 'bag' || role === 'jewelry' || role === 'head_accessory') {
    if (text.includes('cap') || text.includes('hat') || text.includes('beanie') || role === 'head_accessory') {
      return 'hat';
    }
    if (text.includes('watch') || role === 'watch') return 'watch';
    if (text.includes('bag') || role === 'bag') return 'bag';
    return 'generic';
  }

  if (text.includes('hoodie') || text.includes('sweater') || text.includes('crewneck') || text.includes('sweatshirt')) {
    return 'hoodie';
  }
  if (text.includes('button') || text.includes('oxford') || (text.includes('shirt') && !text.includes('t-shirt') && !text.includes('tee'))) {
    return 'shirt';
  }
  if ((item.sleeve_length ?? '').toLowerCase().includes('long') && category === 'top') {
    return 'hoodie';
  }
  return 'tee';
}
