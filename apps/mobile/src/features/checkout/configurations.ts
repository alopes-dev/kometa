import type { CartItem } from '@/hooks/CartProvider';

/**
 * How many cart lines belong to a product that appears more than once.
 *
 * Board 05 E: the same product configured two ways stays as two lines, and
 * the cart says so. Without that sentence a customer reading two identical
 * names assumes the cart double-counted and removes one.
 *
 * Lines of a product that appears once are not configurations in this sense
 * — there is nothing to tell apart — so they do not count.
 */
export function countSeparateConfigurations(items: CartItem[]): number {
  const linesPerProduct = new Map<string, number>();
  for (const entry of items) {
    linesPerProduct.set(entry.item.id, (linesPerProduct.get(entry.item.id) ?? 0) + 1);
  }

  return items.reduce(
    (total, entry) => total + ((linesPerProduct.get(entry.item.id) ?? 0) > 1 ? 1 : 0),
    0
  );
}
