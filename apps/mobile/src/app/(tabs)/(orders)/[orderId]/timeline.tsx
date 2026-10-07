import { useLocalSearchParams, useRouter } from 'expo-router';
import { getRestaurantById } from '@/features/home/data';
import { TimelineScreen } from '@/features/orders/components/TimelineScreen';
import { useOrders } from '@/hooks/useOrders';

export default function Timeline() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { byId } = useOrders();
  const order = byId(orderId);

  if (!order) return null;

  return (
    <TimelineScreen
      order={order}
      merchantName={getRestaurantById(order.merchantId)?.name ?? ''}
      onBack={() => router.back()}
    />
  );
}
