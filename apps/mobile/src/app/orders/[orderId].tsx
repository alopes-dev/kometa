import { Redirect, useLocalSearchParams } from 'expo-router';
import { LINK_ROUTES } from '@/features/orders/links';

/**
 * `kometa://orders/{orderId}` — board 18's deep link.
 *
 * It exists as a real route because `(orders)` is a route GROUP: the
 * parentheses keep it out of the URL, so the tab screen's path is
 * `/{orderId}`, and the board's `orders/` prefix would resolve to nothing.
 * This redirects the published URL onto the screen that serves it.
 */
export default function OrderDeepLink() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  return <Redirect href={{ pathname: LINK_ROUTES.order, params: { orderId } }} />;
}
