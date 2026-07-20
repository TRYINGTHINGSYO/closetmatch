import { describe, expect, it } from 'vitest';
import {
  generateRecommendations,
  isItemAvailable,
} from '../../services/recommendations';
import {
  applyReplacementLearning,
  scoreOutfit,
} from '../../services/recommendations/scorer';
import { diversifyCandidates } from '../../services/recommendations/diversity';
import { createSeedWardrobe, createDemoPreferences } from '../../services/storage/demo-data';
import type { ClothingItem, OutfitCandidate } from '../../types';

const userId = 'user-test';
const seed = createSeedWardrobe(userId);
const prefs = createDemoPreferences(userId);

describe('availability', () => {
  it('excludes dirty items by default', () => {
    const dirty = seed.clothingItems.find((c) => c.availability_status === 'dirty')!;
    expect(isItemAvailable(dirty)).toBe(false);
  });

  it('excludes missing/donated even when includeUnavailable', () => {
    const missing: ClothingItem = {
      ...seed.clothingItems[0],
      availability_status: 'missing',
    };
    expect(isItemAvailable(missing, true)).toBe(false);
  });
});

describe('recommendation engine', () => {
  it('generates multiple diverse recommendations from available clothes', () => {
    const recs = generateRecommendations({
      clothingItems: seed.clothingItems,
      preferences: prefs,
      pairings: seed.pairings,
      savedOutfits: seed.outfits,
      context: { occasion: 'Everyday', temperature: 58, feels_like: 54, mode: 'balanced' },
      historyCount: seed.wearHistory.length,
      limit: 5,
    });
    expect(recs.length).toBeGreaterThan(1);
    // dirty joggers should not appear
    for (const rec of recs) {
      expect(rec.items.every((i) => i.clothing_item.availability_status === 'available')).toBe(
        true
      );
    }
  });

  it('personal history can outweigh weak color rules for experienced users', () => {
    const hoodie = seed.clothingItems.find((c) => c.id === 'c-hoodie-black')!;
    const jeans = seed.clothingItems.find((c) => c.id === 'c-jeans-dark')!;
    const sneakers = seed.clothingItems.find((c) => c.id === 'c-sneakers-white')!;

    const experienced = scoreOutfit({
      slots: [
        { clothing_item: hoodie, role: 'top' },
        { clothing_item: jeans, role: 'bottom' },
        { clothing_item: sneakers, role: 'shoes' },
      ],
      context: { occasion: 'Everyday', temperature: 58 },
      preferences: prefs,
      pairings: seed.pairings,
      savedOutfits: seed.outfits,
      experienceLevel: 'experienced',
    });

    const newbie = scoreOutfit({
      slots: [
        { clothing_item: hoodie, role: 'top' },
        { clothing_item: jeans, role: 'bottom' },
        { clothing_item: sneakers, role: 'shoes' },
      ],
      context: { occasion: 'Everyday', temperature: 58 },
      preferences: prefs,
      pairings: [],
      savedOutfits: [],
      experienceLevel: 'new',
    });

    expect(experienced.breakdown.personal_pairing).toBeGreaterThan(0.7);
    expect(experienced.total).toBeGreaterThan(newbie.total - 0.05);
  });

  it('applies recently worn penalty and rejected pairing penalty', () => {
    const negative = seed.pairings.find((p) => p.pairing_score < 0.2)!;
    const a = seed.clothingItems.find((c) => c.id === negative.item_a_id)!;
    const b = seed.clothingItems.find((c) => c.id === negative.item_b_id)!;
    const shoes = seed.clothingItems.find((c) => c.category === 'shoes' && c.availability_status === 'available')!;

    const scored = scoreOutfit({
      slots: [
        { clothing_item: a, role: 'top' },
        { clothing_item: b, role: 'shoes' },
        { clothing_item: shoes.id === b.id ? seed.clothingItems.find((c) => c.id === 'c-jeans-dark')! : shoes, role: shoes.id === b.id ? 'bottom' : 'shoes' },
      ],
      context: {},
      preferences: prefs,
      pairings: seed.pairings,
      savedOutfits: [],
      experienceLevel: 'experienced',
    });

    expect(scored.breakdown.personal_pairing).toBeLessThan(0.5);
  });
});

describe('replacement learning', () => {
  it('updates pair relationships without rejecting the full outfit', () => {
    const kept = ['c-hoodie-gray', 'c-jeans-dark'];
    const next = applyReplacementLearning(
      seed.pairings,
      kept,
      'c-boots-black',
      'c-sneakers-white',
      userId
    );

    const preferred = next.find(
      (p) =>
        (p.item_a_id === 'c-hoodie-gray' && p.item_b_id === 'c-sneakers-white') ||
        (p.item_b_id === 'c-hoodie-gray' && p.item_a_id === 'c-sneakers-white')
    );
    const demoted = next.find(
      (p) =>
        (p.item_a_id === 'c-hoodie-gray' && p.item_b_id === 'c-boots-black') ||
        (p.item_b_id === 'c-hoodie-gray' && p.item_a_id === 'c-boots-black')
    );

    expect(preferred).toBeTruthy();
    expect(preferred!.accepted_count).toBeGreaterThanOrEqual(1);
    expect(demoted).toBeTruthy();
    expect(demoted!.replacement_count).toBeGreaterThanOrEqual(1);
  });
});

describe('diversity', () => {
  it('avoids returning nearly identical outfits', () => {
    const baseItems = seed.clothingItems.filter((c) => c.availability_status === 'available');
    const mk = (ids: string[], score: number): OutfitCandidate => ({
      template_id: 't',
      total_score: score,
      score_breakdown: {
        personal_pairing: 0.5,
        user_ratings: 0.5,
        saved_similarity: 0.5,
        style_compatibility: 0.5,
        color_compatibility: 0.5,
        weather_suitability: 0.5,
        occasion_suitability: 0.5,
        mirror_check_history: 0.5,
        fit_proportion: 0.5,
        comfort_history: 0.5,
        variety_recent_wear: 0.5,
        penalties: 0,
      },
      explanation: { summary: 'test', reasons: [] },
      items: ids.map((id) => ({
        role: 'top' as const,
        clothing_item: baseItems.find((c) => c.id === id) ?? baseItems[0],
      })),
    });

    const ranked = [
      mk(['c-hoodie-black', 'c-jeans-dark', 'c-sneakers-white'], 0.9),
      mk(['c-hoodie-black', 'c-jeans-dark', 'c-boots-black'], 0.89),
      mk(['c-tee-white', 'c-chinos-khaki', 'c-loafers-brown'], 0.7),
    ];
    const diversified = diversifyCandidates(ranked, 2, 0.66);
    expect(diversified.length).toBe(2);
    const firstIds = new Set(diversified[0].items.map((i) => i.clothing_item.id));
    const secondIds = new Set(diversified[1].items.map((i) => i.clothing_item.id));
    const overlap = [...firstIds].filter((id) => secondIds.has(id)).length;
    expect(overlap).toBeLessThan(3);
  });
});
