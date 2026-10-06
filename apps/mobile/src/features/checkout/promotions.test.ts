import { evaluatePromo, PROMOS } from './promotions';

describe('evaluatePromo', () => {
  it('applies a known code and reports what it saved', () => {
    expect(evaluatePromo('COMETA1500', 12700)).toEqual({
      state: 'applied',
      promo: PROMOS.COMETA1500,
      discount: 1500,
    });
  });

  it('accepts the code however it was typed', () => {
    expect(evaluatePromo('  cometa1500 ', 12700).state).toBe('applied');
  });

  it('rejects an unknown code', () => {
    expect(evaluatePromo('BEMVINDO', 12700)).toEqual({ state: 'invalid' });
  });

  it('rejects an empty code without calling it invalid', () => {
    expect(evaluatePromo('   ', 12700)).toEqual({ state: 'idle' });
  });

  it('reports an expired code with the date it ended', () => {
    expect(evaluatePromo('VERAO', 12700)).toEqual({
      state: 'expired',
      promo: PROMOS.VERAO,
      discount: 0,
    });
  });

  /**
   * Board 09: the minimum is stated as the gap, not as the threshold — the
   * customer is told what to add, not what the rule is.
   */
  it('reports the gap when the basket is under the code minimum', () => {
    expect(evaluatePromo('COMETA1500', 12700, { minimumSubtotal: 15000 })).toEqual({
      state: 'minimum-not-met',
      promo: { ...PROMOS.COMETA1500, minimumSubtotal: 15000 },
      discount: 0,
      remaining: 2300,
    });
  });

  /**
   * Review focus 3. An item going unavailable lowers the subtotal, which can
   * drop the basket under the code's minimum — the discount falls away and
   * the total goes up. The same code must stop applying on re-evaluation.
   */
  it('stops applying once the basket falls under the minimum', () => {
    const promo = { ...PROMOS.COMETA1500, minimumSubtotal: 12000 };
    expect(evaluatePromo('COMETA1500', 12700, promo).state).toBe('applied');
    expect(evaluatePromo('COMETA1500', 10900, promo).state).toBe('minimum-not-met');
  });

  it('never discounts more than the basket holds', () => {
    const reachable = { minimumSubtotal: 0 };
    expect(evaluatePromo('COMETA1500', 900, reachable)).toMatchObject({
      state: 'applied',
      discount: 900,
    });
  });
});
