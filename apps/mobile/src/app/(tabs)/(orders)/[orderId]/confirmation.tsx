import { useLocalSearchParams, useRouter } from 'expo-router';
import { getRestaurantById } from '@/features/home/data';
import { ConfirmationScreen } from '@/features/orders/components/ConfirmationScreen';
import { useOrders } from '@/hooks/useOrders';

export default function Confirmation() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { byId } = useOrders();
  const order = byId(orderId);

  if (!order) return null;

  return (
    <ConfirmationScreen
      order={order}
      merchantName={getRestaurantById(order.merchantId)?.name ?? ''}
      onTrack={() => router.replace('/order-tracking')}
      onKeepExploring={() => router.replace('/')}
    />
  );
}
