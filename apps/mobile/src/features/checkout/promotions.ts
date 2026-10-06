import type { Promo } from './types';

/**
 * Promotion codes, evaluated as a state rather than as a boolean.
 *
 * Board 09 draws six outcomes for one field — idle, validating, applied,
 * invalid, expired, minimum-not-met — and each says something different about
 * what to do next. Collapsing them into "valid / invalid" is what produces the
 * unhelpful "código inválido" on a code that was merely expired.
 *
 * Evaluation is re-run whenever the basket changes, because the answer depends
 * on the subtotal: an applied code can become `minimum-not-met` when an item
 * goes unavailable.
 */
export type PromoEvaluation =
  /** Nothing typed yet. Not a failure, so nothing is said. */
  | { state: 'idle' }
  | { state: 'validating' }
  | { state: 'applied'; promo: Promo; discount: number }
  | { state: 'invalid' }
  | { state: 'expired'; promo: Promo; discount: 0 }
  | { state: 'minimum-not-met'; promo: Promo; discount: 0; remaining: number };

export const PROMOS: Record<string, Promo> = {
  COMETA1500: {
    code: 'COMETA1500',
    discount: 1500,
    minimumSubtotal: 10000,
    usageNote: '1 uso por cliente',
  },
  VERAO: {
    code: 'VERAO',
    discount: 2000,
    minimumSubtotal: 0,
    endedOn: '30 de Setembro',
  },
};

/**
 * `override` exists for the tests and for a server-sent rule: the fixture is
 * the default, not the authority.
 */
export function evaluatePromo(
  input: string,
  subtotal: number,
  override?: Partial<Promo>
): PromoEvaluation {
  const code = input.trim().toUpperCase();
  if (code.length === 0) return { state: 'idle' };

  const known = PROMOS[code];
  if (!known) return { state: 'invalid' };

  const promo = override ? { ...known, ...override } : known;

  if (promo.endedOn) return { state: 'expired', promo, discount: 0 };

  const remaining = promo.minimumSubtotal - subtotal;
  if (remaining > 0) return { state: 'minimum-not-met', promo, discount: 0, remaining };

  return { state: 'applied', promo, discount: Math.min(promo.discount, subtotal) };
}

/** What the summary should subtract — zero unless the code actually applied. */
export function promoDiscount(evaluation: PromoEvaluation): number {
  return evaluation.state === 'applied' ? evaluation.discount : 0;
}
