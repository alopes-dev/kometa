import { useEffect, useState } from 'react';
import { clearSession, loadSession, saveSession, type CheckoutSession } from '@/features/checkout/session';
import { useCart } from './useCart';
import { useCheckoutFlow } from './useCheckoutFlow';

/**
 * Keeps the checkout session on disk, and hands back the one found at launch.
 *
 * Board 19 · 04 lists what has to survive an interruption; board 15 shows what
 * it is for — a customer who comes back is offered "Continuar o teu pedido"
 * rather than an empty cart. The save runs on every change to what the board
 * names, so the last state to reach the screen is the one that is restored.
 *
 * `restored` is read once, at mount, and is deliberately not cleared by the
 * save: a cart that is still empty must keep seeing the prompt until the
 * customer answers it.
 */
export function useCheckoutSession() {
  const { items, restaurantId } = useCart();
  const { addressId, instructions, phone, paymentMethodId, promoCode } = useCheckoutFlow();
  const [restored, setRestored] = useState<CheckoutSession | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadSession().then((session) => {
      if (cancelled) return;
      setRestored(session);
      setIsChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // An empty cart has nothing to restore, and persisting it would overwrite
    // the session the customer is still being offered.
    if (!restaurantId || items.length === 0) return;

    saveSession({
      merchantId: restaurantId,
      lines: items.map((entry) => ({
        lineId: entry.lineId,
        productId: entry.item.id,
        quantity: entry.quantity,
        unitPrice: entry.unitPrice,
        selections: entry.selections,
        notes: entry.notes,
      })),
      promoCode,
      addressId,
      phone,
      instructions,
      paymentMethodId,
      savedAt: Date.now(),
    });
  }, [items, restaurantId, promoCode, addressId, phone, instructions, paymentMethodId]);

  return {
    /** The session found at launch, if any. Null once discarded. */
    restored,
    isChecking,
    discard: () => {
      setRestored(null);
      clearSession();
    },
  };
}
