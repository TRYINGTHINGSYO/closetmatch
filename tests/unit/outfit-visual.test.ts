import { describe, expect, it } from 'vitest';
import { colorFamily, garmentPalette, resolveColorFill } from '@/lib/clothing/colors';
import { garmentKind } from '@/lib/clothing/garment-kind';
import { collageLayout } from '@/lib/outfits/collage-layout';
import { outfitDisplayName } from '@/lib/outfits/display-name';
import { conciseOutfitReason } from '@/lib/outfits/reason';
import { createSeedWardrobe } from '@/services/storage/demo-data';

const seed = createSeedWardrobe('user-test');

describe('garment colors', () => {
  it('maps named colors and keeps black/white distinguishable', () => {
    expect(resolveColorFill('navy')).toBe('#1E3A5F');
    expect(garmentPalette('black').isDark).toBe(true);
    expect(garmentPalette('white').isLight).toBe(true);
    expect(garmentPalette('black').outline).toContain('255');
    expect(colorFamily('beige')).toBe('neutral');
  });
});

describe('garment kind', () => {
  it('uses subcategory and category from seed clothes', () => {
    const tee = seed.clothingItems.find((c) => c.id === 'c-tee-white')!;
    const hoodie = seed.clothingItems.find((c) => c.id === 'c-hoodie-black')!;
    const jeans = seed.clothingItems.find((c) => c.id === 'c-jeans-dark')!;
    const sneakers = seed.clothingItems.find((c) => c.id === 'c-sneakers-white')!;
    const jacket = seed.clothingItems.find((c) => c.id === 'c-jacket-denim')!;
    const cap = seed.clothingItems.find((c) => c.id === 'c-cap-black')!;
    expect(garmentKind(tee, 'top')).toBe('tee');
    expect(garmentKind(hoodie, 'top')).toBe('hoodie');
    expect(garmentKind(jeans, 'bottom')).toBe('pants');
    expect(garmentKind(sneakers, 'shoes')).toBe('sneakers');
    expect(garmentKind(jacket, 'outerwear')).toBe('jacket');
    expect(garmentKind(cap, 'accessory')).toBe('hat');
  });
});

describe('outfit naming and reasons', () => {
  it('is deterministic and avoids Suggestion N', () => {
    const items = [
      seed.clothingItems.find((c) => c.id === 'c-tee-white')!,
      seed.clothingItems.find((c) => c.id === 'c-jeans-dark')!,
      seed.clothingItems.find((c) => c.id === 'c-sneakers-white')!,
    ];
    expect(outfitDisplayName({ items, occasion: 'Everyday', feelsLike: 98, temperatureUnit: 'f' })).toBe(
      'Warm-weather basics'
    );
    expect(outfitDisplayName({ items, occasion: 'Everyday', feelsLike: 98, temperatureUnit: 'f' })).toBe(
      outfitDisplayName({ items, occasion: 'Everyday', feelsLike: 98, temperatureUnit: 'f' })
    );
    expect(outfitDisplayName({ items, savedName: 'Everyday hoodie fit' })).toBe('Everyday hoodie fit');
  });

  it('shortens engine explanations without inventing claims', () => {
    expect(
      conciseOutfitReason({
        explanation: {
          summary: 'weather',
          reasons: ["This outfit may suit today's temperature around 98°."],
        },
        feelsLike: 98,
        temperatureUnit: 'f',
      })
    ).toBe('Great for today’s heat');
  });
});

describe('collage layout', () => {
  it('places top, bottom, and shoes in a flat-lay instead of a grid', () => {
    const layout = collageLayout([
      { id: 't', role: 'top', category: 'top' },
      { id: 'b', role: 'bottom', category: 'bottom' },
      { id: 's', role: 'shoes', category: 'shoes' },
    ]);
    const top = layout.find((r) => r.id === 't')!;
    const bottom = layout.find((r) => r.id === 'b')!;
    const shoes = layout.find((r) => r.id === 's')!;
    expect(top.y).toBeLessThan(bottom.y);
    expect(bottom.y).toBeLessThan(shoes.y);
    expect(bottom.h).toBeGreaterThan(bottom.w);
    expect(shoes.w).toBeLessThan(top.w);
  });

  it('keeps outerwear beside the top instead of covering it', () => {
    const layout = collageLayout([
      { id: 'o', role: 'outerwear', category: 'outerwear' },
      { id: 't', role: 'top', category: 'top' },
      { id: 'b', role: 'bottom', category: 'bottom' },
      { id: 's', role: 'shoes', category: 'shoes' },
    ]);
    const outer = layout.find((r) => r.id === 'o')!;
    const top = layout.find((r) => r.id === 't')!;
    expect(outer.x).toBeLessThan(top.x);
    expect(top.zIndex).toBeGreaterThan(outer.zIndex);
  });
});
