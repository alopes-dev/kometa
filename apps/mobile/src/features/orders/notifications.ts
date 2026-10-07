/**
 * Board 12 — which order events are worth a notification, where each one
 * lands, and what may appear on a locked screen.
 *
 * Only the eight events the board lists are here. "Só mudanças
 * significativas": a notification for every stage would train the customer to
 * dismiss the one that mattered.
 */

export type OrderEvent =
  | 'order_confirmed'
  | 'courier_assigned'
  | 'order_picked_up'
  | 'arriving'
  | 'delivered'
  | 'delayed'
  | 'payment_pending'
  | 'courier_reassigned';

/** Where tapping the notification opens, per board 12's `Destino` line. */
export type NotificationDestination = 'details' | 'tracking' | 'map' | 'rating' | 'payment';

export type OrderNotification = {
  /** The deduplication key — board 12's payload contract. */
  eventId: string;
  orderId: string;
  event: OrderEvent;
  occurredAt: number;
  title: string;
  body: string;
};

const DESTINATIONS: Record<OrderEvent, NotificationDestination> = {
  order_confirmed: 'details',
  courier_assigned: 'tracking',
  order_picked_up: 'tracking',
  arriving: 'map',
  delivered: 'rating',
  delayed: 'tracking',
  payment_pending: 'payment',
  courier_reassigned: 'tracking',
};

export function destinationFor(event: OrderEvent): NotificationDestination {
  return DESTINATIONS[event];
}

/**
 * One row per event, keeping the first arrival.
 *
 * Board 12 keys deduplication on `eventId` rather than on content, because
 * the same event re-pushed after a retry is the same news — and the first
 * arrival is the one whose timestamp is true.
 */
export function dedupeByEvent(notifications: OrderNotification[]): OrderNotification[] {
  const seen = new Set<string>();
  return notifications.filter((notification) => {
    if (seen.has(notification.eventId)) return false;
    seen.add(notification.eventId);
    return true;
  });
}

export type LockScreenInput = {
  merchantName: string;
  /** `Casa` — the label, which is safe. */
  addressLabel: string;
  /** The full street, which is not. */
  street: string;
  /** How to get in, which is not. */
  instructions: string;
  courierPhone: string;
  event: OrderEvent;
};

const LOCK_SCREEN_COPY: Record<OrderEvent, (input: LockScreenInput) => string> = {
  order_confirmed: ({ merchantName }) => `A ${merchantName} começou a preparar o teu pedido.`,
  courier_assigned: () => 'Um courier foi atribuído à tua entrega.',
  order_picked_up: () => 'O teu pedido já está a caminho.',
  arriving: ({ addressLabel }) => `O courier está a poucos minutos de ${addressLabel}.`,
  delivered: () => 'Pedido entregue. Bom apetite!',
  delayed: () => 'A entrega está a demorar um pouco mais.',
  payment_pending: () => 'Conclui o pagamento para confirmar o pedido.',
  courier_reassigned: () => 'Outro courier assume a tua entrega.',
};

/**
 * What may appear on a locked device.
 *
 * Board 12: "Lock screen evita morada completa, instruções de acesso e
 * telefone do courier." The address *label* survives — `Casa` means something
 * to its owner and nothing to a stranger reading over a shoulder — while the
 * street, the way in and the courier's number do not.
 */
export function lockScreenBody(input: LockScreenInput): string {
  return LOCK_SCREEN_COPY[input.event](input);
}
