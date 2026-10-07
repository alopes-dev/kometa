import { STAGE_INTERVAL_MS, createSimulation } from './simulation';
import type { StageEvent } from './timeline';

describe('createSimulation', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('advances one stage per interval, reporting when each happened', () => {
    const seen: StageEvent[] = [];
    const simulation = createSimulation({
      from: 'pending',
      now: () => 1_000,
      onAdvance: (event) => seen.push(event),
    });
    simulation.start();

    jest.advanceTimersByTime(STAGE_INTERVAL_MS);
    expect(seen).toEqual([{ stage: 'confirmed', occurredAt: 1_000 }]);

    jest.advanceTimersByTime(STAGE_INTERVAL_MS);
    expect(seen[1]).toEqual({ stage: 'preparing', occurredAt: 1_000 });
  });

  it('stops at delivered rather than running past the end of the line', () => {
    const seen: StageEvent[] = [];
    const simulation = createSimulation({
      from: 'arriving',
      onAdvance: (event) => seen.push(event),
    });
    simulation.start();

    jest.advanceTimersByTime(STAGE_INTERVAL_MS * 10);
    expect(seen.map((event) => event.stage)).toEqual(['arrived', 'delivered']);
  });

  it('never advances a cancelled order', () => {
    const seen: StageEvent[] = [];
    createSimulation({ from: 'cancelled', onAdvance: (event) => seen.push(event) }).start();
    jest.advanceTimersByTime(STAGE_INTERVAL_MS * 5);
    expect(seen).toEqual([]);
  });

  /** A screen that unmounts mid-delivery must not keep a timer alive. */
  it('stops cleanly', () => {
    const seen: StageEvent[] = [];
    const simulation = createSimulation({
      from: 'pending',
      onAdvance: (event) => seen.push(event),
    });
    simulation.start();
    simulation.stop();
    jest.advanceTimersByTime(STAGE_INTERVAL_MS * 5);
    expect(seen).toEqual([]);
  });
});
