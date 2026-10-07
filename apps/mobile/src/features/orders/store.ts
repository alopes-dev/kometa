import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OrderSummary, PaymentStatus } from '@/features/checkout/types';
import { isTerminal, stageIndex } from './stages';
import type { StageEvent } from './timeline';
import type { Courier, OrderDelivery, OrderLine, OrderPayment, OrderStage } from './types';

/**
 * The orders this device knows about, and what may be done to them.
 *
 * Board 18's resilience rule shapes the record: "Persistir último snapshot
 * confirmado, timestamp, ETA e timeline. Nunca inventar posição entre
 * atualizações." Hence `snapshotAt` — every record says when its state was
 * last confirmed, so a screen can date what it shows instead of implying it
 * is live.
 */

export const ORDERS_KEY = 'kometa:orders';

export type OrderRecord = {
  orderId: string;
  merchantId: string;
  /**
   * `null` until the payment settles — board 15, "Enquanto o pagamento está
   * pendente, o pedido não aparece como Confirmado nem inicia ETA
   * operacional." Modelled as a type rather than a convention so no screen can
   * read a stage off an unpaid order.
   */
  stage: OrderStage | null;
  paymentStatus: PaymentStatus;
  placedAt: number;
  totals: OrderSummary;
  lines: OrderLine[];
  delivery: OrderDelivery;
  payment?: OrderPayment;
  courier?: Courier;
  events: StageEvent[];
  /** Board 14's reason, kept so the history can say why it ended. */
  cancelReason?: string;
  /** When the stage above was last confirmed — never a guess. */
  snapshotAt: number;
};

/**
 * The one order still in flight, if any.
 *
 * An order awaiting payment is excluded by having no stage at all, which is
 * the board-15 rule falling out of the type rather than being re-checked here.
 */
export function activeOrder(orders: OrderRecord[]): OrderRecord | undefined {
  return orders.find((order) => order.stage !== null && !isTerminal(order.stage));
}

/** Everything that has finished, newest first — board 05's `Anteriores`. */
export function historyOrders(orders: OrderRecord[]): OrderRecord[] {
  return orders
    .filter((order) => order.stage !== null && isTerminal(order.stage))
    .sort((a, b) => b.placedAt - a.placedAt);
}

/**
 * Moves an order to the stage an event reports.
 *
 * Returns the order untouched when the event cannot be true of it: an unpaid
 * order has no line to move along, and an event for a stage already passed is
 * a late or duplicated delivery, not news. Board 18 again: never invent state.
 * A cancellation is accepted from anywhere, because it can happen at any point.
 */
export function applyStageEvent(order: OrderRecord, event: StageEvent): OrderRecord {
  if (order.stage === null) return order;

  const isCancellation = event.stage === 'cancelled';
  if (!isCancellation && stageIndex(event.stage) <= stageIndex(order.stage)) return order;

  return {
    ...order,
    stage: event.stage,
    events: [...order.events, event],
    snapshotAt: event.occurredAt,
  };
}

export async function saveOrders(orders: OrderRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // Orders that cannot be persisted are still orders in memory.
  }
}

/**
 * Nothing here throws. A storage failure degrades to "no saved orders",
 * because a restore that crashes loses a list the customer still believes in.
 */
export async function loadOrders(): Promise<OrderRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isOrderRecord) : [];
  } catch {
    return [];
  }
}

/**
 * A payload written by an older build is discarded rather than trusted. The
 * fields checked are the ones no list row can be rendered without.
 */
function isOrderRecord(value: unknown): value is OrderRecord {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<OrderRecord>;
  return (
    typeof candidate.orderId === 'string' &&
    typeof candidate.merchantId === 'string' &&
    Array.isArray(candidate.events)
  );
}
