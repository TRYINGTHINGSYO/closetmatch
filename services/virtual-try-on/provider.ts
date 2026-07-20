/**
 * Future Virtual Try-On interfaces — not required for MVP.
 * Results must always be labeled as simulations.
 */

export interface PersonImageProcessingProvider {
  preparePersonImage(input: { imageUri: string }): Promise<{ processedUri: string; consentId: string }>;
}

export interface GarmentSegmentationProvider {
  segmentGarment(input: { imageUri: string }): Promise<{ maskUri: string }>;
}

export interface PoseEstimationProvider {
  estimatePose(input: { imageUri: string }): Promise<{ keypoints: Array<{ name: string; x: number; y: number }> }>;
}

export interface VirtualGarmentRenderingProvider {
  renderTryOn(input: {
    personUri: string;
    garmentUris: string[];
  }): Promise<{ previewUri: string; isSimulation: true }>;
}

export interface VirtualTryOnConsent {
  userId: string;
  grantedAt: string;
  retentionPolicy: string;
}

export class StubVirtualTryOnProvider
  implements
    PersonImageProcessingProvider,
    GarmentSegmentationProvider,
    PoseEstimationProvider,
    VirtualGarmentRenderingProvider
{
  async preparePersonImage(input: { imageUri: string }) {
    return { processedUri: input.imageUri, consentId: 'stub-consent' };
  }

  async segmentGarment(input: { imageUri: string }) {
    return { maskUri: input.imageUri };
  }

  async estimatePose() {
    return { keypoints: [] };
  }

  async renderTryOn(input: { personUri: string }) {
    return { previewUri: input.personUri, isSimulation: true as const };
  }
}
