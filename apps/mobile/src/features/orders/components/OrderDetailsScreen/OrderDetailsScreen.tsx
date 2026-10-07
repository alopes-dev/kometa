import { Pressable, ScrollView, View } from 'react-native';
import { Icon } from '@/components/design-system/atoms';
import { formatKwanza } from '@/features/home/format';
import { content } from '../../content';
import type { OrderRecord } from '../../store';
import { OrderStatusChip } from '../OrderStatusChip';
import { ScreenHeader } from '../ScreenHeader';
import {
  Actions,
  Body,
  Card,
  CardTitle,
  Caption,
  DeliveryBody,
  DeliveryCard,
  DeliveryLabel,
  Divider,
  HeadRow,
  Line,
  LineLabel,
  LineValue,
  OrderTitle,
  Screen,
} from './OrderDetailsScreen.styles';

/**
 * Board 06 — what was ordered, what it cost, where it went, and what can
 * still be done about it.
 *
 * The totals are rendered from the record's own four figures rather than
 * recomputed: board 06's "Valores transparentes" is a promise that the lines
 * add up to the total shown, and deriving the total here a second time is how
 * a receipt and a card start disagreeing.
 */

export type OrderDetailsScreenProps = {
  order: OrderRecord;
  merchantName: string;
  onBack: () => void;
  onReceipt: () => void;
  onHelp: () => void;
  onReorder: () => void;
};

export function OrderDetailsScreen({
  order,
  merchantName,
  onBack,
  onReceipt,
  onHelp,
  onReorder,
}: OrderDetailsScreenProps) {
  const { totals, delivery } = order;

  return (
    <Screen>
      <ScreenHeader
        title={content.detailsTitle}
        onBack={onBack}
        action={{ label: content.help, onPress: onHelp }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Body>
          <HeadRow>
            <OrderTitle>Pedido #{order.orderId}</OrderTitle>
            {order.stage ? <OrderStatusChip stage={order.stage} /> : null}
          </HeadRow>
          <Caption>
            {merchantName} · {delivery.zone}, {delivery.city}
          </Caption>

          <Card>
            <CardTitle>{content.sectionItems}</CardTitle>
            {order.lines.map((line) => (
              <Line key={line.productId}>
                <LineLabel>
                  {line.name} ×{line.quantity}
                </LineLabel>
                <LineValue>{formatKwanza(line.unitPrice * line.quantity)}</LineValue>
              </Line>
            ))}
          </Card>

          <View style={{ gap: 8 }}>
            <Line>
              <LineLabel>{content.subtotal}</LineLabel>
              <LineValue>{formatKwanza(totals.subtotal)}</LineValue>
            </Line>
            <Line>
              <LineLabel>{content.deliveryFee}</LineLabel>
              <LineValue>{formatKwanza(totals.delivery)}</LineValue>
            </Line>
            {totals.discount > 0 ? (
              <Line>
                <LineLabel discount>{content.discount}</LineLabel>
                {/* The minus sign is the point: board 06 draws the discount as
                    a subtraction, not as a positive number labelled one. */}
                <LineValue discount>-{formatKwanza(totals.discount)}</LineValue>
              </Line>
            ) : null}
            <Divider />
            <Line>
              <LineLabel strong>{content.total}</LineLabel>
              <LineValue strong>{formatKwanza(totals.total)}</LineValue>
            </Line>
          </View>

          <DeliveryCard>
            <Icon name="home-outline" sf="house" size={18} color="secondary" />
            <DeliveryBody>
              <DeliveryLabel>{content.sectionDelivery}</DeliveryLabel>
              <CardTitle>
                {delivery.addressLabel}, {delivery.zone}, {delivery.city}
              </CardTitle>
              {delivery.instructions ? <Caption>{delivery.instructions}</Caption> : null}
            </DeliveryBody>
          </DeliveryCard>

          <Actions>
            <SecondaryAction label={content.receipt} icon="receipt-outline" onPress={onReceipt} />
            <SecondaryAction label={content.help} icon="help-circle-outline" onPress={onHelp} />
            <SecondaryAction label={content.reorder} icon="refresh-outline" onPress={onReorder} />
          </Actions>
        </Body>
      </ScrollView>
    </Screen>
  );
}

function SecondaryAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: 'receipt-outline' | 'help-circle-outline' | 'refresh-outline';
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ flex: 1, minHeight: 44 }}
    >
      <Card style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <Icon name={icon} size={18} color="primary" />
        <Caption>{label}</Caption>
      </Card>
    </Pressable>
  );
}
