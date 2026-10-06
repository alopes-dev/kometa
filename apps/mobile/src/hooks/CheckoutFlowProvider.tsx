import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import type { Order, PaymentMethodId } from '@/features/checkout/types';

/**
 * Everything the checkout path collects, in the shape board 19 · 03 declares.
 *
 * `Delivery` and `Payment` are the board's two entities, kept flat here
 * because the screens read them one field at a time. What is deliberately
 * absent is what no board draws: a tip, a schedule and a delivery-type switch.
 * The Figma checkout is one decision per screen, and each of those three was a
 * decision the customer was asked to make for no reason the design gives.
 *
 * Every field survives going back — board 13, "Voltar sem perder dados" —
 * which is why `reset` is only ever called once an order is confirmed.
 */
export type CheckoutFlowState = {
  addressId: string | null;
  /** Board 11: ≤120 characters, free text, optional. */
  instructions: string;
  /** Board 11: used only to coordinate this delivery. */
  phone: string;
  paymentMethodId: PaymentMethodId | null;
  promoCode: string | null;
  /** The order, once one exists. Board 14 persists it before confirming. */
  order: Order | null;
};

export type CheckoutFlowContextValue = CheckoutFlowState & {
  setAddressId: (id: string) => void;
  setInstructions: (instructions: string) => void;
  setPhone: (phone: string) => void;
  setPaymentMethodId: (id: PaymentMethodId) => void;
  setPromoCode: (code: string | null) => void;
  setOrder: (order: Order | null) => void;
  reset: () => void;
};

const INITIAL_STATE: CheckoutFlowState = {
  addressId: null,
  instructions: '',
  phone: '',
  paymentMethodId: null,
  promoCode: null,
  order: null,
};

export const CheckoutFlowContext = createContext<CheckoutFlowContextValue | null>(null);

export function CheckoutFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CheckoutFlowState>(INITIAL_STATE);

  const setAddressId = useCallback((addressId: string) => {
    setState((current) => ({ ...current, addressId }));
  }, []);

  const setInstructions = useCallback((instructions: string) => {
    setState((current) => ({ ...current, instructions }));
  }, []);

  const setPhone = useCallback((phone: string) => {
    setState((current) => ({ ...current, phone }));
  }, []);

  const setPaymentMethodId = useCallback((paymentMethodId: PaymentMethodId) => {
    setState((current) => ({ ...current, paymentMethodId }));
  }, []);

  const setPromoCode = useCallback((promoCode: string | null) => {
    setState((current) => ({ ...current, promoCode }));
  }, []);

  const setOrder = useCallback((order: Order | null) => {
    setState((current) => ({ ...current, order }));
  }, []);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  const value = useMemo<CheckoutFlowContextValue>(
    () => ({
      ...state,
      setAddressId,
      setInstructions,
      setPhone,
      setPaymentMethodId,
      setPromoCode,
      setOrder,
      reset,
    }),
    [
      state,
      setAddressId,
      setInstructions,
      setPhone,
      setPaymentMethodId,
      setPromoCode,
      setOrder,
      reset,
    ]
  );

  return <CheckoutFlowContext.Provider value={value}>{children}</CheckoutFlowContext.Provider>;
}
