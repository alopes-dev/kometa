import {
  computeTotal,
  computeUnitPrice,
  formatBreakdown,
  resolveBasePrice,
  resolveHeadlinePrice,
} from './pricing';
import { getProductById } from './data';

const burger = getProductById('r4-1')!; // 3.000 Kz, bread + extras, both delta
const milkshake = getProductById('r4-4')!; // 1.800 Kz, no groups
const pizza = getProductById('r3-1')!; // 4.000 Kz, absolute size + extras
const offer = getProductById('r4-2')!; // 3.800 Kz, was 4.600 Kz

const plainBread = [{ groupId: 'pao', optionIds: ['pao-tradicional'] }];
const brioche = [{ groupId: 'pao', optionIds: ['pao-brioche'] }];
const twoExtras = [{ groupId: 'extras', optionIds: ['extra-bacon', 'extra-queijo'] }];
const large = [{ groupId: 'tamanho', optionIds: ['tamanho-grande'] }];
const pizzaExtras = [{ groupId: 'extras', optionIds: ['extra-queijo', 'extra-bacon'] }];

describe('resolveBasePrice', () => {
  it('uses the item price when every group prices by delta', () => {
    expect(resolveBasePrice(burger, brioche)).toBe(3000);
  });

  it('is replaced by the chosen option of an absolute group, not added to', () => {
    expect(resolveBasePrice(pizza, large)).toBe(6000);
  });

  it('falls back to the item price while the absolute group is undecided', () => {
    expect(resolveBasePrice(pizza, [])).toBe(4000);
  });
});

describe('computeUnitPrice', () => {
  it('returns the base price when nothing is selected', () => {
    expect(computeUnitPrice(burger, [])).toBe(3000);
  });

  it('sums every delta selection onto the base', () => {
    expect(computeUnitPrice(burger, [...brioche, ...twoExtras])).toBe(4500);
  });

  it('combines an absolute base with its deltas', () => {
    expect(computeUnitPrice(pizza, [...large, ...pizzaExtras])).toBe(7700);
  });

  // Review Focus 2 — a stale configuration must not poison the total.
  it('ignores group and option ids that no longer exist', () => {
    const stale = [
      { groupId: 'does-not-exist', optionIds: ['x'] },
      { groupId: 'extras', optionIds: ['extra-ghost'] },
    ];
    const total = computeUnitPrice(burger, stale);
    expect(total).toBe(3000);
    expect(Number.isNaN(total)).toBe(false);
  });
});

describe('computeTotal', () => {
  it('multiplies the unit price by the quantity', () => {
    expect(computeTotal(4500, 3)).toBe(13500);
  });
});

describe('resolveHeadlinePrice', () => {
  it('is exact for a plain product', () => {
    expect(resolveHeadlinePrice(milkshake, [])).toEqual({ kind: 'exact', value: 1800 });
  });

  it('is exact for a delta-only product, whatever is selected', () => {
    expect(resolveHeadlinePrice(burger, [...brioche, ...twoExtras])).toEqual({
      kind: 'exact',
      value: 3000,
    });
  });

  it('is "from" the cheapest option while an absolute group is undecided', () => {
    expect(resolveHeadlinePrice(pizza, [])).toEqual({ kind: 'from', value: 4000 });
  });

  // Review Focus 3 — extras must not be added onto an undecided base.
  it('stays "from" the cheapest option even when extras are already ticked', () => {
    expect(resolveHeadlinePrice(pizza, pizzaExtras)).toEqual({ kind: 'from', value: 4000 });
  });

  it('becomes the chosen variation once the absolute group is decided', () => {
    expect(resolveHeadlinePrice(pizza, large)).toEqual({
      kind: 'variant',
      value: 6000,
      variantLabel: 'Grande',
    });
  });

  it('is an offer when a previous price is higher, and states the saving', () => {
    expect(resolveHeadlinePrice(offer, [])).toEqual({
      kind: 'offer',
      value: 3800,
      previous: 4600,
      savings: 800,
    });
  });
});

describe('formatBreakdown', () => {
  it('counts units for a product with no groups', () => {
    expect(formatBreakdown(milkshake, [], 1)).toBe('1 un. × 1.800 Kz');
  });

  it('names the discount instead of a sum for an offer', () => {
    expect(formatBreakdown(offer, [], 1)).toBe('1 un. · preço com desconto');
  });

  it('separates the base from the extras', () => {
    expect(formatBreakdown(burger, [...plainBread, ...twoExtras], 1)).toBe(
      '1 × 3.000 Kz + extras · 1.200 Kz'
    );
  });

  it('names the variation when the base came from an absolute group', () => {
    expect(formatBreakdown(pizza, [...large, ...pizzaExtras], 1)).toBe(
      'Grande 6.000 Kz + extras 1.700 Kz'
    );
  });

  it('omits the extras clause when nothing was added', () => {
    expect(formatBreakdown(burger, plainBread, 2)).toBe('2 × 3.000 Kz');
  });

  it('carries the quantity into the unit count', () => {
    expect(formatBreakdown(milkshake, [], 3)).toBe('3 un. × 1.800 Kz');
  });
});
