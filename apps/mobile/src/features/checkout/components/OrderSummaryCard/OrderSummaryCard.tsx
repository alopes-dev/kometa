import { formatKwanza } from '@/features/home/format';
import { content } from '../../content';
import type { OrderSummary } from '../../types';
import {
  Card,
  Divider,
  Label,
  Note,
  Row,
  TotalLabel,
  TotalRow,
  TotalValue,
  Value,
} from './OrderSummaryCard.styles';

export type OrderSummaryCardProps = {
  summary: OrderSummary;
};

/**
 * Subtotal, Entrega, Desconto, Total — in that order, with nothing between
 * them and nothing hidden behind a disclosure.
 *
 * The discount line only appears when there is one, and it reads as a negative
 * number in the brand colour (board 03): a discount written as a positive
 * figure beside the others is read as another charge.
 *
 * Free delivery is the word "Grátis" rather than "0 Kz", and a surged fee
 * carries its explanation, because board 19 · 05 requires the cause of the
 * delivery figure to be legible.
 */
export function OrderSummaryCard({ summary }: OrderSummaryCardProps) {
  const { subtotal, delivery, deliveryMode, discount, total } = summary;

  return (
    <Card accessibilityRole="summary">
      <Row>
        <Label>{content.subtotal}</Label>
        <Value>{formatKwanza(subtotal)}</Value>
      </Row>
      <Row>
        <Label>{content.delivery}</Label>
        <Value accent={deliveryMode === 'free'}>
          {deliveryMode === 'free' ? content.free : formatKwanza(delivery)}
        </Value>
      </Row>
      {discount > 0 ? (
        <Row>
          <Label>{content.discount}</Label>
          <Value accent>{`-${formatKwanza(discount)}`}</Value>
        </Row>
      ) : null}
      <Divider />
      <TotalRow>
        <TotalLabel>{content.total}</TotalLabel>
        <TotalValue>{formatKwanza(total)}</TotalValue>
      </TotalRow>
      {deliveryMode === 'dynamic' ? <Note>{content.dynamicDeliveryNote}</Note> : null}
    </Card>
  );
}
