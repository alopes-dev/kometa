import { useLocalSearchParams, useRouter } from 'expo-router';
import { getRestaurantById } from '@/features/home/data';
import { OrderDetailsScreen } from '@/features/orders/components/OrderDetailsScreen';
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
    />
  );
}
