import type { CartSelection } from '@/hooks/CartProvider';
import { formatKwanza } from '../home/format';
import type { ModifierGroup, Product } from './types';

/**
 * What the header shows under the name — board 02, "Pricing · sem surpresas".
 * The four kinds are the four cards it draws, and nothing else is a price.
 */
export type HeadlinePrice =
  | { kind: 'from'; value: number }
  | { kind: 'variant'; value: number; variantLabel: string }
  | { kind: 'offer'; value: number; previous: number; savings: number }
  | { kind: 'exact'; value: number };

function groupsOf(product: Product): ModifierGroup[] {
  return product.modifierGroups ?? [];
}

/**
 * At most one group may set the base price. The board never draws two, and a
 * second would make "A partir de" ambiguous — which variation is it from?
 */
function absoluteGroup(product: Product): ModifierGroup | undefined {
  return groupsOf(product).find((group) => group.pricing === 'absolute');
}

/** The chosen option of a group, or undefined — an unknown id resolves to nothing. */
function chosenOption(group: ModifierGroup, selections: CartSelection[]) {
  const optionId = selections.find((candidate) => candidate.groupId === group.id)?.optionIds[0];
  return group.options.find((option) => option.id === optionId);
}

function isOffer(product: Product): boolean {
  return product.previousPrice !== undefined && product.previousPrice > product.price;
}

export function resolveBasePrice(product: Product, selections: CartSelection[]): number {
  const group = absoluteGroup(product);
  if (!group) return product.price;
  return chosenOption(group, selections)?.price ?? product.price;
}

/**
 * Only delta groups contribute here — the absolute group sets the base
 * instead, and counting it twice is the arithmetic error this split exists
 * to make impossible.
 */
function sumDeltas(product: Product, selections: CartSelection[]): number {
  return groupsOf(product)
    .filter((group) => group.pricing === 'delta')
    .reduce((total, group) => {
      const selection = selections.find((candidate) => candidate.groupId === group.id);
      if (!selection) return total;
      return (
        total +
        selection.optionIds.reduce((sum, optionId) => {
          const option = group.options.find((candidate) => candidate.id === optionId);
          // An id that no longer exists contributes nothing rather than NaN:
          // a stale configuration must still price.
          return sum + (option?.price ?? 0);
        }, 0)
      );
    }, 0);
}

export function computeUnitPrice(product: Product, selections: CartSelection[]): number {
  return resolveBasePrice(product, selections) + sumDeltas(product, selections);
}

export function computeTotal(unitPrice: number, quantity: number): number {
  return unitPrice * quantity;
}

export function resolveHeadlinePrice(
  product: Product,
  selections: CartSelection[]
): HeadlinePrice {
  if (isOffer(product)) {
    const previous = product.previousPrice!;
    return { kind: 'offer', value: product.price, previous, savings: previous - product.price };
  }

  const group = absoluteGroup(product);
  if (group) {
    const chosen = chosenOption(group, selections);
    // "A partir de" survives until the variation is decided. Extras never
    // move it: there is no base yet for them to sit on top of, and showing a
    // number that includes them would promise a price the customer has not
    // finished choosing.
    if (!chosen) {
      return { kind: 'from', value: Math.min(...group.options.map((option) => option.price)) };
    }
    return { kind: 'variant', value: chosen.price, variantLabel: chosen.label };
  }

  return { kind: 'exact', value: product.price };
}

/**
 * The footer's left-hand line — board 03, 04 and 06 each write it differently,
 * and the difference is what the customer is being charged for.
 */
export function formatBreakdown(
  product: Product,
  selections: CartSelection[],
  quantity: number
): string {
  if (isOffer(product)) {
    return `${quantity} un. · preço com desconto`;
  }

  if (groupsOf(product).length === 0) {
    return `${quantity} un. × ${formatKwanza(product.price)}`;
  }

  const group = absoluteGroup(product);
  const chosen = group ? chosenOption(group, selections) : undefined;
  const base = resolveBasePrice(product, selections);
  const extras = sumDeltas(product, selections);

  const head = chosen
    ? `${chosen.label} ${formatKwanza(base)}`
    : `${quantity} × ${formatKwanza(base)}`;

  if (extras === 0) return head;

  // The middot only appears on the delta form, exactly as the board writes
  // it: "1 × 4.500 Kz + extras · 1.700 Kz" against "Grande 7.500 Kz + extras
  // 2.200 Kz".
  return chosen
    ? `${head} + extras ${formatKwanza(extras)}`
    : `${head} + extras · ${formatKwanza(extras)}`;
}
