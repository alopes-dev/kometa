/**
 * The two deep links board 18 specifies.
 *
 * The board writes `cometa://`, and the app's scheme is `kometa` (see
 * `app.config.js`). The boards are naming the brand — they write "Cometa"
 * throughout — not making a routing decision, and changing a published URL
 * scheme breaks every link already issued. So the shape is the board's and
 * the scheme is the app's.
 *
 * Expo Router resolves these to the file routes on its own; this module
 * exists to BUILD links (the notification payloads consume it) and to refuse
 * ones that would open a blank screen.
 */

const SCHEME = 'kometa';

export type OrderLink = {
  kind: 'order' | 'tracking';
  orderId: string;
};

const HOSTS: Record<string, OrderLink['kind']> = {
  orders: 'order',
  tracking: 'tracking',
};

export function orderLink(orderId: string): string {
  return `${SCHEME}://orders/${encodeURIComponent(orderId)}`;
}

export function trackingLink(orderId: string): string {
  return `${SCHEME}://tracking/${encodeURIComponent(orderId)}`;
}

/**
 * Reads a link back, or `null` for anything this app does not own.
 *
 * Deliberately strict: a link whose id is missing would route to a screen
 * with no order to show, which is a blank screen with a back button — worse
 * than not following the link at all.
 */
export function parseOrderLink(url: string): OrderLink | null {
  const match = /^([a-z][a-z0-9+.-]*):\/\/([^/?#]+)(?:\/([^?#]*))?/i.exec(url);
  if (!match) return null;

  const [, scheme, host, rest] = match;
  if (scheme.toLowerCase() !== SCHEME) return null;

  const kind = HOSTS[host.toLowerCase()];
  if (!kind) return null;

  const orderId = decodeURIComponent(rest ?? '').trim();
  if (orderId === '') return null;

  return { kind, orderId };
}
