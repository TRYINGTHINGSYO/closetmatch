import {
  mirrorAnalysisSchema,
  sanitizeMirrorAnalysis,
  type MirrorAnalysisResult,
  MIRROR_CHECK_SYSTEM_PROMPT,
} from '@/lib/validation/ai-schemas';

export interface MirrorAnalysisProvider {
  readonly name: string;
  analyzeMirrorCheck(input: {
    imageUri: string;
    occasion?: string;
    weatherNote?: string;
    outfitSummary?: string;
  }): Promise<MirrorAnalysisResult>;
}

export class MockMirrorAnalysisProvider implements MirrorAnalysisProvider {
  readonly name = 'mock';

  async analyzeMirrorCheck(input: {
    occasion?: string;
    weatherNote?: string;
  }): Promise<MirrorAnalysisResult> {
    const raw = {
      image_quality: {
        usable: true,
        issues: ['slightly dim lighting'],
      },
      overall_assessment:
        'The outfit has a cohesive casual look with a neutral color palette.',
      scores: {
        overall: 0.84,
        color_coordination: 0.9,
        style_cohesion: 0.86,
        fit_and_proportion: 0.73,
        occasion_match: 0.88,
        weather_suitability: 0.68,
      },
      positive_observations: [
        'The white shoes connect with the lighter details in the shirt.',
        'The dark jeans create a consistent base.',
      ],
      suggested_changes: [
        {
          priority: 1,
          area: 'outerwear',
          suggestion:
            'Try a shorter jacket if you want more separation between the jacket and pants.',
          reason: 'Both pieces currently create a long, loose silhouette.',
        },
      ],
      suggested_item_roles_to_replace: ['outerwear'],
      confidence: 0.78,
      disclaimer: 'Lighting, pose, and camera angle may affect the analysis.',
    };

    const parsed = mirrorAnalysisSchema.parse(raw);
    if (input.occasion) {
      parsed.positive_observations.push(
        `The outfit appears appropriate for a ${input.occasion.toLowerCase()} setting.`
      );
    }
    return sanitizeMirrorAnalysis(parsed);
  }
}

export class EdgeFunctionMirrorAnalysisProvider implements MirrorAnalysisProvider {
  readonly name = 'edge-openai';

  constructor(private invoke: (path: string, body: unknown) => Promise<unknown>) {}

  async analyzeMirrorCheck(input: {
    imageUri: string;
    occasion?: string;
    weatherNote?: string;
    outfitSummary?: string;
  }): Promise<MirrorAnalysisResult> {
    try {
      const result = await this.invoke('analyze-mirror-check', {
        ...input,
        system_prompt: MIRROR_CHECK_SYSTEM_PROMPT,
      });
      return sanitizeMirrorAnalysis(mirrorAnalysisSchema.parse(result));
    } catch {
      return new MockMirrorAnalysisProvider().analyzeMirrorCheck(input);
    }
  }
}

export function createMirrorAnalysisProvider(
  invoke?: (path: string, body: unknown) => Promise<unknown>
): MirrorAnalysisProvider {
  const preferLive = process.env.EXPO_PUBLIC_AI_PROVIDER === 'openai' && invoke;
  if (preferLive) return new EdgeFunctionMirrorAnalysisProvider(invoke);
  return new MockMirrorAnalysisProvider();
}
