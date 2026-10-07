import { useLocalSearchParams, useRouter } from 'expo-router';
import { getRestaurantById } from '@/features/home/data';
import { RatingScreen } from '@/features/orders/components/RatingScreen';
import { useOrders } from '@/hooks/useOrders';

export default function Rating() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { byId } = useOrders();
  const order = byId(orderId);

  if (!order) return null;

  return (
    <RatingScreen
      merchantName={getRestaurantById(order.merchantId)?.name ?? ''}
      courierName={order.courier?.name ?? ''}
      onBack={() => router.back()}
      // No backend to send this to; the board's success banner is the next
      // step once there is one.
      onSubmit={() => router.replace('/(tabs)/(orders)')}
    />
  );
}
