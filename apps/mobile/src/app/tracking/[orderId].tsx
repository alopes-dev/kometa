import { Redirect, useLocalSearchParams } from 'expo-router';
import { LINK_ROUTES } from '@/features/orders/links';

/**
 * `kometa://tracking/{orderId}` — board 18's deep link.
 *
 * Authentication is not re-checked here: the root layout already gates every
 * route behind it, so a link opened while signed out lands on the auth flow
 * and arrives here afterwards. Board 18: "respeita autenticação."
 */
export default function TrackingDeepLink() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  return <Redirect href={{ pathname: LINK_ROUTES.tracking, params: { orderId } }} />;
}
