import { useLocalSearchParams, useRouter } from 'expo-router';
import { DeliveredScreen } from '@/features/orders/components/DeliveredScreen';
import { useOrders } from '@/hooks/useOrders';

export default function Delivered() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { byId } = useOrders();
  const order = byId(orderId);

  if (!order) return null;

  return (
    <DeliveredScreen
      order={order}
      onRate={() =>
        router.push({ pathname: '/(tabs)/(orders)/[orderId]/rating', params: { orderId } })
      }
      onBackToOrders={() => router.replace('/(tabs)/(orders)')}
    />
  );
}
