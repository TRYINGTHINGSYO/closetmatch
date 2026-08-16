import { MAX_RECOMMENDATIONS } from '@/constants';
import type {
  ClothingItem,
  ItemPairing,
  Outfit,
  OutfitCandidate,
  RecommendationContext,
  UserPreferences,
} from '@/types';
import { generateCandidates } from './candidate-generator';
import { diversifyCandidates } from './diversity';
import { buildExplanation } from './explanations';
import { scoreOutfit } from './scorer';

export interface RecommendationEngineInput {
  clothingItems: ClothingItem[];
  preferences: UserPreferences | null;
  pairings: ItemPairing[];
  savedOutfits: Outfit[];
  context: RecommendationContext;
  /** Number of wear/outfit events used to gauge experience */
  historyCount?: number;
  limit?: number;
}

function experienceLevel(historyCount: number): 'new' | 'default' | 'experienced' {
  if (historyCount < 5) return 'new';
  if (historyCount >= 25) return 'experienced';
  return 'default';
}

/**
 * Modular outfit recommendation engine.
 * Structured metadata + pairing history + weighted scoring + diversity.
 * Personal behavior outweighs generic fashion rules as history grows.
 */
export function generateRecommendations(input: RecommendationEngineInput): OutfitCandidate[] {
  const limit = input.limit ?? MAX_RECOMMENDATIONS;
  const level = experienceLevel(input.historyCount ?? 0);

  // Exclude dirty / unavailable by default (enforced in candidate generator)
  const available = input.clothingItems.filter((i) => !i.archived_at);

  if (available.length < 2) {
    return [];
  }

  const raw = generateCandidates(available, input.context);
  const scored: OutfitCandidate[] = raw.map((c) => {
    const { total, breakdown } = scoreOutfit({
      slots: c.slots,
      context: input.context,
      preferences: input.preferences,
      pairings: input.pairings,
      savedOutfits: input.savedOutfits,
      experienceLevel: level,
    });

    const explanation = buildExplanation({
      items: c.slots.map((s) => s.clothing_item),
      breakdown,
      context: input.context,
      preferences: input.preferences,
    });

    return {
      items: c.slots,
      template_id: c.template_id,
      total_score: total,
      score_breakdown: breakdown,
      explanation,
    };
  });

  scored.sort((a, b) => b.total_score - a.total_score);

  // Mode-specific re-ranking nudges
  const mode = input.context.mode;
  if (mode === 'most_comfortable') {
    scored.sort(
      (a, b) => b.score_breakdown.comfort_history - a.score_breakdown.comfort_history
    );
  } else if (mode === 'best_rated') {
    scored.sort((a, b) => b.score_breakdown.user_ratings - a.score_breakdown.user_ratings);
  } else if (mode === 'something_new' || mode === 'surprise' || mode === 'least_recent') {
    scored.sort(
      (a, b) => b.score_breakdown.variety_recent_wear - a.score_breakdown.variety_recent_wear
    );
  } else if (mode === 'safe' || mode === 'familiar') {
    scored.sort(
      (a, b) => b.score_breakdown.personal_pairing - a.score_breakdown.personal_pairing
    );
  } else if (mode === 'experimental' || mode === 'max_variety') {
    scored.sort(
      (a, b) => b.score_breakdown.variety_recent_wear - a.score_breakdown.variety_recent_wear
    );
  }

  return diversifyCandidates(scored, limit);
}

export * from './candidate-generator';
export * from './scorer';
export * from './explanations';
export * from './diversity';
