/**
 * The merchant's minimum basket, evaluated as progress rather than as a
 * verdict.
 *
 * Board 08 asks for three things a boolean cannot carry: how much is missing
 * (in money, never a percentage), how far along the bar should be, and whether
 * the rule applies at all. A merchant without a minimum is "met" rather than
 * "0 of 0", so the progress card never renders with nothing to explain.
 */
export type MinimumEvaluation = {
  met: boolean;
  /** What must still be added. `0` once the rule is satisfied. */
  remaining: number;
  /** 0–1, for the progress track. Capped so an over-filled basket stays full. */
  ratio: number;
  minimum: number;
};

export function evaluateMinimum(subtotal: number, minimum: number | undefined): MinimumEvaluation {
  const threshold = minimum ?? 0;
  if (threshold <= 0) return { met: true, remaining: 0, ratio: 1, minimum: 0 };

  const remaining = Math.max(0, threshold - subtotal);
  return {
    met: remaining === 0,
    remaining,
    ratio: Math.min(1, subtotal / threshold),
    minimum: threshold,
  };
}
