import { useSegments } from 'expo-router';

/**
 * Routes that float over the screen that pushed them instead of replacing it.
 * A sheet leaves that screen intact, so it has no business taking away the
 * furniture the screen behind it draws.
 *
 * Written without the `(tabs)` segment, which the rule below has already read.
 */
const OVERLAY_ROUTES = new Set(['(home)/product/sheet/[itemId]']);

/**
 * The bar belongs to the five destinations, not to the screens they lead into:
 * anything pushed inside a tab is a page in its own right and gets the whole
 * window.
 *
 * Read off the route rather than set by each screen, so every screen added
 * from here on is covered the day it lands — the per-screen version of this
 * had drifted, and checkout, the cart and half of Orders still showed a bar
 * the boards never drew.
 */
export function isTabBarHidden(segments: readonly string[]): boolean {
  const [navigator, ...route] = segments;
  if (navigator !== '(tabs)') return false;
  // One segment in is the tab's own screen — `(home)`, `(orders)`, and so on.
  if (route.length < 2) return false;
  return !OVERLAY_ROUTES.has(route.join('/'));
}

export function useIsTabBarHidden(): boolean {
  return isTabBarHidden(useSegments());
}
