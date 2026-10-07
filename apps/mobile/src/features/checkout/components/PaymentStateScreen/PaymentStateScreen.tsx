import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Button, Icon } from '@/components/design-system/atoms';
import { formatKwanza } from '@/features/home/format';
import { checkoutTextStyle, continuousCorners } from '@/theme';
import { content } from '../../content';

/**
 * Board 15 of page 69:4724 — the two states a payment can be left in.
 *
 * Neither renders anything operational. "Enquanto o pagamento está pendente,
 * o pedido não aparece como Confirmado nem inicia ETA operacional": there is
 * no stage, no estimate and nothing that could read as an accepted order,
 * because none of that is true yet.
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
  padding-horizontal: ${({ theme }) => theme.spacing[16]}px;
`;

const Badge = styled.View<{ failed: boolean }>`
  width: 88px;
  height: 88px;
  border-radius: 44px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, failed }) =>
    failed ? theme.colors.status.error.bg : theme.colors.status.warning.bg};
`;

const Title = styled.Text`
  ${checkoutTextStyle('stateTitle')}
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

const Message = styled.Text`
  ${checkoutTextStyle('stateBody')}
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

const Reference = styled.View`
  align-self: stretch;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[12]}px;
  padding: ${({ theme }) => theme.spacing[16]}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

const OrderId = styled.Text`
  ${checkoutTextStyle('summaryLabel')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Total = styled.Text`
  ${checkoutTextStyle('totalValue')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Actions = styled.View`
  gap: ${({ theme }) => theme.spacing[8]}px;
  padding-horizontal: ${({ theme }) => theme.spacing[16]}px;
`;

/**
 * The two states carry different actions, so they are different shapes.
 *
 * A single `onPrimary`/`onSecondary` pair let a caller wire "Cancelar pedido"
 * to the payment-method picker, which is exactly what happened before this
 * was a union — the labels said one thing and the handler did another, and
 * nothing could catch it.
 */
export type PaymentStateScreenProps = {
  merchantName: string;
  orderId: string;
  total: number;
} & (
  | { state: 'pending'; onCompletePayment: () => void; onCancelOrder: () => void }
  | { state: 'failed'; onRetry: () => void; onChangeMethod: () => void }
);

export function PaymentStateScreen(props: PaymentStateScreenProps) {
  const { state, merchantName, orderId, total } = props;
  const insets = useSafeAreaInsets();
  const failed = state === 'failed';

  return (
    <Screen topInset={insets.top} bottomInset={insets.bottom}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Body>
          <Badge failed={failed}>
            <Icon
              name="card-outline"
              sf="creditcard"
              size={32}
              color={failed ? 'error' : 'warning'}
            />
          </Badge>
          <Title>{failed ? content.failedHeadline : content.pendingHeadline}</Title>
          <Message>{failed ? content.failedBody : content.pendingBody(merchantName)}</Message>

          <Reference>
            <OrderId>#{orderId}</OrderId>
            <Total>{formatKwanza(total)}</Total>
          </Reference>
        </Body>
      </ScrollView>

      <Actions>
        <Button
          variant="primary"
          size="lg"
          shape="pill"
          onPress={props.state === 'failed' ? props.onRetry : props.onCompletePayment}
        >
          {failed ? content.retry : content.completePayment}
        </Button>
        <Button
          variant="text"
          size="lg"
          onPress={props.state === 'failed' ? props.onChangeMethod : props.onCancelOrder}
        >
          {failed ? content.changeMethod : content.cancelOrder}
        </Button>
      </Actions>
    </Screen>
  );
}
