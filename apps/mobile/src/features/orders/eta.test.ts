import { delayWindow, etaBand, formatEta } from './eta';

describe('etaBand', () => {
  /** Board 18: wide bands before pickup, narrowing after. */
  it('is a wide band before the courier has the order', () => {
    expect(etaBand('pending')).toEqual({ kind: 'range', min: 25, max: 35 });
    expect(etaBand('confirmed')).toEqual({ kind: 'range', min: 25, max: 35 });
    expect(etaBand('preparing')).toEqual({ kind: 'range', min: 20, max: 30 });
    expect(etaBand('ready')).toEqual({ kind: 'range', min: 18, max: 24 });
    expect(etaBand('assigned')).toEqual({ kind: 'range', min: 18, max: 24 });
    expect(etaBand('picked-up')).toEqual({ kind: 'range', min: 14, max: 18 });
  });

  it('narrows to an approximation in transit and a short band on approach', () => {
    expect(etaBand('transit')).toEqual({ kind: 'approx', minutes: 12 });
    expect(etaBand('arriving')).toEqual({ kind: 'range', min: 2, max: 4 });
  });

  it('says Agora once the courier is at the door', () => {
    expect(etaBand('arrived')).toEqual({ kind: 'now' });
  });

  /** Board 18: delivery shows a real clock time, not a duration. */
  it('becomes a clock time at delivery', () => {
    expect(etaBand('delivered', 1_760_000_000_000)).toEqual({
      kind: 'time',
      at: 1_760_000_000_000,
    });
  });

  it('has no ETA for a cancelled order', () => {
    expect(etaBand('cancelled')).toEqual({ kind: 'none' });
  });

  /** A delivered order with no recorded time must not invent one. */
  it('falls back to no ETA when delivery has no timestamp yet', () => {
    expect(etaBand('delivered')).toEqual({ kind: 'none' });
  });
});

describe('formatEta', () => {
  it('writes a band with an en dash, as the board draws it', () => {
    expect(formatEta({ kind: 'range', min: 25, max: 35 })).toBe('25–35 min');
  });

  it('marks an approximation rather than implying precision', () => {
    expect(formatEta({ kind: 'approx', minutes: 12 })).toBe('~12 min');
  });

  it('writes Agora and a clock time', () => {
    expect(formatEta({ kind: 'now' })).toBe('Agora');
    expect(formatEta({ kind: 'time', at: new Date('2026-10-07T19:18:00').getTime() })).toBe(
      '19:18'
    );
  });

  it('writes nothing for an order with no ETA', () => {
    expect(formatEta({ kind: 'none' })).toBe('');
  });
});

describe('delayWindow', () => {
  /**
   * Board 07's delay banner: `Novo intervalo: 19:22–19:30`. A clock window,
   * because a delay is news about when, not about how long more.
   */
  it('turns a band into a clock window from the given moment', () => {
    const from = new Date('2026-10-07T19:00:00').getTime();
    expect(delayWindow(from, { kind: 'range', min: 22, max: 30 })).toBe('19:22–19:30');
  });

  it('rounds to the minute rather than carrying seconds', () => {
    const from = new Date('2026-10-07T19:00:40').getTime();
    expect(delayWindow(from, { kind: 'range', min: 22, max: 30 })).toBe('19:22–19:30');
  });
});
