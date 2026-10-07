import { useRouter } from 'expo-router';
import { getRestaurantById } from '@/features/home/data';
import { OrdersListScreen } from '@/features/orders/components/OrdersListScreen';
import { useOrders } from '@/hooks/useOrders';

/**
 * Board 05. Every destination is resolved here rather than inside the screen,
 * so `OrdersListScreen` renders in a test without a navigator.
 */
export default function Orders() {
  const router = useRouter();
  const { active, history } = useOrders();

  return (
    <OrdersListScreen
      active={active}
      history={history}
      merchantName={(merchantId) => getRestaurantById(merchantId)?.name ?? ''}
      onTrack={() => router.push('/order-tracking')}
      onOpen={(order) =>
        router.push({ pathname: '/(tabs)/(orders)/[orderId]', params: { orderId: order.orderId } })
      }
    />
  );
}
