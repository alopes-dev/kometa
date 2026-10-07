import { useLocalSearchParams, useRouter } from 'expo-router';
import { ReceiptScreen } from '@/features/orders/components/ReceiptScreen';
import { useOrders } from '@/hooks/useOrders';

export default function Receipt() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { byId } = useOrders();
  const order = byId(orderId);

  if (!order) return null;

  return <ReceiptScreen order={order} onBack={() => router.back()} onDownload={() => {}} />;
}
