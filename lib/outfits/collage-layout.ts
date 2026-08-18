import type { ClothingCategory, OutfitRole } from '@/types';

export type CollageRect = {
  id: string;
  zIndex: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type CollageInputItem = {
  id: string;
  role?: OutfitRole | string | null;
  category: ClothingCategory | string;
};

type Band = 'outer' | 'top' | 'bottom' | 'shoes' | 'acc';

function bandOf(item: CollageInputItem): Band {
  const role = (item.role ?? '').toLowerCase();
  const category = item.category;
  if (role === 'shoes' || role === 'socks' || category === 'shoes') return 'shoes';
  if (
    category === 'accessory' ||
    role.includes('accessory') ||
    role === 'watch' ||
    role === 'bag' ||
    role === 'jewelry' ||
    role === 'head_accessory' ||
    role === 'belt'
  ) {
    return 'acc';
  }
  if (role === 'outerwear' || category === 'outerwear') return 'outer';
  if (role === 'bottom' || category === 'bottom') return 'bottom';
  return 'top';
}

/**
 * Role-aware flat-lay positions in 0–1 canvas space.
 * Tops stay dominant; outerwear sits beside rather than on top of the main piece.
 */
export function collageLayout(items: CollageInputItem[]): CollageRect[] {
  if (items.length === 0) return [];
  if (items.length === 1) {
    return [{ id: items[0].id, zIndex: 2, x: 0.2, y: 0.1, w: 0.6, h: 0.8 }];
  }

  const buckets: Record<Band, CollageInputItem[]> = {
    outer: [],
    top: [],
    bottom: [],
    shoes: [],
    acc: [],
  };
  for (const item of items) buckets[bandOf(item)].push(item);

  const used: CollageRect[] = [];
  const take = (band: Band, rect: Omit<CollageRect, 'id'>, extra = 0) => {
    buckets[band].forEach((item, index) => {
      used.push({
        id: item.id,
        ...rect,
        x: rect.x + extra * index,
        y: rect.y + extra * index * 0.4,
        zIndex: rect.zIndex + index,
      });
    });
  };

  const hasOuter = buckets.outer.length > 0;
  const hasTop = buckets.top.length > 0;
  const hasBottom = buckets.bottom.length > 0;
  const hasShoes = buckets.shoes.length > 0;
  const hasAcc = buckets.acc.length > 0;
  const dressLike = buckets.top.some(
    (item) => item.category === 'one_piece' || item.role === 'one_piece'
  );

  if (hasOuter) {
    take('outer', { zIndex: 1, x: 0.0, y: 0.02, w: 0.36, h: 0.56 });
  }
  if (hasTop) {
    take('top', {
      zIndex: 3,
      x: hasOuter ? 0.24 : dressLike ? 0.2 : 0.18,
      y: 0.0,
      w: hasOuter ? 0.5 : dressLike ? 0.58 : 0.56,
      h: dressLike ? 0.7 : 0.54,
    });
  }
  if (hasBottom && !dressLike) {
    take('bottom', {
      zIndex: 2,
      x: hasOuter ? 0.28 : 0.24,
      y: hasTop || hasOuter ? 0.38 : 0.1,
      w: 0.34,
      h: 0.44,
    });
  }
  if (hasShoes) {
    take('shoes', {
      zIndex: 4,
      x: 0.52,
      y: 0.68,
      w: 0.4,
      h: 0.3,
    });
  }
  if (hasAcc) {
    take('acc', { zIndex: 5, x: 0.8, y: 0.06, w: 0.16, h: 0.18 }, 0.03);
  }

  if (used.length < items.length) {
    const placed = new Set(used.map((r) => r.id));
    items
      .filter((item) => !placed.has(item.id))
      .forEach((item, index) => {
        used.push({
          id: item.id,
          zIndex: 2 + index,
          x: 0.12 + (index % 2) * 0.42,
          y: 0.16 + Math.floor(index / 2) * 0.36,
          w: 0.36,
          h: 0.4,
        });
      });
  }

  return used;
}
