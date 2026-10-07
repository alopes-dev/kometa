import { ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { CourierChatPanel } from '@/features/orders/components/CourierChatPanel';
import { ScreenHeader } from '@/features/orders/components/ScreenHeader';
import { content } from '@/features/orders/content';
import { courierVisibility } from '@/features/orders/stages';
import { useOrders } from '@/hooks/useOrders';

const Body = styled.View`
  padding: ${({ theme }) => theme.orders.metrics.bodyPaddingH}px;
`;

/**
 * Board 09's conversation.
 *
 * Which of the three states it shows follows from the stage: contact is open
 * while the courier is carrying the order, closed once delivered, and
 * unavailable in between — the same rule `courierVisibility` applies
 * everywhere else, rather than a second opinion about it.
 */
export default function Chat() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { byId } = useOrders();
  const order = byId(orderId);

  if (!order || order.stage === null) return null;

  const visibility = courierVisibility(order.stage);
  const state =
    visibility === 'contact' ? 'available' : visibility === 'closed' ? 'closed' : 'unavailable';

  return (
    <>
      <ScreenHeader title={content.message} onBack={() => router.back()} />
      <ScrollView>
        <Body>
          <CourierChatPanel state={state} courierName={order.courier?.name ?? ''} />
        </Body>
      </ScrollView>
    </>
  );
}
