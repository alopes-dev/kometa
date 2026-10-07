import { useLocalSearchParams, useRouter } from 'expo-router';
import { getRestaurantById } from '@/features/home/data';
import { RejectedScreen } from '@/features/orders/components/RejectedScreen';
import { useOrders } from '@/hooks/useOrders';

export default function Rejected() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { byId } = useOrders();
  const order = byId(orderId);

  return (
    <RejectedScreen
      merchantName={order ? (getRestaurantById(order.merchantId)?.name ?? '') : ''}
      onReviewCart={() => router.replace('/cart')}
      onExplore={() => router.replace('/restaurants')}
    />
  );
}
