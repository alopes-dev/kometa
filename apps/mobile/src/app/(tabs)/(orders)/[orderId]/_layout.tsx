import { Stack } from 'expo-router';

/**
 * Every screen about one order. The id is read from the route rather than
 * threaded through params, so a deep link lands on any of them directly.
 */
export default function OrderLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
