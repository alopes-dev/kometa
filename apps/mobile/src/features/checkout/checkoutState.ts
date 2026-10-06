import { content } from './content';

/**
 * The state machine board 19 · 02 declares, and the CTA contract board 14
 * draws from it.
 *
 * Four independent state sets describe the checkout; the button has one slot.
 * `deriveCtaContract` is the only place that collapses the four into one
 * label, so the screens cannot disagree about what the customer is blocked on
 * — which is how a button ends up saying "Pagar" on a cart that cannot be paid.
 */

export type CartStatus = 'empty' | 'loading' | 'ready' | 'below-minimum' | 'invalid' | 'updating';
export type DeliveryStatus = 'missing' | 'selected' | 'unavailable' | 'validating' | 'valid';
export type PaymentStatus =
  'unselected' | 'selected' | 'unavailable' | 'processing' | 'failed' | 'success';
export type OrderStatus = 'draft' | 'submitting' | 'pending' | 'confirmed' | 'failed' | 'cancelled';

/** Which screen is asking. The same state reads differently on each. */
export type CheckoutStep = 'cart' | 'delivery' | 'payment' | 'review';

export type CheckoutSnapshot = {
  step: CheckoutStep;
  cart: CartStatus;
  delivery: DeliveryStatus;
  payment: PaymentStatus;
  order: OrderStatus;
  total: number;
  remainingToMinimum: number;
  /**
   * An invalid cart whose only outstanding change is an unavailable line. The
   * cart screen offers to drop it and carry on; anything else needs reading
   * first, so it gets the neutral "Aceitar alterações".
   */
  onlyUnavailable?: boolean;
};

export type CtaTone = 'brand' | 'disabled' | 'destructive';

export type CtaContract = {
  label: string;
  tone: CtaTone;
  enabled: boolean;
  icon?: 'spinner' | 'check';
};

export function deriveCtaContract(snapshot: CheckoutSnapshot): CtaContract {
  const { step, cart, delivery, payment, order, total, remainingToMinimum, onlyUnavailable } =
    snapshot;

  // The order outranks everything: once money is moving, nothing the cart says
  // may offer a second tap. Board 14, "Tap único, CTA bloqueado imediatamente".
  if (order === 'submitting' || order === 'pending' || payment === 'processing') {
    return { label: content.ctaProcessing, tone: 'brand', enabled: false, icon: 'spinner' };
  }
  if (order === 'confirmed' || payment === 'success') {
    return { label: content.ctaConfirmed, tone: 'brand', enabled: false, icon: 'check' };
  }
  if (order === 'failed' || payment === 'failed') {
    return { label: content.retry, tone: 'destructive', enabled: true };
  }

  // Then the cart, nearest reason first — fixing a payment method would not
  // let a below-minimum basket through, so the minimum is named first.
  if (cart === 'loading') {
    return { label: content.ctaLoadingTotal, tone: 'disabled', enabled: false };
  }
  if (cart === 'empty') {
    return { label: content.emptyAction, tone: 'brand', enabled: true };
  }
  if (cart === 'invalid') {
    return onlyUnavailable
      ? { label: content.removeAndContinue, tone: 'destructive', enabled: true }
      : { label: content.acceptChanges, tone: 'brand', enabled: true };
  }
  if (cart === 'below-minimum') {
    return {
      label: content.remainingToMinimum(remainingToMinimum),
      tone: 'disabled',
      enabled: false,
    };
  }

  // Then the two requirements, in the order the flow collects them.
  if (step !== 'cart') {
    if (delivery === 'missing' || delivery === 'unavailable') {
      return { label: content.ctaAddAddress, tone: 'disabled', enabled: false };
    }
    if (payment === 'unselected' || payment === 'unavailable') {
      return { label: content.ctaSelectPayment, tone: 'disabled', enabled: false };
    }
  }

  return {
    label: step === 'review' ? content.payAction(total) : content.continueToPayment(total),
    tone: 'brand',
    // A line still settling must not let a stale total be paid, but the label
    // stays put: re-labelling a button mid-tap moves the target under the finger.
    enabled: cart !== 'updating' && delivery !== 'validating',
  };
}

/** Which cart state a basket is in, given what the cart and revalidation know. */
export function deriveCartStatus({
  isLoading,
  isEmpty,
  hasOutstandingChanges,
  isUpdating,
  minimumMet,
}: {
  isLoading: boolean;
  isEmpty: boolean;
  hasOutstandingChanges: boolean;
  isUpdating: boolean;
  minimumMet: boolean;
}): CartStatus {
  if (isLoading) return 'loading';
  if (isEmpty) return 'empty';
  if (hasOutstandingChanges) return 'invalid';
  if (isUpdating) return 'updating';
  if (!minimumMet) return 'below-minimum';
  return 'ready';
}
