import type { OutfitCandidate } from '@/types';

function itemSetKey(candidate: OutfitCandidate): string {
  return candidate.items
    .map((i) => i.clothing_item.id)
    .sort()
    .join('|');
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

/**
 * Diversify recommendations so results are not nearly identical.
 * Greedy selection: highest score that isn't too similar to already picked.
 */
export function diversifyCandidates(
  ranked: OutfitCandidate[],
  limit: number,
  maxSimilarity = 0.66
): OutfitCandidate[] {
  const selected: OutfitCandidate[] = [];
  const seen = new Set<string>();

  for (const candidate of ranked) {
    const key = itemSetKey(candidate);
    if (seen.has(key)) continue;

    const ids = new Set(candidate.items.map((i) => i.clothing_item.id));
    const tooSimilar = selected.some((s) => {
      const other = new Set(s.items.map((i) => i.clothing_item.id));
      return jaccard(ids, other) >= maxSimilarity;
    });

    if (tooSimilar) continue;

    selected.push(candidate);
    seen.add(key);
    if (selected.length >= limit) break;
  }

  // If too few, relax similarity
  if (selected.length < limit) {
    for (const candidate of ranked) {
      const key = itemSetKey(candidate);
      if (seen.has(key)) continue;
      selected.push(candidate);
      seen.add(key);
      if (selected.length >= limit) break;
    }
  }

  return selected;
}
