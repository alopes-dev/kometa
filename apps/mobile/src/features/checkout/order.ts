import { ORDER_REFERENCE_PREFIX } from './mockData';
import type { Order, OrderSummary } from './types';

/**
 * Order submission, made idempotent.
 *
 * Board 19 · 04: "Submissão idempotente evita pedido ou débito duplicado", and
 * board 14 adds "Retry idempotente; nunca duplica pedido". Both are about the
 * same moment — the customer taps pay, nothing visibly happens, and they tap
 * again. The key is derived from the cart, so the second tap is recognised as
 * the same order rather than as a new one.
 *
 * The gateway is injected. There is no network in this build, and a payment
 * provider is exactly the dependency a test must be able to make deterministic.
 */

export type GatewayResult =
  | { outcome: 'confirmed'; providerReference?: string }
  | { outcome: 'failed' }
  /** The provider did not answer in time. Not a refusal — board 14. */
  | { outcome: 'timeout' };

export type Gateway = () => Promise<GatewayResult>;

export type SubmitOrderInput = {
  /** From `buildIdempotencyKey`. Identifies the attempt, not the tap. */
  key: string;
  totals: OrderSummary;
  /** Cash is settled by the courier, so there is no provider to consult. */
  settlesOnDelivery: boolean;
  gateway: Gateway;
  now?: () => number;
};

export type CartSignature = {
  merchantId: string;
  /** One entry per line, already including its quantity. */
  lines: string[];
  total: number;
};

/**
 * The same basket must produce the same key however the lines were ordered —
 * a cart re-read from storage can hand them back in any order, and that must
 * not read as a different order.
 */
export function buildIdempotencyKey({ merchantId, lines, total }: CartSignature): string {
  return `${merchantId}|${[...lines].sort().join(',')}|${total}`;
}

/**
 * Orders already created in this session, by key.
 *
 * A failed attempt is deliberately not recorded: a refusal is a dead end the
 * customer is invited to retry, and replaying it would make the retry button
 * lie. Only an order that exists — confirmed or awaiting the provider — is
 * replayed.
 */
const createdOrders = new Map<string, Order>();

export function submittedOrder(key: string): Order | undefined {
  return createdOrders.get(key);
}

/** Test seam: the registry is process-wide, so a suite can start clean. */
export function resetSubmittedOrders(): void {
  createdOrders.clear();
}

export async function submitOrder({
  key,
  totals,
  settlesOnDelivery,
  gateway,
  now = Date.now,
}: SubmitOrderInput): Promise<Order> {
  const existing = createdOrders.get(key);
  if (existing) return existing;

  const createdAt = now();
  const base = { orderId: buildOrderId(key), totals, createdAt };

  if (settlesOnDelivery) {
    const order: Order = { ...base, status: 'confirmed' };
    createdOrders.set(key, order);
    return order;
  }

  const result = await gateway();

  if (result.outcome === 'failed') {
    // Not recorded: nothing was created, so the next tap is a fresh attempt.
    return { ...base, status: 'failed' };
  }

  const order: Order =
    result.outcome === 'timeout'
      ? // The reference is the key itself, which is what the state can be
        // polled by once the provider catches up.
        { ...base, status: 'pending', providerReference: key }
      : { ...base, status: 'confirmed', providerReference: result.providerReference };

  createdOrders.set(key, order);
  return order;
}

/**
 * `#CM-2048`, as board 17 numbers it. Derived from the key so the same cart
 * always reads back as the same order, including after a restore.
 */
function buildOrderId(key: string): string {
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) % 10000;
  }
  return `${ORDER_REFERENCE_PREFIX}${String(hash).padStart(4, '0')}`;
}
