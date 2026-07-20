import type { ClothingItem, OutfitRole, RecommendationContext, ScoreBreakdown } from '@/types';
import { RECENTLY_WORN_DAYS } from '@/constants';

export interface OutfitTemplate {
  id: string;
  name: string;
  roles: OutfitRole[];
  optionalRoles?: OutfitRole[];
  minFormality?: number;
  maxFormality?: number;
  minWarmth?: number;
  maxWarmth?: number;
  styleHints?: string[];
}

export const OUTFIT_TEMPLATES: OutfitTemplate[] = [
  {
    id: 'casual_basic',
    name: 'Top + bottom + shoes',
    roles: ['top', 'bottom', 'shoes'],
    optionalRoles: ['other_accessory'],
    maxFormality: 3,
  },
  {
    id: 'casual_layered',
    name: 'Top + bottom + outerwear + shoes',
    roles: ['top', 'bottom', 'outerwear', 'shoes'],
    minWarmth: 3,
  },
  {
    id: 'casual_accessory',
    name: 'Top + bottom + shoes + accessory',
    roles: ['top', 'bottom', 'shoes', 'other_accessory'],
    maxFormality: 3,
  },
  {
    id: 'dress_simple',
    name: 'Dress + shoes',
    roles: ['one_piece', 'shoes'],
  },
  {
    id: 'dress_jacket',
    name: 'Dress + jacket + shoes',
    roles: ['one_piece', 'outerwear', 'shoes'],
  },
  {
    id: 'one_piece_shoes',
    name: 'One-piece + shoes',
    roles: ['one_piece', 'shoes'],
  },
  {
    id: 'athletic',
    name: 'Athletic top + bottom + shoes',
    roles: ['top', 'bottom', 'shoes'],
    styleHints: ['athletic'],
    maxFormality: 2,
  },
  {
    id: 'formal',
    name: 'Formal shirt + pants + shoes',
    roles: ['top', 'bottom', 'shoes'],
    optionalRoles: ['outerwear', 'belt'],
    minFormality: 4,
  },
  {
    id: 'hoodie_jeans',
    name: 'Hoodie + jeans + sneakers',
    roles: ['top', 'bottom', 'shoes'],
    styleHints: ['casual', 'streetwear'],
    maxFormality: 2,
  },
  {
    id: 'sweater_chinos',
    name: 'Sweater + chinos + boots',
    roles: ['top', 'bottom', 'shoes'],
    styleHints: ['casual', 'preppy'],
  },
  {
    id: 'tee_shorts',
    name: 'T-shirt + shorts + sneakers',
    roles: ['top', 'bottom', 'shoes'],
    maxWarmth: 2,
    maxFormality: 2,
  },
  {
    id: 'buttonup_jeans',
    name: 'Button-up + jeans + loafers',
    roles: ['top', 'bottom', 'shoes'],
    styleHints: ['casual', 'business casual'],
  },
];

function daysSince(dateIso: string | null): number | null {
  if (!dateIso) return null;
  const ms = Date.now() - new Date(dateIso).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

export function isItemAvailable(
  item: ClothingItem,
  includeUnavailable = false
): boolean {
  if (item.archived_at) return false;
  if (includeUnavailable) {
    return !['donated', 'sold', 'archived', 'missing'].includes(item.availability_status);
  }
  return item.availability_status === 'available';
}

export function itemsForRole(
  items: ClothingItem[],
  role: OutfitRole,
  context: RecommendationContext
): ClothingItem[] {
  const includeUnavailable = context.include_unavailable === true;
  return items.filter((item) => {
    if (!isItemAvailable(item, includeUnavailable)) return false;

    switch (role) {
      case 'top':
      case 'undershirt':
      case 'mid_layer':
        return item.category === 'top';
      case 'bottom':
        return item.category === 'bottom';
      case 'one_piece':
        return item.category === 'one_piece';
      case 'outerwear':
        return item.category === 'outerwear';
      case 'shoes':
        return item.category === 'shoes';
      case 'socks':
        return (
          item.category === 'accessory' &&
          item.subcategory.toLowerCase().includes('sock')
        );
      case 'belt':
        return item.subcategory.toLowerCase() === 'belt';
      case 'watch':
        return item.subcategory.toLowerCase() === 'watch';
      case 'bag':
        return ['Bag', 'Backpack', 'Purse'].includes(item.subcategory);
      case 'head_accessory':
        return ['Hat', 'Baseball cap', 'Beanie'].includes(item.subcategory);
      case 'jewelry':
        return ['Necklace', 'Bracelet', 'Earrings', 'Ring'].includes(item.subcategory);
      case 'other_accessory':
        return item.category === 'accessory';
      default:
        return false;
    }
  });
}

export function selectTemplates(
  context: RecommendationContext,
  availableItems: ClothingItem[]
): OutfitTemplate[] {
  const hasOnePiece = availableItems.some(
    (i) => i.category === 'one_piece' && isItemAvailable(i, context.include_unavailable)
  );
  const hasOuterwear = availableItems.some(
    (i) => i.category === 'outerwear' && isItemAvailable(i, context.include_unavailable)
  );
  const temp = context.temperature ?? context.feels_like;
  const formality = context.desired_formality;
  const style = context.style?.toLowerCase();
  const mode = context.mode;

  return OUTFIT_TEMPLATES.filter((t) => {
    if (t.roles.includes('one_piece') && !hasOnePiece) return false;
    if (t.roles.includes('outerwear') && !hasOuterwear) return false;
    if (t.roles.includes('one_piece') && !t.roles.includes('top')) {
      // one-piece templates only when we want dresses/suits
    }
    if (temp != null) {
      if (t.maxWarmth != null && temp < 50 && t.id === 'tee_shorts') return false;
      if (t.minWarmth != null && temp > 75 && t.id === 'casual_layered') return false;
      if (temp > 78 && t.roles.includes('outerwear')) return false;
      if (temp < 45 && !t.roles.includes('outerwear') && hasOuterwear && mode !== 'hot') {
        // prefer layered when cold — keep both, scorer will prefer warmth
      }
    }
    if (formality != null) {
      if (t.minFormality != null && formality < t.minFormality - 1) return false;
      if (t.maxFormality != null && formality > t.maxFormality + 1) return false;
    }
    if (style && t.styleHints?.length) {
      const match = t.styleHints.some((h) => style.includes(h) || h.includes(style));
      if (!match && (mode === 'work' || mode === 'formal' || mode === 'athletic')) {
        if (mode === 'athletic' && !t.styleHints.includes('athletic')) return false;
        if (mode === 'formal' && (t.maxFormality ?? 5) < 3) return false;
      }
    }
    if (mode === 'athletic' && t.id !== 'athletic' && t.id !== 'casual_basic') return false;
    if (mode === 'hot' && t.roles.includes('outerwear')) return false;
    if (mode === 'cold' && !t.roles.includes('outerwear') && hasOuterwear) return false;
    if (mode === 'rainy' && hasOuterwear && !t.roles.includes('outerwear')) return false;
    return true;
  });
}

export function recentlyWornPenalty(item: ClothingItem): number {
  const days = daysSince(item.last_worn_at);
  if (days == null) return 0;
  if (days < 1) return 0.25;
  if (days < RECENTLY_WORN_DAYS) return 0.15;
  if (days < 7) return 0.05;
  return 0;
}

export function underusedBonus(item: ClothingItem): number {
  const days = daysSince(item.last_worn_at);
  if (item.never_worn || days == null) return 0.08;
  if (days > 30) return 0.1;
  if (days > 21) return 0.06;
  if (days > 14) return 0.03;
  return 0;
}

export function emptyScoreBreakdown(): ScoreBreakdown {
  return {
    personal_pairing: 0,
    user_ratings: 0,
    saved_similarity: 0,
    style_compatibility: 0,
    color_compatibility: 0,
    weather_suitability: 0,
    occasion_suitability: 0,
    mirror_check_history: 0,
    fit_proportion: 0,
    comfort_history: 0,
    variety_recent_wear: 0,
    penalties: 0,
  };
}

/**
 * Generate candidate outfit combinations from templates.
 * Limits combinatorial explosion with per-role top-N sampling.
 */
export function generateCandidates(
  items: ClothingItem[],
  context: RecommendationContext,
  maxPerRole = 8,
  maxCandidates = 40
): Array<{ template_id: string; slots: Array<{ clothing_item: ClothingItem; role: OutfitRole }> }> {
  const templates = selectTemplates(context, items);
  const candidates: Array<{
    template_id: string;
    slots: Array<{ clothing_item: ClothingItem; role: OutfitRole }>;
  }> = [];

  for (const template of templates) {
    const rolePools = template.roles.map((role) => {
      let pool = itemsForRole(items, role, context);
      // Prefer favorites / less recently worn when truncating
      pool = [...pool].sort((a, b) => {
        const score =
          (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0) +
          underusedBonus(b) - underusedBonus(a) -
          recentlyWornPenalty(b) + recentlyWornPenalty(a);
        return score > 0 ? -1 : score < 0 ? 1 : 0;
      });
      return { role, pool: pool.slice(0, maxPerRole) };
    });

    if (rolePools.some((p) => p.pool.length === 0)) continue;

    // Cartesian product with early stop
    const build = (
      index: number,
      current: Array<{ clothing_item: ClothingItem; role: OutfitRole }>
    ) => {
      if (candidates.length >= maxCandidates) return;
      if (index >= rolePools.length) {
        const ids = new Set(current.map((c) => c.clothing_item.id));
        if (ids.size === current.length) {
          candidates.push({ template_id: template.id, slots: [...current] });
        }
        return;
      }
      const { role, pool } = rolePools[index];
      for (const item of pool) {
        if (current.some((c) => c.clothing_item.id === item.id)) continue;
        current.push({ clothing_item: item, role });
        build(index + 1, current);
        current.pop();
        if (candidates.length >= maxCandidates) return;
      }
    };

    build(0, []);
  }

  return candidates;
}
