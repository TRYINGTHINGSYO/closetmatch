import { describe, expect, it } from 'vitest';
import {
  clothingAnalysisSchema,
  mirrorAnalysisSchema,
  sanitizeMirrorAnalysis,
  assertMirrorCheckSafe,
} from '../../lib/validation/ai-schemas';

describe('clothing analysis schema', () => {
  it('accepts valid analysis JSON', () => {
    const parsed = clothingAnalysisSchema.parse({
      contains_clothing: true,
      item_count: 1,
      category: 'top',
      subcategory: 'hoodie',
      name_suggestion: 'Black hoodie',
      primary_color: 'black',
      secondary_colors: ['gray'],
      pattern: 'solid',
      material_guess: ['cotton'],
      fit: 'oversized',
      style_tags: ['casual'],
      season_tags: ['fall'],
      occasion_tags: ['everyday'],
      warmth_score: 4,
      formality_score: 1,
      visible_features: ['pocket'],
      brand_guess: null,
      confidence: { category: 0.9 },
      needs_user_review: ['material'],
    });
    expect(parsed.category).toBe('top');
  });

  it('rejects invalid formality scores', () => {
    expect(() =>
      clothingAnalysisSchema.parse({
        contains_clothing: true,
        item_count: 1,
        category: 'top',
        subcategory: null,
        name_suggestion: null,
        primary_color: null,
        warmth_score: 9,
        formality_score: 1,
      })
    ).toThrow();
  });
});

describe('mirror check schema & safety', () => {
  const good = {
    image_quality: { usable: true, issues: [] },
    overall_assessment: 'The outfit has a cohesive casual look.',
    scores: {
      overall: 0.8,
      color_coordination: 0.8,
      style_cohesion: 0.8,
      fit_and_proportion: 0.7,
      occasion_match: 0.8,
      weather_suitability: 0.7,
    },
    positive_observations: ['The dark jeans create a consistent base.'],
    suggested_changes: [
      {
        priority: 1,
        area: 'shoes',
        suggestion: 'Try sneakers if you want a more casual finish.',
        reason: 'Current shoes read slightly dressier.',
      },
    ],
    suggested_item_roles_to_replace: ['shoes'],
    confidence: 0.7,
    disclaimer: 'Lighting may affect analysis.',
  };

  it('accepts respectful clothing-focused feedback', () => {
    expect(sanitizeMirrorAnalysis(mirrorAnalysisSchema.parse(good)).scores.overall).toBe(0.8);
  });

  it('rejects body-critical language', () => {
    expect(() => assertMirrorCheckSafe('You look ugly in this')).toThrow();
    expect(() =>
      sanitizeMirrorAnalysis(
        mirrorAnalysisSchema.parse({
          ...good,
          overall_assessment: 'This makes you look fat.',
        })
      )
    ).toThrow();
  });
});
