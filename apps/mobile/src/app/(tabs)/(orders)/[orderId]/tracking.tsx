import { Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getRestaurantById } from '@/features/home/data';
import { TrackingScreen } from '@/features/orders/components/TrackingScreen';
import { useOrders } from '@/hooks/useOrders';
import { useOrderSimulation } from '@/hooks/useOrderSimulation';

export default function Tracking() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { byId } = useOrders();
  const order = byId(orderId);

  useOrderSimulation(orderId);

  if (!order) return null;

  return (
    <TrackingScreen
      order={order}
      merchantName={getRestaurantById(order.merchantId)?.name ?? ''}
      onBack={() => router.back()}
      onMessage={() =>
        router.push({ pathname: '/(tabs)/(orders)/[orderId]/chat', params: { orderId } })
      }
      onCall={() =>
        order.courier ? Linking.openURL(`tel:${order.courier.phone}`).catch(() => {}) : undefined
      }
      onDelivered={() =>
        router.replace({
          pathname: '/(tabs)/(orders)/[orderId]/delivered',
          params: { orderId },
        })
      }
    />
  );
}
