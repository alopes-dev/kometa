import { stageEta } from './stages';
import type { EtaBand, OrderStage } from './types';

/**
 * ETA, under board 18's four rules: wide intervals before the pickup,
 * recalculated on operational change rather than on a clock tick, rounded,
 * and never a countdown to the second.
 *
 * The bands themselves are not restated here — they come from the one table
 * in `stages.ts`, so the ETA a screen shows and the copy beside it cannot
 * disagree.
 */

/** An en dash, as board 02 draws every interval. Not a hyphen. */
const EN_DASH = '–';

/**
 * The band for a stage, resolved against the clock where the stage needs one.
 *
 * `delivered` is the only stage that does: board 18 writes "hora real" for it.
 * Without a timestamp it reports `none` rather than inventing a time — a
 * delivery the app cannot date is one it must not claim to have dated.
 */
export function etaBand(stage: OrderStage, deliveredAt?: number): EtaBand {
  const spec = stageEta(stage);
  if (spec.kind !== 'at-delivery') return spec;
  return deliveredAt === undefined ? { kind: 'none' } : { kind: 'time', at: deliveredAt };
}

/** The band as the board writes it. An empty string renders nothing. */
export function formatEta(band: EtaBand): string {
  switch (band.kind) {
    case 'range':
      return `${band.min}${EN_DASH}${band.max} min`;
    case 'approx':
      return `~${band.minutes} min`;
    case 'now':
      return 'Agora';
    case 'time':
      return clockTime(band.at);
    case 'none':
      return '';
  }
}

/**
 * Board 07's delay banner — `Novo intervalo: 19:22–19:30`.
 *
 * A delay is news about *when*, not about how much longer, so the band is
 * projected onto the clock from the moment it was recalculated. Anything that
 * is not an interval has no window to draw.
 */
export function delayWindow(from: number, band: EtaBand): string {
  if (band.kind !== 'range') return '';
  return `${clockTime(from + band.min * 60_000)}${EN_DASH}${clockTime(from + band.max * 60_000)}`;
}

/**
 * `19:18`. Floored to the minute, so a recalculation carrying seconds cannot
 * push the window a minute later than the one the customer was promised.
 */
function clockTime(at: number): string {
  const date = new Date(at);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
