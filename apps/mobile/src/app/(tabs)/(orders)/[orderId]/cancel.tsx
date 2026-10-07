import { useLocalSearchParams, useRouter } from 'expo-router';
import { CancelSheet } from '@/features/orders/components/CancelSheet';
import { useOrders } from '@/hooks/useOrders';

export default function Cancel() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { cancel } = useOrders();

  return (
    <CancelSheet
      onConfirm={(reason) => {
        cancel(orderId, reason);
        router.replace({ pathname: '/(tabs)/(orders)/[orderId]/cancelled', params: { orderId } });
      }}
      onKeep={() => router.back()}
    />
  );
}
