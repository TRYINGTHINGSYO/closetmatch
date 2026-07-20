/** Client-side mirror of SQL calculate_pairing_score for unit tests */
export function calculatePairingScoreClient(input: {
  worn: number;
  saved: number;
  accepted: number;
  rejected: number;
  replacements: number;
  avgRating: number | null;
  mirrorPos: number;
  mirrorNeg: number;
}): number {
  const positive =
    input.worn * 0.08 +
    input.saved * 0.06 +
    input.accepted * 0.1 +
    ((input.avgRating ?? 3) - 3) * 0.08 +
    input.mirrorPos * 0.07;
  const negative = input.rejected * 0.12 + input.replacements * 0.08 + input.mirrorNeg * 0.07;
  const score = Math.max(0, Math.min(1, 0.5 + positive - negative));
  return Math.round(score * 10000) / 10000;
}

export function sortedPairIds(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}
