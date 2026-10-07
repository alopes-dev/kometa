import { ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { Button } from '@/components/design-system/atoms';
import { formatKwanza } from '@/features/home/format';
import { continuousCorners, ordersTextStyle } from '@/theme';
import { content } from '../../content';
import type { OrderRecord } from '../../store';
import { ScreenHeader } from '../ScreenHeader';

/**
 * Board 06's receipt.
 *
 * The card is shown as brand plus four digits and nothing else — board 15's
 * privacy rule. A receipt is a document people screenshot and forward, so
 * what it carries is what leaves the device with it.
 */

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const Body = styled.View`
  gap: ${({ theme }) => theme.spacing[16]}px;
  padding-horizontal: ${({ theme }) => theme.orders.metrics.bodyPaddingH}px;
  padding-bottom: ${({ theme }) => theme.spacing[32]}px;
`;

const Card = styled.View`
  gap: ${({ theme }) => theme.spacing[12]}px;
  padding: ${({ theme }) => theme.orders.metrics.cardPadding}px;
  border-radius: ${({ theme }) => theme.orders.metrics.cardRadius}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

const Title = styled.Text`
  ${ordersTextStyle('statusTitle')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Caption = styled.Text`
  ${ordersTextStyle('rowMeta')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[12]}px;
`;

const Label = styled.Text`
  ${ordersTextStyle('rowMeta')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Value = styled.Text`
  ${ordersTextStyle('merchantName')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.subtle};
`;

export type ReceiptScreenProps = {
  order: OrderRecord;
  onBack: () => void;
  onDownload: () => void;
};

export function ReceiptScreen({ order, onBack, onDownload }: ReceiptScreenProps) {
  const card = order.payment ? `${order.payment.brand} •••• ${order.payment.last4}` : '—';
  // A receipt states what happened to the money. For a cancelled order that
  // is not "pago", and the figure is not a charge that stands.
  const settled = order.paymentStatus === 'confirmed' && order.stage !== 'cancelled';

  return (
    <Screen>
      <ScreenHeader title={content.receiptTitle} onBack={onBack} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Body>
          <Card>
            <Title>{content.receiptTitle}</Title>
            <Caption>
              Pedido #{order.orderId} · {settled ? 'pago' : 'cancelado'}
            </Caption>
            <Divider />
            <Row>
              <Label>{content.method}</Label>
              <Value>{card}</Value>
            </Row>
            <Row>
              <Label>{settled ? content.totalCharged : content.total}</Label>
              <Value>{formatKwanza(order.totals.total)}</Value>
            </Row>
            <Button variant="outline" size="lg" shape="pill" onPress={onDownload}>
              {content.downloadReceipt}
            </Button>
          </Card>
        </Body>
      </ScrollView>
    </Screen>
  );
}
