import { formatKwanza } from '../home/format';
import { content } from './content';
import type { DeliveryMode, OrderSummary, PriceInput } from './types';

/**
 * The order summary, as board 03 draws it: Subtotal, Entrega, Desconto, Total.
 *
 * There is no VAT line and no tip line. The previous implementation added
 * both, and neither appears on any of the nineteen boards — board 19 · 05 asks
 * that the customer be able to verify the total from what is on screen, and a
 * number that is charged but never shown cannot be verified. Angolan menu
 * prices are quoted VAT-inclusive, so the tax was being added a second time.
 */
export function computeOrderSummary({
  subtotal,
  deliveryFee,
  discount = 0,
  surged = false,
}: PriceInput): OrderSummary {
  // A promotion worth more than the basket discounts the basket, not the
  // delivery: capping here keeps `total` from inverting into a refund.
  const applied = Math.min(Math.round(discount), subtotal);
  return {
    subtotal,
    delivery: deliveryFee,
    deliveryMode: deliveryMode({ deliveryFee, surged }),
    discount: applied,
    total: subtotal - applied + deliveryFee,
  };
}

function deliveryMode({
  deliveryFee,
  surged,
}: {
  deliveryFee: number;
  surged: boolean;
}): DeliveryMode {
  if (deliveryFee === 0) return 'free';
  return surged ? 'dynamic' : 'normal';
}

/**
 * How the delivery line reads. Free delivery is a word rather than `0 Kz`:
 * board 09 colours it with the brand and gives it a chip, because a zero is
 * read as a missing value where "Grátis" is read as a benefit.
 */
export function describeDelivery(input: PriceInput): string {
  return computeOrderSummary(input).delivery === 0 ? content.free : formatKwanza(input.deliveryFee);
}
