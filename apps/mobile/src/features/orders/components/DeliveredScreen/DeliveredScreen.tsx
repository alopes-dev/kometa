import { useEffect, useRef } from 'react';
import { ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Button, Icon } from '@/components/design-system/atoms';
import { continuousCorners, ordersTextStyle } from '@/theme';
import { content } from '../../content';
import { formatEta } from '../../eta';
import type { OrderRecord } from '../../store';

/**
 * Board 11 — the end of the delivery.
 *
 * The proof of delivery is deliberately thin on detail: board 11 rules out a
 * face, a plate, a house number and an exact location in anything visible,
 * and limits retention. What is shown is the address the customer already
 * knows and the time it happened.
 */

const Screen = styled.View<{ topInset: number; bottomInset: number }>`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
  padding-top: ${({ theme, topInset }) => theme.spacing[32] + topInset}px;
  padding-bottom: ${({ theme, bottomInset }) => theme.spacing[16] + bottomInset}px;
`;

const Body = styled.View`
  flex: 1;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[12]}px;
  padding-horizontal: ${({ theme }) => theme.orders.metrics.bodyPaddingH}px;
`;

const Badge = styled.View`
  width: 88px;
  height: 88px;
  border-radius: 44px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.status.success.bg};
`;

const Title = styled.Text`
  ${ordersTextStyle('resultTitle')}
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

const Subtitle = styled.Text`
  ${ordersTextStyle('rowMeta')}
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

const Chip = styled.View`
  padding-vertical: ${({ theme }) => theme.spacing[6]}px;
  padding-horizontal: ${({ theme }) => theme.spacing[12]}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.status.success.bg};
`;

const ChipLabel = styled.Text`
  ${ordersTextStyle('chip')}
  color: ${({ theme }) => theme.colors.status.success.fg};
`;

const Proof = styled.View`
  align-self: stretch;
  gap: ${({ theme }) => theme.spacing[8]}px;
  padding: ${({ theme }) => theme.orders.metrics.cardPadding}px;
  border-radius: ${({ theme }) => theme.orders.metrics.cardRadius}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

const ProofRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[8]}px;
`;

const Address = styled.Text`
  ${ordersTextStyle('rowMeta')}
  flex: 1;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Time = styled.Text`
  ${ordersTextStyle('rowMeta')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Actions = styled.View`
  gap: ${({ theme }) => theme.spacing[8]}px;
  padding-horizontal: ${({ theme }) => theme.orders.metrics.bodyPaddingH}px;
`;

export type DeliveredScreenProps = {
  order: OrderRecord;
  onRate: () => void;
  onBackToOrders: () => void;
};

export function DeliveredScreen({ order, onRate, onBackToOrders }: DeliveredScreenProps) {
  const insets = useSafeAreaInsets();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  const deliveredAt = order.events.find((event) => event.stage === 'delivered')?.occurredAt;
  const clock = deliveredAt === undefined ? '' : formatEta({ kind: 'time', at: deliveredAt });
  const { delivery } = order;

  return (
    <Screen topInset={insets.top} bottomInset={insets.bottom}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Body>
          <Badge>
            <Icon name="checkmark" sf="checkmark" size={40} color="success" />
          </Badge>
          <Title>{content.deliveredHeadline}</Title>
          <Subtitle>{content.deliveredBody}</Subtitle>
          {clock ? (
            <Chip>
              <ChipLabel>{content.deliveredChip(clock)}</ChipLabel>
            </Chip>
          ) : null}

          <Proof>
            <ProofRow>
              <Icon name="home-outline" sf="house" size={16} color="secondary" />
              <Address>
                {delivery.addressLabel}, {delivery.zone}, {delivery.city}
              </Address>
              <Time>{clock}</Time>
            </ProofRow>
          </Proof>
        </Body>
      </ScrollView>

      <Actions>
        <Button variant="primary" size="lg" shape="pill" onPress={onRate}>
          {content.rate}
        </Button>
        <Button variant="text" size="lg" onPress={onBackToOrders}>
          {content.backToOrders}
        </Button>
      </Actions>
    </Screen>
  );
}
