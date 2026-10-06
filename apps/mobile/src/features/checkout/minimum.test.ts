import { evaluateMinimum } from './minimum';

describe('evaluateMinimum', () => {
  it('reports what is still missing, in money', () => {
    expect(evaluateMinimum(3800, 5000)).toEqual({
      met: false,
      remaining: 1200,
      ratio: 0.76,
      minimum: 5000,
    });
  });

  it('is met exactly at the threshold', () => {
    expect(evaluateMinimum(5000, 5000)).toMatchObject({ met: true, remaining: 0, ratio: 1 });
  });

  it('caps the bar at full rather than overflowing it', () => {
    expect(evaluateMinimum(9000, 5000)).toMatchObject({ met: true, remaining: 0, ratio: 1 });
  });

  /**
   * A merchant with no minimum must not render a progress bar at 0% — board
   * 08 only exists when there is a rule to explain.
   */
  it('is met when the merchant sets no minimum', () => {
    expect(evaluateMinimum(0, 0)).toMatchObject({ met: true, remaining: 0, ratio: 1 });
    expect(evaluateMinimum(0, undefined)).toMatchObject({ met: true, remaining: 0, ratio: 1 });
  });

  it('starts the bar at zero for an empty basket', () => {
    expect(evaluateMinimum(0, 5000)).toMatchObject({ met: false, remaining: 5000, ratio: 0 });
  });
});
