import { acceptChanges, revalidateCart, isCartBlocked } from './availability';

const lines = [
  { lineId: 'a', productId: 'r4-1', name: 'Classic Burger', basePrice: 5500, lineTotal: 5500 },
  { lineId: 'b', productId: 'r4-5', name: 'Coca-Cola 1.5L', basePrice: 1800, lineTotal: 1800 },
];

const catalogue = {
  'r4-1': { price: 5500, available: true },
  'r4-5': { price: 1800, available: true },
};

describe('revalidateCart', () => {
  it('finds nothing when the catalogue still agrees with the cart', () => {
    expect(revalidateCart(lines, { catalogue })).toEqual([]);
  });

  it('reports a line whose product went unavailable', () => {
    const changes = revalidateCart(lines, {
      catalogue: { ...catalogue, 'r4-5': { price: 1800, available: false } },
    });
    expect(changes).toEqual([
      { kind: 'unavailable', lineId: 'b', name: 'Coca-Cola 1.5L', amount: 1800 },
    ]);
  });

  it('reports a price that moved, in both directions', () => {
    const changes = revalidateCart(lines, {
      catalogue: { ...catalogue, 'r4-1': { price: 5700, available: true } },
    });
    expect(changes).toEqual([
      { kind: 'price-changed', lineId: 'a', name: 'Classic Burger', from: 5500, to: 5700 },
    ]);
  });

  it('reports the merchant being closed, with when it reopens', () => {
    const changes = revalidateCart(lines, {
      catalogue,
      merchant: { open: false, reopensAt: 'amanhã às 10:00' },
    });
    expect(changes).toEqual([{ kind: 'merchant-closed', reopensAt: 'amanhã às 10:00' }]);
  });

  it('reports an address that fell outside the delivery area', () => {
    const changes = revalidateCart(lines, {
      catalogue,
      area: { status: 'outside', zone: 'Kilamba' },
    });
    expect(changes).toEqual([{ kind: 'out-of-area', zone: 'Kilamba' }]);
  });

  /**
   * Board 15 draws all three banners stacked on one screen. Revalidation must
   * therefore report every change it finds, not stop at the first.
   */
  /**
   * A configured line costs more than the menu price it was built from. The
   * check is against the base price, so extras never read as a price change.
   */
  it('does not report a customised line as having changed price', () => {
    const configured = [
      { lineId: 'a', productId: 'r4-1', name: 'Classic Burger', basePrice: 5500, lineTotal: 7200 },
    ];
    expect(revalidateCart(configured, { catalogue })).toEqual([]);
  });

  it('values an unavailable line at what it is worth in the cart, not at its base price', () => {
    const configured = [
      { lineId: 'b', productId: 'r4-5', name: 'Coca-Cola 1.5L', basePrice: 1800, lineTotal: 3600 },
    ];
    const changes = revalidateCart(configured, {
      catalogue: { ...catalogue, 'r4-5': { price: 1800, available: false } },
    });
    expect(changes).toEqual([
      { kind: 'unavailable', lineId: 'b', name: 'Coca-Cola 1.5L', amount: 3600 },
    ]);
  });

  it('reports every change at once', () => {
    const changes = revalidateCart(lines, {
      catalogue: {
        'r4-1': { price: 5700, available: true },
        'r4-5': { price: 1800, available: false },
      },
      merchant: { open: false, reopensAt: 'amanhã às 10:00' },
    });
    expect(changes.map((change) => change.kind)).toEqual([
      'price-changed',
      'unavailable',
      'merchant-closed',
    ]);
  });

  it('treats a product missing from the catalogue as unavailable', () => {
    const changes = revalidateCart(lines, {
      catalogue: { 'r4-1': { price: 5500, available: true } },
    });
    expect(changes).toEqual([
      { kind: 'unavailable', lineId: 'b', name: 'Coca-Cola 1.5L', amount: 1800 },
    ]);
  });
});

describe('isCartBlocked', () => {
  it('is false with nothing to accept', () => {
    expect(isCartBlocked([])).toBe(false);
  });

  it('blocks on any outstanding change', () => {
    expect(isCartBlocked([{ kind: 'price-changed', lineId: 'a', name: 'X', from: 1, to: 2 }])).toBe(
      true
    );
  });

  /**
   * A closed merchant is not something the customer can accept away — the
   * checkout stays blocked even after the acceptable changes are accepted.
   */
  it('keeps blocking on a closed merchant after acceptance', () => {
    const changes = [{ kind: 'merchant-closed' as const, reopensAt: 'amanhã às 10:00' }];
    expect(isCartBlocked(acceptChanges(changes))).toBe(true);
  });

  it('clears once the acceptable changes are accepted', () => {
    const changes = [
      { kind: 'price-changed' as const, lineId: 'a', name: 'Classic Burger', from: 5500, to: 5700 },
      { kind: 'unavailable' as const, lineId: 'b', name: 'Coca-Cola 1.5L', amount: 1800 },
    ];
    expect(acceptChanges(changes)).toEqual([]);
    expect(isCartBlocked(acceptChanges(changes))).toBe(false);
  });
});
