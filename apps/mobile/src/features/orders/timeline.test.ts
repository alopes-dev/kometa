import { buildTimeline } from './timeline';

const at = (hhmm: string) => new Date(`2026-10-07T${hhmm}:00`).getTime();

/** Board 10's own event log. */
const events = [
  { stage: 'confirmed' as const, occurredAt: at('18:42') },
  { stage: 'preparing' as const, occurredAt: at('18:44') },
  { stage: 'ready' as const, occurredAt: at('18:55') },
  { stage: 'assigned' as const, occurredAt: at('18:57') },
  { stage: 'picked-up' as const, occurredAt: at('19:01') },
  { stage: 'transit' as const, occurredAt: at('19:02') },
];

describe('buildTimeline', () => {
  it('marks what happened completed, with the time it happened', () => {
    const rows = buildTimeline(events, 'transit');
    const confirmed = rows.find((row) => row.stage === 'confirmed');
    expect(confirmed).toMatchObject({
      state: 'completed',
      label: 'Pedido confirmado',
      occurredAt: at('18:42'),
    });
  });

  it('marks the stage the order is at as current', () => {
    const rows = buildTimeline(events, 'transit');
    expect(rows.find((row) => row.stage === 'transit')).toMatchObject({
      state: 'current',
      occurredAt: at('19:02'),
    });
  });

  /**
   * Board 10, "Futuro sem promessa": `Entregue` stays upcoming and WITHOUT a
   * time until there is operational confirmation. Rendering a predicted
   * timestamp would be a promise the app cannot keep.
   */
  it('leaves a future stage upcoming and without a timestamp', () => {
    const rows = buildTimeline(events, 'transit');
    expect(rows.find((row) => row.stage === 'delivered')).toMatchObject({ state: 'upcoming' });
    expect(rows.find((row) => row.stage === 'delivered')?.occurredAt).toBeUndefined();
  });

  /**
   * Review Focus #4. Board 10, "Registo preservado": a refresh that fails adds
   * an error row. It does not drop the events already confirmed above it.
   */
  it('keeps every confirmed event when a refresh fails', () => {
    const rows = buildTimeline(events, 'transit', at('19:06'));
    expect(rows.filter((row) => row.state === 'completed')).toHaveLength(5);
    expect(rows.find((row) => row.state === 'error')).toMatchObject({ occurredAt: at('19:06') });
  });

  /** A cancelled order's history is still its history. */
  it('keeps the confirmed events of a cancelled order', () => {
    const rows = buildTimeline(events.slice(0, 2), 'cancelled');
    expect(rows.filter((row) => row.state === 'completed').length).toBeGreaterThan(0);
    expect(rows.find((row) => row.stage === 'cancelled')).toMatchObject({ state: 'current' });
  });

  /** An order that has only just been paid for has one row and no history. */
  it('handles an order with no events yet', () => {
    const rows = buildTimeline([], 'pending');
    expect(rows[0]).toMatchObject({ stage: 'pending', state: 'current' });
    expect(rows.every((row) => row.state !== 'completed')).toBe(true);
  });
});
