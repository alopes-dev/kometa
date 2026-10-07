import { nextStage } from './stages';
import type { StageEvent } from './timeline';
import type { OrderStage } from './types';

/**
 * The clock that moves an order along the line.
 *
 * There is no backend in this build, so stages advance on a timer. It lives
 * here rather than inside a screen for two reasons: a screen that owns a
 * timer leaks it on unmount, and a progression that only exists inside a
 * component cannot be tested without rendering one.
 *
 * Board 18 asks for "polling adaptativo 15–30 s em tracking ativo". This takes
 * the fast end of that range, so the whole eleven-stage progression is
 * watchable in a review without waiting ten minutes for it.
 */
export const STAGE_INTERVAL_MS = 15_000;

export type SimulationOptions = {
  from: OrderStage;
  intervalMs?: number;
  now?: () => number;
  onAdvance: (event: StageEvent) => void;
};

export type Simulation = {
  start(): void;
  stop(): void;
};

export function createSimulation({
  from,
  intervalMs = STAGE_INTERVAL_MS,
  now = Date.now,
  onAdvance,
}: SimulationOptions): Simulation {
  let current = from;
  let timer: ReturnType<typeof setInterval> | undefined;

  const stop = () => {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };

  const tick = () => {
    const next = nextStage(current);
    // `null` at a terminal, and for `cancelled`, which never had a next stage
    // to reach. Either way the clock has nothing left to do.
    if (next === null) {
      stop();
      return;
    }
    current = next;
    onAdvance({ stage: next, occurredAt: now() });
  };

  return {
    start() {
      // Starting twice would run two clocks over one order.
      if (timer !== undefined) return;
      timer = setInterval(tick, intervalMs);
    },
    stop,
  };
}
