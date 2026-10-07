import type { CourierVisibility, OrderStage, StageEta } from './types';

/**
 * Board 18's table, as one record.
 *
 * Copy, courier visibility and ETA live in the same row on purpose: the board
 * states them together, and three parallel lookups would let a stage's label
 * drift away from the ETA shown beside it. `eta.ts` and `content.ts` both read
 * from here rather than restating any column.
 */
const TABLE: Record<OrderStage, { copy: string; courier: CourierVisibility; eta: StageEta }> = {
  pending: { copy: 'A confirmar', courier: 'none', eta: { kind: 'range', min: 25, max: 35 } },
  confirmed: {
    copy: 'Pedido confirmado',
    courier: 'searching',
    eta: { kind: 'range', min: 25, max: 35 },
  },
  preparing: { copy: 'A preparar', courier: 'none', eta: { kind: 'range', min: 20, max: 30 } },
  ready: {
    copy: 'Pronto para recolha',
    courier: 'searching',
    eta: { kind: 'range', min: 18, max: 24 },
  },
  assigned: {
    copy: 'Courier atribuído',
    courier: 'identity',
    eta: { kind: 'range', min: 18, max: 24 },
  },
  'picked-up': {
    copy: 'Pedido recolhido',
    courier: 'contact',
    eta: { kind: 'range', min: 14, max: 18 },
  },
  transit: { copy: 'A caminho', courier: 'contact', eta: { kind: 'approx', minutes: 12 } },
  arriving: { copy: 'A chegar', courier: 'contact', eta: { kind: 'range', min: 2, max: 4 } },
  arrived: { copy: 'Courier chegou', courier: 'contact', eta: { kind: 'now' } },
  delivered: { copy: 'Pedido entregue', courier: 'closed', eta: { kind: 'at-delivery' } },
  cancelled: { copy: 'Pedido cancelado', courier: 'none', eta: { kind: 'none' } },
};

/**
 * The operational line, in order.
 *
 * `cancelled` is deliberately absent: it is not a late stage but a departure
 * from the line, which is why `stageIndex` reports -1 for it rather than a
 * position after `delivered`.
 */
export const ORDER_STAGES: readonly OrderStage[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'assigned',
  'picked-up',
  'transit',
  'arriving',
  'arrived',
  'delivered',
];

/** The human sentence board 18 writes for a stage. */
export function stageCopy(stage: OrderStage): string {
  return TABLE[stage].copy;
}

/** How much of the courier this stage may reveal. */
export function courierVisibility(stage: OrderStage): CourierVisibility {
  return TABLE[stage].courier;
}

/** What board 18's ETA column says, before a clock is applied. */
export function stageEta(stage: OrderStage): StageEta {
  return TABLE[stage].eta;
}

/** Position on the operational line, or -1 for a stage that is off it. */
export function stageIndex(stage: OrderStage): number {
  return ORDER_STAGES.indexOf(stage);
}

/** Where the order stops moving. */
export function isTerminal(stage: OrderStage): boolean {
  return stage === 'delivered' || stage === 'cancelled';
}

/** The next stage along the line, or `null` at a terminal. */
export function nextStage(stage: OrderStage): OrderStage | null {
  if (isTerminal(stage)) return null;
  const index = stageIndex(stage);
  if (index === -1) return null;
  return ORDER_STAGES[index + 1] ?? null;
}
