import { useLocalSearchParams, useRouter } from 'expo-router';
import { CancelledScreen } from '@/features/orders/components/CancelledScreen';
import { useOrders } from '@/hooks/useOrders';

export default function Cancelled() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { byId } = useOrders();
  const order = byId(orderId);

  if (!order) return null;

  return (
    <CancelledScreen
      order={order}
      onBackToOrders={() => router.replace('/(tabs)/(orders)')}
      onHelp={() => router.push('/(tabs)/(home)/notifications')}
    />
  );
}
