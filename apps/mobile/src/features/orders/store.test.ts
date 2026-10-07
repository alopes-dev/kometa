import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ORDERS_KEY,
  activeOrder,
  applyStageEvent,
  historyOrders,
  loadOrders,
  refundState,
  saveOrders,
} from './store';
import { mockOrders } from './mockData';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('activeOrder', () => {
  /**
   * Board 15: a pending payment is NOT a confirmed order. It has no stage, so
   * it cannot be the active order and must not start an operational ETA.
   */
  it('ignores an order whose payment has not settled', () => {
    const awaiting = { ...mockOrders[0], stage: null, paymentStatus: 'pending' as const };
    expect(activeOrder([awaiting])).toBeUndefined();
  });

  it('is the one order still moving', () => {
    const live = {
      ...mockOrders[0],
      stage: 'transit' as const,
      paymentStatus: 'confirmed' as const,
    };
    const done = {
      ...mockOrders[1],
      stage: 'delivered' as const,
      paymentStatus: 'confirmed' as const,
    };
    expect(activeOrder([done, live])?.orderId).toBe(live.orderId);
  });

  it('is nothing once everything has landed', () => {
    const done = { ...mockOrders[0], stage: 'delivered' as const };
    const gone = { ...mockOrders[1], stage: 'cancelled' as const };
    expect(activeOrder([done, gone])).toBeUndefined();
  });
});

describe('historyOrders', () => {
  it('lists the finished orders newest first', () => {
    const older = { ...mockOrders[0], stage: 'delivered' as const, placedAt: 1_000 };
    const newer = { ...mockOrders[1], stage: 'cancelled' as const, placedAt: 2_000 };
    expect(historyOrders([older, newer]).map((order) => order.placedAt)).toEqual([2_000, 1_000]);
  });

  it('leaves the active order out of the history', () => {
    const live = { ...mockOrders[0], stage: 'transit' as const };
    expect(historyOrders([live])).toEqual([]);
  });

  /** An unpaid order is not history either — it has not happened yet. */
  it('leaves an unsettled order out of the history', () => {
    const awaiting = { ...mockOrders[0], stage: null, paymentStatus: 'pending' as const };
    expect(historyOrders([awaiting])).toEqual([]);
  });
});

describe('applyStageEvent', () => {
  it('moves the stage, appends the event and stamps the snapshot', () => {
    const order = { ...mockOrders[0], stage: 'ready' as const, events: [], snapshotAt: 0 };
    const next = applyStageEvent(order, { stage: 'assigned', occurredAt: 5_000 });
    expect(next).toMatchObject({ stage: 'assigned', snapshotAt: 5_000 });
    expect(next.events).toEqual([{ stage: 'assigned', occurredAt: 5_000 }]);
  });

  /** Board 18: never invent state. An event for a stage already passed is noise. */
  it('ignores an event that would move the order backwards', () => {
    const order = { ...mockOrders[0], stage: 'transit' as const, events: [], snapshotAt: 9_000 };
    expect(applyStageEvent(order, { stage: 'ready', occurredAt: 10_000 })).toBe(order);
  });

  /** An order awaiting payment has no stage to advance from. */
  it('ignores an event for an order whose payment has not settled', () => {
    const order = { ...mockOrders[0], stage: null, paymentStatus: 'pending' as const };
    expect(applyStageEvent(order, { stage: 'confirmed', occurredAt: 10_000 })).toBe(order);
  });

  /**
   * Final review, Important 10. `stageIndex('cancelled')` is -1, so a naive
   * forward check lets ANY stage past it. A cancelled order that comes back
   * to life is worse than one that will not move.
   */
  it('refuses to move an order that has already ended', () => {
    const done = { ...mockOrders[0], stage: 'cancelled' as const, events: [], snapshotAt: 0 };
    expect(applyStageEvent(done, { stage: 'transit', occurredAt: 12_000 })).toBe(done);

    const delivered = { ...mockOrders[0], stage: 'delivered' as const, events: [], snapshotAt: 0 };
    expect(applyStageEvent(delivered, { stage: 'cancelled', occurredAt: 12_000 })).toBe(delivered);
  });

  it('accepts a cancellation from anywhere on the line', () => {
    const order = { ...mockOrders[0], stage: 'transit' as const, events: [], snapshotAt: 0 };
    expect(applyStageEvent(order, { stage: 'cancelled', occurredAt: 11_000 })).toMatchObject({
      stage: 'cancelled',
    });
  });
});

describe('refundState', () => {
  /**
   * Final review, Important 14. An order cancelled before it was ever paid
   * has nothing to refund, and telling the customer money is coming back is
   * a promise the app cannot keep. The spec models this as
   * `Cancel { reason, refundState, refundWindow }`.
   */
  it('is none when the payment never settled', () => {
    const unpaid = { ...mockOrders[0], paymentStatus: 'pending' as const, stage: null };
    expect(refundState(unpaid)).toBe('none');
  });

  it('is started once a settled payment is cancelled', () => {
    const paid = {
      ...mockOrders[0],
      paymentStatus: 'confirmed' as const,
      stage: 'cancelled' as const,
    };
    expect(refundState(paid)).toBe('started');
  });

  it('is none for an order that was delivered, not cancelled', () => {
    expect(refundState({ ...mockOrders[1], stage: 'delivered' as const })).toBe('none');
  });
});

describe('persistence', () => {
  it('round-trips the orders it saved', async () => {
    await saveOrders(mockOrders);
    const result = await loadOrders();
    expect(result.ok).toBe(true);
    expect(result.orders.map((order) => order.orderId)).toEqual(
      mockOrders.map((order) => order.orderId)
    );
  });

  /**
   * A payload written by an older build, or truncated mid-write, is discarded
   * rather than trusted. Returning it half-parsed would put the orders list
   * into a state no screen is written for.
   */
  it('reports no orders rather than throwing on a corrupt payload', async () => {
    await AsyncStorage.setItem(ORDERS_KEY, '{ this is not json');
    await expect(loadOrders()).resolves.toEqual({ ok: false, orders: [] });
  });

  it('reports no orders when nothing was ever saved', async () => {
    await expect(loadOrders()).resolves.toEqual({ ok: true, orders: [] });
  });

  /**
   * Final review, Important 9. The guard claimed to check "the fields no list
   * row can be rendered without" but checked three that a row never reads.
   * A record without `lines` crashes OrderHistoryRow at `lines.reduce`.
   */
  it('discards a record missing the fields a row actually renders', async () => {
    await AsyncStorage.setItem(
      ORDERS_KEY,
      JSON.stringify([{ orderId: 'X', merchantId: 'r1', events: [] }])
    );
    await expect(loadOrders()).resolves.toEqual({ ok: true, orders: [] });
  });

  /**
   * Final review, Important 8. A read that THREW is not the same as a device
   * with no saved orders: treating it as empty lets the provider seed
   * fixtures and write them over real history. "Nunca apagar contexto."
   */
  it('distinguishes a failed read from an empty one', async () => {
    const getItem = jest
      .spyOn(AsyncStorage, 'getItem')
      .mockRejectedValueOnce(new Error('storage unavailable'));
    await expect(loadOrders()).resolves.toEqual({ ok: false, orders: [] });
    getItem.mockRestore();
  });
});
