import { useEffect } from 'react';
import { createSimulation } from '@/features/orders/simulation';
import { isTerminal } from '@/features/orders/stages';
import { useOrders } from './useOrders';

/**
 * Advances one order along the line while a screen is watching it.
 *
 * The clock lives in `features/orders/simulation`; this is only the binding
 * to a screen's lifetime. Starting it here rather than inside the tracking
 * screen is what guarantees it stops: the effect's cleanup is the only path
 * out, and there is no other reference to the timer.
 */
export function useOrderSimulation(orderId: string | undefined): void {
  const { byId, advance } = useOrders();
  const order = orderId ? byId(orderId) : undefined;
  const stage = order?.stage ?? null;
  const id = order?.orderId;

  useEffect(() => {
    if (!id || stage === null || isTerminal(stage)) return;

    const simulation = createSimulation({
      from: stage,
      onAdvance: (event) => advance(id, event),
    });
    simulation.start();
    return () => simulation.stop();
  }, [id, stage, advance]);
}
