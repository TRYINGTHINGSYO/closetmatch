import type { ClothingItem, RecommendationExplanation } from '@/types';
import { toFahrenheit } from '@/lib/weather/atmosphere';

export function conciseOutfitReason(input: {
  explanation?: RecommendationExplanation | Record<string, unknown> | null;
  items?: Array<Pick<ClothingItem, 'availability_status' | 'last_worn_at' | 'average_rating'>>;
  feelsLike?: number | null;
  temperatureUnit?: 'f' | 'c';
}): string {
  const reasons = Array.isArray((input.explanation as RecommendationExplanation | undefined)?.reasons)
    ? (input.explanation as RecommendationExplanation).reasons
    : [];
  const summary = (input.explanation as RecommendationExplanation | undefined)?.summary ?? '';
  const text = [...reasons, summary].join(' ').toLowerCase();
  const feels =
    input.feelsLike == null ? null : toFahrenheit(input.feelsLike, input.temperatureUnit ?? 'f');
  const items = input.items ?? [];
  const allAvailable = items.length > 0 && items.every((item) => item.availability_status === 'available');

  if (text.includes('temperature') || text.includes("today's weather") || text.includes('weather')) {
    if (feels != null && feels >= 82) return 'Great for today’s heat';
    if (feels != null && feels < 50) return 'Better for cooler weather';
    return 'Suits today’s weather';
  }
  if (text.includes('rated highly') || text.includes('you previously rated')) {
    return 'One of your highest-rated looks';
  }
  if (text.includes('not been worn') || text.includes('have not worn')) {
    return 'You haven’t worn this recently';
  }
  if (text.includes('comfortable')) return 'Comfortable for today';
  if (text.includes('work for') || text.includes('may work for')) {
    return 'Works well for your selected occasion';
  }
  if (text.includes('saved')) return 'Similar to a look you saved';
  if (allAvailable && reasons.length === 0) return 'All pieces are clean';
  if (reasons[0]) return shortenReason(reasons[0]);
  return 'Based on your closet today';
}

function shortenReason(reason: string): string {
  const trimmed = reason.replace(/^ClosetMatch suggests (this )?/i, '').replace(/\.$/, '');
  if (trimmed.length <= 72) return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return `${trimmed.slice(0, 69).trim()}…`;
}
