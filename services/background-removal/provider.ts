export interface BackgroundRemovalProvider {
  readonly name: string;
  removeBackground(input: { imageUri: string }): Promise<{ processedUri: string }>;
}

/** Pass-through mock until a real provider (e.g. remove.bg) is configured server-side */
export class MockBackgroundRemovalProvider implements BackgroundRemovalProvider {
  readonly name = 'mock-passthrough';

  async removeBackground(input: { imageUri: string }): Promise<{ processedUri: string }> {
    return { processedUri: input.imageUri };
  }
}

export function createBackgroundRemovalProvider(): BackgroundRemovalProvider {
  return new MockBackgroundRemovalProvider();
}
