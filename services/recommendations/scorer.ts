import {
  DEFAULT_SCORE_WEIGHTS,
  EXPERIENCED_USER_SCORE_WEIGHTS,
  NEW_USER_SCORE_WEIGHTS,
} from '@/constants';
import type {
  ClothingItem,
  ItemPairing,
  Outfit,
  RecommendationContext,
  ScoreBreakdown,
  UserPreferences,
} from '@/types';
import { emptyScoreBreakdown, recentlyWornPenalty, underusedBonus } from './candidate-generator';

export type ScoreWeights = {
  personal_pairing: number;
  user_ratings: number;
  saved_similarity: number;
  style_compatibility: number;
  color_compatibility: number;
  weather_suitability: number;
  occasion_suitability: number;
  mirror_check_history: number;
  fit_proportion: number;
  comfort_history: number;
  variety_recent_wear: number;
};

export interface ScoringInput {
  slots: Array<{ clothing_item: ClothingItem; role: string }>;
  context: RecommendationContext;
  preferences: UserPreferences | null;
  pairings: ItemPairing[];
  savedOutfits: Outfit[];
  experienceLevel: 'new' | 'default' | 'experienced';
  mirrorPositivePairIds?: Set<string>;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function pairingKey(a: string, b: string): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

export function selectWeights(experienceLevel: ScoringInput['experienceLevel']): ScoreWeights {
  if (experienceLevel === 'new') return NEW_USER_SCORE_WEIGHTS;
  if (experienceLevel === 'experienced') return EXPERIENCED_USER_SCORE_WEIGHTS;
  return DEFAULT_SCORE_WEIGHTS;
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0.5;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Generic color harmony — secondary to personal history */
function colorCompatibility(items: ClothingItem[], preferences: UserPreferences | null): number {
  const colors = items.map((i) => i.primary_color.toLowerCase());
  const neutrals = new Set(['black', 'white', 'gray', 'grey', 'navy', 'beige', 'cream', 'brown', 'olive']);
  let score = 0.6;

  const unique = new Set(colors);
  if (unique.size <= 2) score += 0.2;
  else if (unique.size === 3) score += 0.1;
  else score -= 0.1;

  const nonNeutral = colors.filter((c) => !neutrals.has(c));
  if (nonNeutral.length <= 1) score += 0.1;

  if (preferences) {
    const preferred = new Set(preferences.preferred_colors.map((c) => c.toLowerCase()));
    const avoided = new Set(preferences.avoided_colors.map((c) => c.toLowerCase()));
    const prefHits = colors.filter((c) => preferred.has(c)).length;
    const avoidHits = colors.filter((c) => avoided.has(c)).length;
    score += prefHits * 0.05;
    score -= avoidHits * 0.15;
  }

  // Classic clash heuristic (weak — personal history overrides)
  if (colors.includes('red') && colors.includes('green') && nonNeutral.length >= 2) {
    score -= 0.15;
  }

  return clamp01(score);
}

function styleCompatibility(items: ClothingItem[], preferences: UserPreferences | null, context: RecommendationContext): number {
  const allTags = items.flatMap((i) => i.style_tags.map((t) => t.toLowerCase()));
  let score = 0.55;

  if (preferences?.preferred_styles?.length) {
    const prefs = preferences.preferred_styles.map((s) => s.toLowerCase());
    const hits = prefs.filter((p) => allTags.some((t) => t.includes(p) || p.includes(t)));
    score += hits.length * 0.08;
  }

  if (context.style) {
    const s = context.style.toLowerCase();
    if (allTags.some((t) => t.includes(s) || s.includes(t))) score += 0.15;
  }

  const formalities = items.map((i) => i.formality_score);
  const spread = Math.max(...formalities) - Math.min(...formalities);
  if (spread <= 1) score += 0.15;
  else if (spread >= 3) score -= 0.2;

  return clamp01(score);
}

function fitCompatibility(items: ClothingItem[], preferences: UserPreferences | null): number {
  let score = 0.6;
  const fits = items.map((i) => i.fit?.toLowerCase()).filter(Boolean) as string[];
  if (fits.length >= 2) {
    const oversized = fits.filter((f) => f.includes('oversize') || f.includes('loose')).length;
    if (oversized === fits.length) score -= 0.1; // very loose silhouette note
    if (oversized === 1) score += 0.05;
  }
  if (preferences?.preferred_fits?.length) {
    const prefs = preferences.preferred_fits.map((f) => f.toLowerCase());
    const hits = fits.filter((f) => prefs.some((p) => f.includes(p.toLowerCase())));
    score += hits.length * 0.08;
  }
  return clamp01(score);
}

function weatherSuitability(
  items: ClothingItem[],
  context: RecommendationContext,
  preferences: UserPreferences | null
): number {
  const temp = context.feels_like ?? context.temperature;
  if (temp == null) return 0.5;

  const sensitivity = preferences?.temperature_sensitivity ?? 0;
  const adjusted = temp - sensitivity * 3;
  const warmth = avg(items.map((i) => i.warmth_score));
  // Map warmth 1-5 to ideal temp roughly 80 -> 40
  const idealTemp = 90 - warmth * 10;
  const diff = Math.abs(adjusted - idealTemp);
  let score = clamp01(1 - diff / 40);

  if ((context.rain_probability ?? 0) > 0.5) {
    const hasRainGear = items.some(
      (i) =>
        i.subcategory.toLowerCase().includes('rain') ||
        i.weather_suitability.some((w) => w.toLowerCase().includes('rain'))
    );
    score += hasRainGear ? 0.15 : -0.1;
  }

  const hasOuter = items.some((i) => i.category === 'outerwear');
  if (adjusted < 50 && !hasOuter) score -= 0.2;
  if (adjusted > 78 && hasOuter) score -= 0.15;

  return clamp01(score);
}

function occasionSuitability(items: ClothingItem[], context: RecommendationContext): number {
  if (!context.occasion) return 0.5;
  const occ = context.occasion.toLowerCase();
  const hits = items.filter((i) =>
    i.occasion_tags.some((t) => t.toLowerCase().includes(occ) || occ.includes(t.toLowerCase()))
  ).length;
  const formality = avg(items.map((i) => i.formality_score));
  let targetFormality = 2;
  if (['interview', 'formal event', 'wedding', 'court', 'presentation'].some((o) => occ.includes(o))) {
    targetFormality = 5;
  } else if (['work', 'dinner', 'church'].some((o) => occ.includes(o))) {
    targetFormality = 3;
  } else if (['exercise', 'athletic', 'relaxing'].some((o) => occ.includes(o))) {
    targetFormality = 1;
  }
  const formalityScore = clamp01(1 - Math.abs(formality - targetFormality) / 4);
  return clamp01(0.4 * formalityScore + 0.6 * (hits / Math.max(items.length, 1) + 0.3));
}

function personalPairingScore(
  items: ClothingItem[],
  pairings: ItemPairing[]
): number {
  if (items.length < 2) return 0.5;
  const map = new Map(pairings.map((p) => [pairingKey(p.item_a_id, p.item_b_id), p]));
  const scores: number[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const p = map.get(pairingKey(items[i].id, items[j].id));
      if (p) {
        // Rejected pairings lose score strongly
        if (p.rejected_count > 0 && p.pairing_score < 0.3) {
          scores.push(p.pairing_score * 0.5);
        } else {
          scores.push(p.pairing_score);
        }
      }
    }
  }
  if (scores.length === 0) return 0.45;
  return clamp01(avg(scores));
}

function userRatingScore(items: ClothingItem[]): number {
  const ratings = items
    .map((i) => i.average_rating)
    .filter((r): r is number => r != null);
  if (ratings.length === 0) return 0.5;
  return clamp01(avg(ratings) / 5);
}

function savedSimilarity(items: ClothingItem[], savedOutfits: Outfit[]): number {
  if (savedOutfits.length === 0) return 0.4;
  const itemIds = new Set(items.map((i) => i.id));
  let best = 0;
  for (const outfit of savedOutfits) {
    const outfitItemIds =
      outfit.items?.map((oi) => oi.clothing_item_id) ??
      [];
    if (outfitItemIds.length === 0) continue;
    const overlap = outfitItemIds.filter((id) => itemIds.has(id)).length;
    const sim = overlap / Math.max(outfitItemIds.length, itemIds.size);
    const ratingBoost = ((outfit.rating ?? 3) / 5) * 0.2;
    best = Math.max(best, sim + ratingBoost);
  }
  return clamp01(best);
}

function mirrorHistoryScore(
  items: ClothingItem[],
  pairings: ItemPairing[],
  mirrorPositivePairIds?: Set<string>
): number {
  let score = 0.5;
  let mirrorSignals = 0;
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const key = pairingKey(items[i].id, items[j].id);
      const p = pairings.find((x) => pairingKey(x.item_a_id, x.item_b_id) === key);
      if (p && (p.mirror_positive_count > 0 || p.mirror_negative_count > 0)) {
        mirrorSignals++;
        score += p.mirror_positive_count * 0.05 - p.mirror_negative_count * 0.06;
      }
      if (mirrorPositivePairIds?.has(key)) {
        score += 0.08;
        mirrorSignals++;
      }
    }
  }
  if (mirrorSignals === 0) return 0.5;
  return clamp01(score);
}

function comfortScore(items: ClothingItem[], preferences: UserPreferences | null): number {
  const comforts = items
    .map((i) => i.comfort_score)
    .filter((c): c is number => c != null);
  if (comforts.length === 0) return 0.5;
  const base = avg(comforts) / 5;
  const priority = (preferences?.comfort_priority ?? 3) / 5;
  return clamp01(base * 0.7 + priority * 0.3);
}

function varietyScore(items: ClothingItem[], preferences: UserPreferences | null): number {
  const varietyPref = (preferences?.desired_variety ?? 3) / 5;
  const bonuses = items.map(underusedBonus);
  const penalties = items.map(recentlyWornPenalty);
  const raw = avg(bonuses) * 5 - avg(penalties) * 3 + 0.4;
  return clamp01(raw * (0.5 + varietyPref * 0.5));
}

function computePenalties(items: ClothingItem[]): number {
  let penalty = 0;
  for (const item of items) {
    if (item.availability_status === 'dirty') penalty += 0.35;
    else if (item.availability_status !== 'available') penalty += 0.25;
    penalty += recentlyWornPenalty(item);
    if (item.favorite) penalty -= 0.03;
  }
  return Math.max(0, penalty);
}

/**
 * Weighted outfit score. Personal history outweighs generic rules for experienced users.
 */
export function scoreOutfit(input: ScoringInput): { total: number; breakdown: ScoreBreakdown } {
  const items = input.slots.map((s) => s.clothing_item);
  const weights = selectWeights(input.experienceLevel);
  const breakdown = emptyScoreBreakdown();

  breakdown.personal_pairing = personalPairingScore(items, input.pairings);
  breakdown.user_ratings = userRatingScore(items);
  breakdown.saved_similarity = savedSimilarity(items, input.savedOutfits);
  breakdown.style_compatibility = styleCompatibility(items, input.preferences, input.context);
  breakdown.color_compatibility = colorCompatibility(items, input.preferences);
  breakdown.weather_suitability = weatherSuitability(items, input.context, input.preferences);
  breakdown.occasion_suitability = occasionSuitability(items, input.context);
  breakdown.mirror_check_history = mirrorHistoryScore(
    items,
    input.pairings,
    input.mirrorPositivePairIds
  );
  breakdown.fit_proportion = fitCompatibility(items, input.preferences);
  breakdown.comfort_history = comfortScore(items, input.preferences);
  breakdown.variety_recent_wear = varietyScore(items, input.preferences);
  breakdown.penalties = computePenalties(items);

  // Personal history can override weak color clash for experienced users
  if (
    input.experienceLevel === 'experienced' &&
    breakdown.personal_pairing >= 0.75 &&
    breakdown.color_compatibility < 0.5
  ) {
    breakdown.color_compatibility = Math.max(breakdown.color_compatibility, 0.55);
  }

  let total = 0;
  total += breakdown.personal_pairing * weights.personal_pairing;
  total += breakdown.user_ratings * weights.user_ratings;
  total += breakdown.saved_similarity * weights.saved_similarity;
  total += breakdown.style_compatibility * weights.style_compatibility;
  total += breakdown.color_compatibility * weights.color_compatibility;
  total += breakdown.weather_suitability * weights.weather_suitability;
  total += breakdown.occasion_suitability * weights.occasion_suitability;
  total += breakdown.mirror_check_history * weights.mirror_check_history;
  total += breakdown.fit_proportion * weights.fit_proportion;
  total += breakdown.comfort_history * weights.comfort_history;
  total += breakdown.variety_recent_wear * weights.variety_recent_wear;
  total -= breakdown.penalties;

  return { total: clamp01(total), breakdown };
}

/**
 * Apply replacement learning: original rejected vs replacement preferred
 * without rejecting the whole outfit.
 */
export function applyReplacementLearning(
  pairings: ItemPairing[],
  keptItemIds: string[],
  originalItemId: string,
  replacementItemId: string,
  userId: string
): ItemPairing[] {
  const next = [...pairings];

  const bump = (
    a: string,
    b: string,
    field: 'accepted_count' | 'replacement_count',
    scoreDelta: number
  ) => {
    const [item_a_id, item_b_id] = a < b ? [a, b] : [b, a];
    const idx = next.findIndex(
      (p) => p.item_a_id === item_a_id && p.item_b_id === item_b_id
    );
    if (idx >= 0) {
      const p = { ...next[idx] };
      p[field] += 1;
      p.pairing_score = clamp01(p.pairing_score + scoreDelta);
      p.updated_at = new Date().toISOString();
      next[idx] = p;
    } else {
      next.push({
        id: `local-${item_a_id}-${item_b_id}`,
        user_id: userId,
        item_a_id,
        item_b_id,
        worn_together_count: 0,
        saved_together_count: 0,
        accepted_count: field === 'accepted_count' ? 1 : 0,
        rejected_count: 0,
        replacement_count: field === 'replacement_count' ? 1 : 0,
        average_rating: null,
        mirror_positive_count: 0,
        mirror_negative_count: 0,
        pairing_score: clamp01(0.5 + scoreDelta),
        last_calculated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  };

  for (const kept of keptItemIds) {
    bump(kept, replacementItemId, 'accepted_count', 0.08);
    bump(kept, originalItemId, 'replacement_count', -0.1);
  }

  return next;
}
