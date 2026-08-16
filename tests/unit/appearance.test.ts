import { describe, expect, it } from 'vitest';
import { applyAppearance, normalizeHex, resolveAccent } from '@/constants/appearance';
import { colors } from '@/constants/theme';

describe('appearance', () => {
  it('normalizes 3 and 6 digit hex colors', () => {
    expect(normalizeHex('#c4a')).toBe('#CC44AA');
    expect(normalizeHex('1f7a6b')).toBe('#1F7A6B');
    expect(normalizeHex('not-a-color')).toBeNull();
  });

  it('applies a custom accent to buttons and highlights', () => {
    const themed = applyAppearance(
      colors.light,
      {
        mode: 'light',
        colorTheme: 'custom',
        accentColor: '#C45C6A',
        backgroundStyle: 'soft-gradient',
        backgroundImageUri: null,
      },
      false
    );
    expect(themed.accent).toBe('#C45C6A');
    expect(themed.accentSoft.toLowerCase()).not.toBe('#c45c6a');
  });

  it('uses palette accents for named themes', () => {
    expect(
      resolveAccent({
        mode: 'system',
        colorTheme: 'ocean',
        accentColor: null,
        backgroundStyle: 'soft-gradient',
        backgroundImageUri: null,
      })
    ).toBe('#2A6F97');
  });
});
