import { orderLink, parseOrderLink, trackingLink } from './links';

describe('order deep links', () => {
  /**
   * Board 18 writes `cometa://`, but the app's scheme is `kometa` (see
   * app.config.js). The boards are naming the brand, not making a routing
   * decision, and changing a published scheme breaks every link already
   * issued — so the scheme stays and the shape is the board's.
   */
  it('builds the two links board 18 specifies, on the app scheme', () => {
    expect(orderLink('CM-10482')).toBe('kometa://orders/CM-10482');
    expect(trackingLink('CM-10482')).toBe('kometa://tracking/CM-10482');
  });

  it('parses both back', () => {
    expect(parseOrderLink('kometa://orders/CM-10482')).toEqual({
      kind: 'order',
      orderId: 'CM-10482',
    });
    expect(parseOrderLink('kometa://tracking/CM-10482')).toEqual({
      kind: 'tracking',
      orderId: 'CM-10482',
    });
  });

  /** A link to nothing must not open a blank screen. */
  it('rejects anything it does not recognise', () => {
    expect(parseOrderLink('kometa://orders/')).toBeNull();
    expect(parseOrderLink('kometa://orders')).toBeNull();
    expect(parseOrderLink('https://example.com/orders/CM-10482')).toBeNull();
    expect(parseOrderLink('kometa://wallet/CM-10482')).toBeNull();
    expect(parseOrderLink('')).toBeNull();
  });

  /** Another app's scheme is not ours, however familiar the path looks. */
  it('rejects the brand spelling the boards use', () => {
    expect(parseOrderLink('cometa://orders/CM-10482')).toBeNull();
  });

  it('ignores a query string without losing the id', () => {
    expect(parseOrderLink('kometa://tracking/CM-10482?from=push')).toEqual({
      kind: 'tracking',
      orderId: 'CM-10482',
    });
  });

  it('round-trips an id that needs escaping', () => {
    const id = 'CM 10482';
    const parsed = parseOrderLink(orderLink(id));
    expect(parsed).toEqual({ kind: 'order', orderId: id });
  });
});
