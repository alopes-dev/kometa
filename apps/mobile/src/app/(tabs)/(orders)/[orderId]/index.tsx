import { useLocalSearchParams, useRouter } from 'expo-router';
import { getRestaurantById } from '@/features/home/data';
import { OrderDetailsScreen } from '@/features/orders/components/OrderDetailsScreen';
import { isTerminal } from '@/features/orders/stages';
import { useOrders } from '@/hooks/useOrders';

export default function OrderDetails() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { byId } = useOrders();
  const order = byId(orderId);

  if (!order) return null;

  return (
    <OrderDetailsScreen
      order={order}
      merchantName={getRestaurantById(order.merchantId)?.name ?? ''}
      onBack={() => router.back()}
      onReceipt={() => router.push({ pathname: '/(tabs)/(orders)/[orderId]/receipt', params: { orderId } })}
      onHelp={() => router.push('/(tabs)/(home)/notifications')}
      // Board 06: "Repetir abre revisão do carrinho; disponibilidade, preços e
      // endereço nunca são assumidos."
      onReorder={() => router.push('/cart')}
      onTimeline={() =>
        router.push({ pathname: '/(tabs)/(orders)/[orderId]/timeline', params: { orderId } })
      }
      // Board 14 cancels an order that is still in flight. A delivered or
      // already-cancelled one has nothing left to cancel, so the action is
      // absent rather than present and refusing.
      onCancel={
        order.stage !== null && !isTerminal(order.stage)
          ? () => router.push({ pathname: '/(tabs)/(orders)/[orderId]/cancel', params: { orderId } })
          : undefined
      }
    />
  );
}
