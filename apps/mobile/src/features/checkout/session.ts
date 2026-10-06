import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PaymentMethodId } from './types';

/**
 * The saved checkout session — board 19 · 04, "Persistência e interrupção".
 *
 * The board names exactly what must survive: "itens, opções, quantidades,
 * promoção, endereço, telefone, instruções e método". Board 15 then shows what
 * it is for: a customer who comes back is offered "Continuar o teu pedido"
 * with a summary of what was kept, rather than an empty cart.
 *
 * Nothing here throws. A storage failure degrades to "no saved session",
 * because a restore that crashes loses a cart the customer still believes in.
 */

export const CHECKOUT_SESSION_KEY = 'kometa:checkoutSession';

export type SessionLine = {
  lineId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  selections?: { groupId: string; optionIds: string[] }[];
  notes?: string;
};

export type CheckoutSession = {
  merchantId: string;
  lines: SessionLine[];
  promoCode?: string | null;
  addressId?: string | null;
  phone?: string;
  instructions?: string;
  paymentMethodId?: PaymentMethodId | null;
  /** When the interruption happened — board 15 shows it in the resume prompt. */
  savedAt: number;
};

export async function saveSession(session: CheckoutSession): Promise<void> {
  try {
    await AsyncStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(session));
  } catch {
    // A cart that cannot be persisted is still a cart in memory.
  }
}

export async function loadSession(): Promise<CheckoutSession | null> {
  try {
    const raw = await AsyncStorage.getItem(CHECKOUT_SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHECKOUT_SESSION_KEY);
  } catch {
    // Nothing to recover from: the next save overwrites it anyway.
  }
}

/**
 * A payload written by an older build is discarded rather than trusted. The
 * two fields checked are the two the resume prompt cannot be rendered without.
 */
function isSession(value: unknown): value is CheckoutSession {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<CheckoutSession>;
  return typeof candidate.merchantId === 'string' && Array.isArray(candidate.lines);
}
