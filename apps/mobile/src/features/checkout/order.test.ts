import { buildIdempotencyKey, submitOrder } from './order';
import type { OrderSummary } from './types';

const totals: OrderSummary = {
  subtotal: 12700,
  delivery: 1200,
  deliveryMode: 'normal',
  discount: 1500,
  total: 12400,
};

const cart = { merchantId: 'r4', lines: ['a:1', 'b:2'], total: 12400 };

describe('buildIdempotencyKey', () => {
  it('is stable for the same cart', () => {
    expect(buildIdempotencyKey(cart)).toBe(buildIdempotencyKey({ ...cart, lines: ['a:1', 'b:2'] }));
  });

  it('changes when the cart changes, because that is a different order', () => {
    expect(buildIdempotencyKey(cart)).not.toBe(buildIdempotencyKey({ ...cart, total: 9000 }));
  });

  it('does not depend on the order the lines happen to be in', () => {
    expect(buildIdempotencyKey(cart)).toBe(buildIdempotencyKey({ ...cart, lines: ['b:2', 'a:1'] }));
  });
});

describe('submitOrder', () => {
  const settle = (outcome: 'confirmed' | 'failed' | 'timeout') => async () => {
    if (outcome === 'timeout') return { outcome: 'timeout' as const };
    if (outcome === 'failed') return { outcome: 'failed' as const };
    return { outcome: 'confirmed' as const, providerReference: 'MCX-77' };
  };

  it('confirms a cash order without consulting a provider', async () => {
    const gateway = jest.fn(settle('confirmed'));
    const order = await submitOrder({
      key: 'k1',
      totals,
      settlesOnDelivery: true,
      gateway,
      now: () => 1000,
    });
    expect(gateway).not.toHaveBeenCalled();
    expect(order).toMatchObject({ status: 'confirmed', totals, createdAt: 1000 });
    expect(order.orderId).toMatch(/^#CM-/);
  });

  it('confirms a digital order the provider accepted', async () => {
    const order = await submitOrder({
      key: 'k2',
      totals,
      settlesOnDelivery: false,
      gateway: settle('confirmed'),
      now: () => 1000,
    });
    expect(order).toMatchObject({ status: 'confirmed', providerReference: 'MCX-77' });
  });

  /**
   * Board 19 · 04 and board 14, `processing → pending`: "Nunca assumir que um
   * timeout de pagamento é falha". A timeout keeps the reference so the state
   * can be polled, and never reports a failure the customer would act on.
   */
  it('reports a timeout as pending, never as failed', async () => {
    const order = await submitOrder({
      key: 'k3',
      totals,
      settlesOnDelivery: false,
      gateway: settle('timeout'),
      now: () => 1000,
    });
    expect(order.status).toBe('pending');
    expect(order.providerReference).toBe('k3');
  });

  it('reports a refusal as failed', async () => {
    const order = await submitOrder({
      key: 'k4',
      totals,
      settlesOnDelivery: false,
      gateway: settle('failed'),
      now: () => 1000,
    });
    expect(order.status).toBe('failed');
  });

  /**
   * Review focus 2. Two taps on "Tentar novamente" must produce one order:
   * the same key returns the order already created rather than creating a
   * second one, which is what keeps a retry from double-charging.
   */
  it('returns the same order for a repeated key instead of creating another', async () => {
    const gateway = jest.fn(settle('confirmed'));
    const first = await submitOrder({
      key: 'same',
      totals,
      settlesOnDelivery: false,
      gateway,
      now: () => 1,
    });
    const second = await submitOrder({
      key: 'same',
      totals,
      settlesOnDelivery: false,
      gateway,
      now: () => 2,
    });
    expect(second.orderId).toBe(first.orderId);
    expect(second.createdAt).toBe(first.createdAt);
    expect(gateway).toHaveBeenCalledTimes(1);
  });

  /** A failed attempt may be retried: only a created order is replayed. */
  it('retries after a failure instead of replaying it', async () => {
    const gateway = jest
      .fn<Promise<{ outcome: 'confirmed' | 'failed' }>, []>()
      .mockResolvedValueOnce({ outcome: 'failed' })
      .mockResolvedValueOnce({ outcome: 'confirmed' });
    const failed = await submitOrder({
      key: 'retry',
      totals,
      settlesOnDelivery: false,
      gateway,
      now: () => 1,
    });
    expect(failed.status).toBe('failed');
    const confirmed = await submitOrder({
      key: 'retry',
      totals,
      settlesOnDelivery: false,
      gateway,
      now: () => 2,
    });
    expect(confirmed.status).toBe('confirmed');
    expect(gateway).toHaveBeenCalledTimes(2);
  });
});
