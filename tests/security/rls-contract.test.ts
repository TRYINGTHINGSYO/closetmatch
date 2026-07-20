import { describe, expect, it } from 'vitest';
import { sortedPairIds } from '../../utils/pairing';

describe('RLS ownership invariants (client-side contract)', () => {
  it('stores pairing ids in sorted order to prevent duplicates', () => {
    expect(sortedPairIds('b', 'a')).toEqual(['a', 'b']);
    expect(sortedPairIds('a', 'b')).toEqual(['a', 'b']);
  });

  it('documents that user_id must equal auth.uid() for owned rows', () => {
    const policy = (authUid: string, rowUserId: string) => authUid === rowUserId;
    expect(policy('user-1', 'user-1')).toBe(true);
    expect(policy('user-1', 'user-2')).toBe(false);
  });
});
