import { computeOrderSummary, describeDelivery } from './pricing';

describe('computeOrderSummary', () => {
  it('states the four lines the board draws and nothing else', () => {
    const summary = computeOrderSummary({ subtotal: 12700, deliveryFee: 1200, discount: 1500 });
    expect(summary).toEqual({
      subtotal: 12700,
      delivery: 1200,
      deliveryMode: 'normal',
      discount: 1500,
      total: 12400,
    });
  });

  it('treats a zero fee as free delivery, not as a missing line', () => {
    const summary = computeOrderSummary({ subtotal: 12700, deliveryFee: 0, discount: 1500 });
    expect(summary.deliveryMode).toBe('free');
    expect(summary.total).toBe(11200);
  });

  it('marks a surged fee as dynamic so the screen can explain the cause', () => {
    const summary = computeOrderSummary({
      subtotal: 12700,
      deliveryFee: 1600,
      discount: 1500,
      surged: true,
    });
    expect(summary.deliveryMode).toBe('dynamic');
    expect(summary.total).toBe(12800);
  });

  it('returns zeroes for an empty cart', () => {
    expect(computeOrderSummary({ subtotal: 0, deliveryFee: 0 })).toEqual({
      subtotal: 0,
      delivery: 0,
      deliveryMode: 'free',
      discount: 0,
      total: 0,
    });
  });

  /**
   * Board 19 · 05: a discount is a negative line, not a lower subtotal. A
   * promo worth more than the basket must not invert the total into money
   * owed to the customer.
   */
  it('never lets a discount push the total below zero', () => {
    const summary = computeOrderSummary({ subtotal: 1000, deliveryFee: 0, discount: 5000 });
    expect(summary.discount).toBe(1000);
    expect(summary.total).toBe(0);
  });

  it('charges delivery on top of a fully discounted basket', () => {
    const summary = computeOrderSummary({ subtotal: 1000, deliveryFee: 800, discount: 5000 });
    expect(summary.total).toBe(800);
  });
});

describe('describeDelivery', () => {
  it('writes a free fee as the word, not as 0 Kz', () => {
    expect(describeDelivery({ subtotal: 0, deliveryFee: 0 })).toBe('Grátis');
  });

  it('writes any other fee as money', () => {
    expect(describeDelivery({ subtotal: 0, deliveryFee: 1200 })).toBe('1.200 Kz');
    expect(describeDelivery({ subtotal: 0, deliveryFee: 1600, surged: true })).toBe('1.600 Kz');
  });
});
