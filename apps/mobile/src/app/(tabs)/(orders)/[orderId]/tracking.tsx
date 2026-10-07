import { useCallback } from 'react';
import { Linking } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { getRestaurantById } from '@/features/home/data';
import { TrackingScreen } from '@/features/orders/components/TrackingScreen';
import { useOrders } from '@/hooks/useOrders';
import { useOrderSimulation } from '@/hooks/useOrderSimulation';
import { useTabBarVisibility } from '@/hooks/useTabBarVisibility';

export default function Tracking() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { byId } = useOrders();
  const { setIsTabBarHidden } = useTabBarVisibility();
  const order = byId(orderId);

  useOrderSimulation(orderId);

  useFocusEffect(
    useCallback(() => {
      setIsTabBarHidden(true);
      return () => setIsTabBarHidden(false);
    }, [setIsTabBarHidden])
  );

  if (!order) return null;

  return (
    <TrackingScreen
      order={order}
      merchantName={getRestaurantById(order.merchantId)?.name ?? ''}
      onBack={() => router.back()}
      onMessage={() => {}}
      onCall={() =>
        order.courier ? Linking.openURL(`tel:${order.courier.phone}`).catch(() => {}) : undefined
      }
    />
  );
}
