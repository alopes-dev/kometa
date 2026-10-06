import type { IconProps } from '@/components/design-system/atoms';

/**
 * The checkout domain, as board 19 · 03 declares it:
 *
 *   Cart      merchantId · items[] · promo · subtotal · deliveryFee · discount · total
 *   Item      productId · options[] · quantity · unitPrice · availability
 *   Delivery  addressId · label · zone · reference · instructions · phone · eta
 *   Payment   methodId · availability · status · providerReference
 *   Order     orderId · cartSnapshot · totals · status · createdAt
 */

// ─── Money ─────────────────────────────────────────────────────────────────

/** Why the delivery line reads the way it does — board 19 · 05 wants the cause. */
export type DeliveryMode = 'normal' | 'free' | 'dynamic';

export type PriceInput = {
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  /** A fee raised by demand. Renders with its explanation, never bare. */
  surged?: boolean;
};

export type OrderSummary = {
  subtotal: number;
  delivery: number;
  deliveryMode: DeliveryMode;
  discount: number;
  total: number;
};

// ─── Addresses ─────────────────────────────────────────────────────────────

export type AddressKind = 'home' | 'work' | 'other';

export type Address = {
  id: string;
  kind: AddressKind;
  /** `Casa` — what the customer named it. */
  label: string;
  /** `Talatona` — the zone the delivery area is checked against. */
  zone: string;
  /** `Rua do MAT, Condomínio 12`. */
  street: string;
  /** `Portão ao lado da farmácia` — how the courier finds the door. */
  reference?: string;
  city: string;
};

/** Board 10: the area check is a state, not a boolean, because it is async. */
export type AreaCheck =
  | { status: 'inside'; etaMinutes: number; deliveryFee: number }
  | { status: 'outside'; zone: string }
  | { status: 'checking' };

// ─── Payment ───────────────────────────────────────────────────────────────

/**
 * Board 12 draws exactly three. The MVP guardrail (board 19) rules out wallet,
 * credit, BNPL and split payment, so the union is closed deliberately.
 */
export type PaymentMethodId = 'cash' | 'card' | 'multicaixa';

export type PaymentMethodOption = {
  id: PaymentMethodId;
  label: string;
  subtitle: string;
  icon: { name: IconProps['name']; sf?: IconProps['sf'] };
  /** A digital method can be down while cash stays up — board 12, third screen. */
  available: boolean;
  /** Cash creates the order immediately; digital methods confirm first. */
  settlesOnDelivery: boolean;
};

// ─── Promotions ────────────────────────────────────────────────────────────

export type Promo = {
  code: string;
  /** Absolute, in Kz — board 09 writes `-1.500 Kz`, never a percentage. */
  discount: number;
  /** The basket this code needs before it applies. */
  minimumSubtotal: number;
  /** When set, the code is past its window and says when it ended. */
  endedOn?: string;
  usageNote?: string;
};

// ─── Order ─────────────────────────────────────────────────────────────────

export type OrderStatus = 'draft' | 'submitting' | 'pending' | 'confirmed' | 'failed' | 'cancelled';

export type Order = {
  orderId: string;
  status: OrderStatus;
  totals: OrderSummary;
  createdAt: number;
  /** What the provider calls this attempt, so a pending payment can be polled. */
  providerReference?: string;
};
