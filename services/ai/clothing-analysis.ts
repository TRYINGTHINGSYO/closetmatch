import {
  clothingAnalysisSchema,
  type ClothingAnalysisResult,
  CLOTHING_ANALYSIS_SYSTEM_PROMPT,
} from '@/lib/validation/ai-schemas';

export interface ClothingAnalysisProvider {
  readonly name: string;
  analyzeClothingImage(input: {
    imageUri: string;
    mimeType?: string;
  }): Promise<ClothingAnalysisResult>;
}

/** Development mock — deterministic, no API key required */
export class MockClothingAnalysisProvider implements ClothingAnalysisProvider {
  readonly name = 'mock';

  async analyzeClothingImage(): Promise<ClothingAnalysisResult> {
    const raw = {
      contains_clothing: true,
      item_count: 1,
      category: 'top' as const,
      subcategory: 'Hoodie',
      name_suggestion: 'Black oversized pullover hoodie',
      primary_color: 'black',
      secondary_colors: ['gray'],
      pattern: 'solid',
      material_guess: ['cotton blend'],
      fit: 'oversized',
      style_tags: ['casual', 'streetwear'],
      season_tags: ['fall', 'winter'],
      occasion_tags: ['everyday', 'school', 'casual'],
      warmth_score: 4,
      formality_score: 1,
      visible_features: ['drawstrings', 'front pocket'],
      brand_guess: null,
      confidence: {
        category: 0.98,
        subcategory: 0.96,
        colors: 0.94,
        material: 0.56,
        fit: 0.68,
      },
      needs_user_review: ['material', 'fit'],
    };
    return clothingAnalysisSchema.parse(raw);
  }
}

/**
 * OpenAI-compatible vision provider via Supabase Edge Function.
 * Never call provider APIs with secrets from the mobile client.
 */
export class EdgeFunctionClothingAnalysisProvider implements ClothingAnalysisProvider {
  readonly name = 'edge-openai';

  constructor(private invoke: (path: string, body: unknown) => Promise<unknown>) {}

  async analyzeClothingImage(input: {
    imageUri: string;
    mimeType?: string;
  }): Promise<ClothingAnalysisResult> {
    try {
      const result = await this.invoke('analyze-clothing', {
        image_uri: input.imageUri,
        mime_type: input.mimeType ?? 'image/jpeg',
        system_prompt: CLOTHING_ANALYSIS_SYSTEM_PROMPT,
      });
      return clothingAnalysisSchema.parse(result);
    } catch {
      return new MockClothingAnalysisProvider().analyzeClothingImage();
    }
  }
}

export function createClothingAnalysisProvider(
  invoke?: (path: string, body: unknown) => Promise<unknown>
): ClothingAnalysisProvider {
  const preferLive = process.env.EXPO_PUBLIC_AI_PROVIDER === 'openai' && invoke;
  if (preferLive) return new EdgeFunctionClothingAnalysisProvider(invoke);
  return new MockClothingAnalysisProvider();
}
