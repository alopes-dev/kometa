import { courierCoordinate } from './position';
import { isSnapshotStale, SNAPSHOT_STALE_MS } from './store';
import { mockOrders } from './mockData';

describe('courierCoordinate', () => {
  /**
   * Board 18: "Nunca inventar posição entre atualizações." The signature is
   * the guarantee — there is no clock parameter, so there is nothing to
   * interpolate against. The marker moves when a stage lands and at no other
   * moment.
   */
  it('takes a stage and nothing else, so it cannot drift between updates', () => {
    expect(courierCoordinate.length).toBe(1);
    expect(courierCoordinate('transit')).toEqual(courierCoordinate('transit'));
  });

  it('holds the courier at the merchant until the order is collected', () => {
    const atMerchant = courierCoordinate('confirmed');
    expect(courierCoordinate('preparing')).toEqual(atMerchant);
    expect(courierCoordinate('ready')).toEqual(atMerchant);
    expect(courierCoordinate('assigned')).toEqual(atMerchant);
  });

  it('advances towards the customer once the order is moving', () => {
    const pickedUp = courierCoordinate('picked-up');
    const transit = courierCoordinate('transit');
    const arriving = courierCoordinate('arriving');
    expect(transit.latitude).not.toEqual(pickedUp.latitude);
    expect(Math.abs(arriving.latitude - courierCoordinate('delivered').latitude)).toBeLessThan(
      Math.abs(transit.latitude - courierCoordinate('delivered').latitude)
    );
  });

  it('puts the courier at the door once delivered', () => {
    expect(courierCoordinate('arrived')).toEqual(courierCoordinate('delivered'));
  });
});

describe('isSnapshotStale', () => {
  const order = { ...mockOrders[0], snapshotAt: 1_000_000 };

  /**
   * Board 13: an order whose state has not been confirmed recently is shown
   * as the last thing the app knew, datestamped — not as live.
   */
  it('is false while the snapshot is recent', () => {
    expect(isSnapshotStale(order, order.snapshotAt + SNAPSHOT_STALE_MS - 1)).toBe(false);
  });

  it('is true once the snapshot has aged past the threshold', () => {
    expect(isSnapshotStale(order, order.snapshotAt + SNAPSHOT_STALE_MS + 1)).toBe(true);
  });

  /** A delivered order is not stale — it is finished. */
  it('is false for an order that has stopped moving', () => {
    const done = { ...order, stage: 'delivered' as const };
    expect(isSnapshotStale(done, order.snapshotAt + SNAPSHOT_STALE_MS * 10)).toBe(false);
  });
});
