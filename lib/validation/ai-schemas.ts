import { z } from 'zod';

/** Strict Zod schemas for AI clothing analysis output */
export const clothingAnalysisSchema = z.object({
  contains_clothing: z.boolean(),
  item_count: z.number().int().nonnegative(),
  category: z
    .enum(['top', 'bottom', 'one_piece', 'outerwear', 'shoes', 'accessory', 'specialty'])
    .nullable(),
  subcategory: z.string().nullable(),
  name_suggestion: z.string().nullable(),
  primary_color: z.string().nullable(),
  secondary_colors: z.array(z.string()).default([]),
  pattern: z.string().nullable(),
  material_guess: z.array(z.string()).default([]),
  fit: z.string().nullable(),
  style_tags: z.array(z.string()).default([]),
  season_tags: z.array(z.string()).default([]),
  occasion_tags: z.array(z.string()).default([]),
  warmth_score: z.number().int().min(1).max(5).nullable(),
  formality_score: z.number().int().min(1).max(5).nullable(),
  visible_features: z.array(z.string()).default([]),
  brand_guess: z.string().nullable(),
  confidence: z.record(z.string(), z.number().min(0).max(1)).default({}),
  needs_user_review: z.array(z.string()).default([]),
});

export type ClothingAnalysisResult = z.infer<typeof clothingAnalysisSchema>;

export const mirrorSuggestedChangeSchema = z.object({
  priority: z.number().int().positive(),
  area: z.string(),
  suggestion: z.string(),
  reason: z.string(),
});

export const mirrorAnalysisSchema = z.object({
  image_quality: z.object({
    usable: z.boolean(),
    issues: z.array(z.string()).default([]),
  }),
  overall_assessment: z.string(),
  scores: z.object({
    overall: z.number().min(0).max(1),
    color_coordination: z.number().min(0).max(1),
    style_cohesion: z.number().min(0).max(1),
    fit_and_proportion: z.number().min(0).max(1),
    occasion_match: z.number().min(0).max(1),
    weather_suitability: z.number().min(0).max(1),
  }),
  positive_observations: z.array(z.string()).default([]),
  suggested_changes: z.array(mirrorSuggestedChangeSchema).default([]),
  suggested_item_roles_to_replace: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
  disclaimer: z.string(),
});

export type MirrorAnalysisResult = z.infer<typeof mirrorAnalysisSchema>;

/** Forbidden Mirror Check language — body criticism / attractiveness */
export const MIRROR_CHECK_FORBIDDEN_PATTERNS = [
  /\byou look bad\b/i,
  /\bbody looks wrong\b/i,
  /\btoo (large|skinny|fat|ugly)\b/i,
  /\bunattractive\b/i,
  /\bchange your body\b/i,
  /\byou look ugly\b/i,
  /\blook fat\b/i,
  /\bnobody should wear\b/i,
];

export function assertMirrorCheckSafe(text: string): void {
  for (const pattern of MIRROR_CHECK_FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) {
      throw new Error('Mirror Check response contained unsafe language and was rejected.');
    }
  }
}

export function sanitizeMirrorAnalysis(result: MirrorAnalysisResult): MirrorAnalysisResult {
  const texts = [
    result.overall_assessment,
    ...result.positive_observations,
    ...result.suggested_changes.flatMap((c) => [c.suggestion, c.reason]),
    result.disclaimer,
  ];
  for (const t of texts) assertMirrorCheckSafe(t);
  return result;
}

export const CLOTHING_ANALYSIS_SYSTEM_PROMPT = `You analyze clothing photos for ClosetMatch, a personal wardrobe app.
Focus only on visible clothing. Avoid guessing when uncertain — return null for unknown fields.
Return strict JSON matching the schema. Never invent brands you cannot see.
Identify whether the image contains clothing and how many items are present.
Estimate category, subcategory, colors, pattern, material, fit, style, season, formality, and warmth when visible.
Suggest a user-friendly name. Return confidence by field.`;

export const MIRROR_CHECK_SYSTEM_PROMPT = `You provide Mirror Check feedback for ClosetMatch.
Focus on clothing coordination, color balance, fit of garments relative to each other, layering, silhouette, proportion, length balance, shoe compatibility, outerwear compatibility, occasion suitability, and weather suitability.
You MUST NOT rate attractiveness. You MUST NOT criticize the user's body.
You MUST NOT make medical, sexual, personality, or definitive social predictions.
Acknowledge uncertainty from lighting, pose, camera angle, and image quality.
Give one or two practical clothing suggestions using non-absolute language.
Return strict JSON only.`;
