import type {
  ClothingItem,
  RecommendationContext,
  RecommendationExplanation,
  ScoreBreakdown,
  UserPreferences,
} from '@/types';
import { RECENTLY_WORN_DAYS } from '@/constants';

function daysSince(dateIso: string | null): number | null {
  if (!dateIso) return null;
  return (Date.now() - new Date(dateIso).getTime()) / (1000 * 60 * 60 * 24);
}

/**
 * Non-absolute, history-based explanations.
 * Never claim objective best / must wear / everyone will like.
 */
export function buildExplanation(input: {
  items: ClothingItem[];
  breakdown: ScoreBreakdown;
  context: RecommendationContext;
  preferences: UserPreferences | null;
  pairingHighlights?: string[];
}): RecommendationExplanation {
  const reasons: string[] = [];
  const { items, breakdown, context, preferences, pairingHighlights } = input;

  if (pairingHighlights?.length) {
    reasons.push(...pairingHighlights.slice(0, 2));
  } else if (breakdown.personal_pairing >= 0.7) {
    reasons.push('Based on your history, ClosetMatch suggests these pieces often work well together.');
  }

  if (breakdown.user_ratings >= 0.7) {
    const high = items.find((i) => (i.average_rating ?? 0) >= 4);
    if (high) {
      reasons.push(`You may prefer looks that include ${high.name}, which appears in outfits you rated highly.`);
    } else {
      reasons.push('This is similar to combinations you previously rated highly.');
    }
  }

  if (breakdown.saved_similarity >= 0.6) {
    reasons.push('This resembles an outfit you saved.');
  }

  if (context.temperature != null || context.feels_like != null) {
    const t = context.feels_like ?? context.temperature!;
    if (breakdown.weather_suitability >= 0.65) {
      reasons.push(`This outfit may suit today's temperature around ${Math.round(t)}°.`);
    } else if (breakdown.weather_suitability < 0.45) {
      reasons.push('Weather match is moderate — you may want to adjust layers if you spend time outdoors.');
    }
  }

  if (context.occasion && breakdown.occasion_suitability >= 0.6) {
    reasons.push(`ClosetMatch suggests this may work for ${context.occasion.toLowerCase()}.`);
  }

  const underused = items.find((i) => {
    const d = daysSince(i.last_worn_at);
    return i.never_worn || (d != null && d >= 14);
  });
  if (underused) {
    const d = daysSince(underused.last_worn_at);
    if (underused.never_worn) {
      reasons.push(`You have not worn ${underused.name} yet — you may want to try it.`);
    } else if (d != null) {
      reasons.push(`${underused.name} has not been worn in ${Math.round(d)} days.`);
    }
  }

  const recent = items.find((i) => {
    const d = daysSince(i.last_worn_at);
    return d != null && d < RECENTLY_WORN_DAYS;
  });
  if (recent && reasons.length < 4) {
    reasons.push(`Note: ${recent.name} was worn recently — swap it if you want more variety.`);
  }

  if (preferences?.preferred_colors?.length && breakdown.color_compatibility >= 0.65) {
    reasons.push('You often wear colors in this palette.');
  }

  if (breakdown.mirror_check_history >= 0.7) {
    reasons.push('Your Mirror Check history suggests you may like similar combinations.');
  }

  if (breakdown.comfort_history >= 0.7) {
    reasons.push('Based on your history, you may find this combination comfortable.');
  }

  // Ensure at least one reason
  if (reasons.length === 0) {
    reasons.push('ClosetMatch suggests this combination from clothes currently available in your closet.');
  }

  const topFactor = Object.entries(breakdown)
    .filter(([k]) => k !== 'penalties')
    .sort((a, b) => (b[1] as number) - (a[1] as number))[0];

  const summary =
    topFactor?.[0] === 'personal_pairing'
      ? 'You previously chose similar pairings — ClosetMatch suggests building on that.'
      : topFactor?.[0] === 'weather_suitability'
        ? "ClosetMatch suggests this look based on today's weather and your available clothes."
        : 'Based on your closet and preferences, ClosetMatch suggests this outfit.';

  return {
    summary,
    reasons: reasons.slice(0, 5),
    score_breakdown: breakdown,
  };
}
