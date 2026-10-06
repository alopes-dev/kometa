import type { AreaCheck } from './types';

/**
 * Revalidation — what board 19 · 04 requires on every return to the cart:
 * "revalidar disponibilidade, preço, área, mínimo e estado do merchant".
 *
 * The result is a list of *changes to accept*, not a boolean. Flow H makes the
 * distinction load-bearing: a restored cart whose prices moved must show the
 * customer what moved and wait for an explicit acceptance before the checkout
 * unlocks. A silent re-price is the defect this prevents.
 */

export type CartLineSnapshot = {
  lineId: string;
  productId: string;
  name: string;
  /**
   * The catalogue price of the product when it was added — NOT the configured
   * unit price. A burger with two extras costs more than the menu says it
   * does, so comparing the configured figure against the catalogue would
   * report a price change on every customised line.
   */
  basePrice: number;
  /** What the line is worth in the cart, used when it has to leave the total. */
  lineTotal: number;
};

export type CatalogueEntry = { price: number; available: boolean };

export type RevalidationInput = {
  catalogue: Record<string, CatalogueEntry>;
  merchant?: { open: boolean; reopensAt?: string };
  area?: AreaCheck;
};

export type CartChange =
  | { kind: 'price-changed'; lineId: string; name: string; from: number; to: number }
  /** `amount` is what leaves the total when the line is dropped. */
  | { kind: 'unavailable'; lineId: string; name: string; amount: number }
  | { kind: 'merchant-closed'; reopensAt?: string }
  | { kind: 'out-of-area'; zone: string };

export function revalidateCart(
  lines: CartLineSnapshot[],
  { catalogue, merchant, area }: RevalidationInput
): CartChange[] {
  const changes: CartChange[] = [];

  for (const line of lines) {
    const current = catalogue[line.productId];
    // A product the catalogue no longer carries is unavailable, not an error:
    // the customer still sees the line, and the cart still knows its price.
    if (!current || !current.available) {
      changes.push({
        kind: 'unavailable',
        lineId: line.lineId,
        name: line.name,
        amount: line.lineTotal,
      });
      continue;
    }
    if (current.price !== line.basePrice) {
      changes.push({
        kind: 'price-changed',
        lineId: line.lineId,
        name: line.name,
        from: line.basePrice,
        to: current.price,
      });
    }
  }

  if (merchant && !merchant.open) {
    changes.push({ kind: 'merchant-closed', reopensAt: merchant.reopensAt });
  }

  if (area?.status === 'outside') {
    changes.push({ kind: 'out-of-area', zone: area.zone });
  }

  return changes;
}

/**
 * Accepting a change drops it from the list — except for the two the customer
 * cannot accept away. A closed merchant and an undeliverable address are
 * conditions, not revisions: tapping "Aceitar alterações" must not pretend the
 * kitchen reopened.
 */
export function acceptChanges(changes: CartChange[]): CartChange[] {
  return changes.filter(
    (change) => change.kind === 'merchant-closed' || change.kind === 'out-of-area'
  );
}

export function isCartBlocked(changes: CartChange[]): boolean {
  return changes.length > 0;
}

/** The lines revalidation says must leave the total. */
export function unavailableLineIds(changes: CartChange[]): string[] {
  return changes.filter((change) => change.kind === 'unavailable').map((change) => change.lineId);
}
