import { ORDER_STAGES, stageCopy, stageIndex } from './stages';
import type { OrderStage } from './types';

/**
 * The order's history as board 10 draws it — `Progresso do pedido`.
 *
 * Two rules from the board shape everything here. "Futuro sem promessa": a
 * stage that has not happened carries no timestamp, because a predicted time
 * is a promise the app cannot keep. And "Registo preservado": a refresh that
 * fails adds a row, it never removes the ones already confirmed.
 */

/** Board 10's four row states, drawn as filled, ringed, hollow and red dots. */
export type TimelineRowState = 'completed' | 'current' | 'upcoming' | 'error';

/** A stage transition that actually happened, with when. */
export type StageEvent = { stage: OrderStage; occurredAt: number };

export type TimelineRow = {
  stage: OrderStage;
  label: string;
  /** Absent on an upcoming row — deliberately, see "Futuro sem promessa". */
  occurredAt?: number;
  state: TimelineRowState;
};

/** Board 10's own wording for a row whose refresh did not land. */
const REFRESH_FAILED = 'Falha ao atualizar';

/**
 * Builds the rows for an order at `current`, from the events it has recorded.
 *
 * `failedAt` appends the error row the board draws when an update could not be
 * fetched. It is additive on purpose: the rows above it are what the app last
 * confirmed, and a failure to refresh is not evidence that they stopped being
 * true.
 */
export function buildTimeline(
  events: StageEvent[],
  current: OrderStage,
  failedAt?: number
): TimelineRow[] {
  const times = new Map(events.map((event) => [event.stage, event.occurredAt]));
  const rows = current === 'cancelled' ? cancelledRows(times) : lineRows(times, current);

  if (failedAt !== undefined) {
    rows.push({ stage: current, label: REFRESH_FAILED, occurredAt: failedAt, state: 'error' });
  }

  return rows;
}

/**
 * A cancelled order left the line rather than finishing it, so its rows are
 * the stages it did reach plus the cancellation itself. Showing the stages it
 * never reached as "upcoming" would suggest it is still on its way.
 */
function cancelledRows(times: Map<OrderStage, number>): TimelineRow[] {
  const reached = ORDER_STAGES.filter((stage) => times.has(stage)).map<TimelineRow>((stage) => ({
    stage,
    label: stageCopy(stage),
    occurredAt: times.get(stage),
    state: 'completed',
  }));

  return [...reached, { stage: 'cancelled', label: stageCopy('cancelled'), state: 'current' }];
}

function lineRows(times: Map<OrderStage, number>, current: OrderStage): TimelineRow[] {
  const currentIndex = stageIndex(current);
  const rows: TimelineRow[] = [];

  ORDER_STAGES.forEach((stage, index) => {
    if (index < currentIndex) {
      // A past stage is drawn only where an event dated it. Board 10's own
      // screen starts at `Pedido confirmado` and never shows `A confirmar`,
      // because an undated "completed" row asserts that something happened
      // while being unable to say when — the one thing board 18 forbids.
      const occurredAt = times.get(stage);
      if (occurredAt !== undefined) {
        rows.push({ stage, label: stageCopy(stage), occurredAt, state: 'completed' });
      }
      return;
    }

    if (index === currentIndex) {
      // Where the order is now is known even when no event recorded it.
      rows.push({
        stage,
        label: stageCopy(stage),
        ...(times.has(stage) ? { occurredAt: times.get(stage) } : {}),
        state: 'current',
      });
      return;
    }

    // An upcoming stage has no time even if one was somehow recorded for it.
    rows.push({ stage, label: stageCopy(stage), state: 'upcoming' });
  });

  return rows;
}
