import { describe, expect, it } from 'vitest';
import { calculatePairingScoreClient } from '../../utils/pairing';

describe('pairing score', () => {
  it('increases with worn/saved/accepted/mirror positive', () => {
    const low = calculatePairingScoreClient({
      worn: 0,
      saved: 0,
      accepted: 0,
      rejected: 0,
      replacements: 0,
      avgRating: 3,
      mirrorPos: 0,
      mirrorNeg: 0,
    });
    const high = calculatePairingScoreClient({
      worn: 8,
      saved: 5,
      accepted: 4,
      rejected: 0,
      replacements: 0,
      avgRating: 4.7,
      mirrorPos: 5,
      mirrorNeg: 0,
    });
    expect(high).toBeGreaterThan(low);
    expect(high).toBeGreaterThan(0.85);
  });

  it('decreases with rejected pairings and replacements', () => {
    const score = calculatePairingScoreClient({
      worn: 0,
      saved: 0,
      accepted: 0,
      rejected: 4,
      replacements: 3,
      avgRating: 1.5,
      mirrorPos: 0,
      mirrorNeg: 2,
    });
    expect(score).toBeLessThan(0.25);
  });
});
