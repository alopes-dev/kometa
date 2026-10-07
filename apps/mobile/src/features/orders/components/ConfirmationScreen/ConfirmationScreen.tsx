import { useEffect, useRef } from 'react';
import { ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Button, Icon } from '@/components/design-system/atoms';
import { formatKwanza } from '@/features/home/format';
import { continuousCorners, ordersTextStyle } from '@/theme';
import { content } from '../../content';
import { etaBand } from '../../eta';
import type { OrderRecord } from '../../store';

/**
 * Board 04 — the hand-off from paying to waiting.
 *
 * "A confirmação não depende de animação. Ícone, título e número do pedido
 * formam uma redundância acessível." Nothing here is revealed by motion: the
 * screen is complete on its first frame, and the haptic is a confirmation on
 * top rather than the confirmation itself.
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
  gap: ${({ theme }) => theme.spacing[16]}px;
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

const Facts = styled.View`
  align-self: stretch;
  gap: ${({ theme }) => theme.spacing[12]}px;
  padding: ${({ theme }) => theme.orders.metrics.cardPadding}px;
  border-radius: ${({ theme }) => theme.orders.metrics.cardRadius}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

const Fact = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[12]}px;
`;

const Label = styled.Text`
  ${ordersTextStyle('rowMeta')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Value = styled.Text<{ brand?: boolean }>`
  ${ordersTextStyle('merchantName')}
  color: ${({ theme, brand }) => (brand ? theme.colors.brand.base : theme.colors.text.primary)};
`;

const Actions = styled.View`
  gap: ${({ theme }) => theme.spacing[8]}px;
  padding-horizontal: ${({ theme }) => theme.orders.metrics.bodyPaddingH}px;
`;

export type ConfirmationScreenProps = {
  order: OrderRecord;
  merchantName: string;
  onTrack: () => void;
  onKeepExploring: () => void;
};

export function ConfirmationScreen({
  order,
  merchantName,
  onTrack,
  onKeepExploring,
}: ConfirmationScreenProps) {
  const insets = useSafeAreaInsets();
  const fired = useRef(false);

  useEffect(() => {
    // Board 18: success on confirmation, and "nunca repetitivo" — a re-render
    // must not buzz the device again.
    if (fired.current) return;
    fired.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  const band = order.stage === null ? null : etaBand(order.stage);

  return (
    <Screen topInset={insets.top} bottomInset={insets.bottom}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Body>
          <Badge>
            <Icon name="checkmark" sf="checkmark" size={40} color="success" />
          </Badge>
          <Title>{content.confirmedTitle}</Title>
          <Subtitle>{content.confirmedBody(merchantName)}</Subtitle>

          <Facts>
            <Fact>
              <Label>{content.orderLabel}</Label>
              <Value>#{order.orderId}</Value>
            </Fact>
            <Fact>
              <Label>{content.merchantLabel}</Label>
              <Value>{merchantName}</Value>
            </Fact>
            {band ? (
              <Fact>
                <Label>{content.estimatedDelivery}</Label>
                <Value brand>{content.etaLine(band)}</Value>
              </Fact>
            ) : null}
            <Fact>
              <Label>{content.total}</Label>
              <Value>{formatKwanza(order.totals.total)}</Value>
            </Fact>
          </Facts>
        </Body>
      </ScrollView>

      <Actions>
        <Button variant="primary" size="lg" shape="pill" onPress={onTrack}>
          {content.track}
        </Button>
        <Button variant="text" size="lg" onPress={onKeepExploring}>
          {content.keepExploring}
        </Button>
      </Actions>
    </Screen>
  );
}
