import { describe, expect, it } from 'vitest';
import { sameIdSet, shuffled } from '../../lib/array';

describe('shuffled', () => {
  it('keeps the same items', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    const next = shuffled(items);
    expect(next).toHaveLength(items.length);
    expect([...next].sort()).toEqual([...items].sort());
    expect(next).not.toBe(items);
  });
});

describe('sameIdSet', () => {
  it('matches unordered outfit item ids', () => {
    expect(sameIdSet(['top', 'jeans'], ['jeans', 'top'])).toBe(true);
    expect(sameIdSet(['top'], ['top', 'jeans'])).toBe(false);
  });
});
