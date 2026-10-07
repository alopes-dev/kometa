import { Pressable } from 'react-native';
import { formatKwanza } from '@/features/home/format';
import { content } from '../../content';
import type { OrderRecord } from '../../store';
import { OrderStatusChip } from '../OrderStatusChip';
import {
  BottomRow,
  Info,
  Merchant,
  Meta,
  OrderId,
  Row,
  Total,
  TopRow,
} from './OrderHistoryRow.styles';

/**
 * One line of board 05's `Anteriores`.
 *
 * A refunded order writes `Reembolsado` in the meta line rather than carrying
 * a second chip: board 05 draws one chip per row (`Cancelado`), and the
 * refund is news about the money, which is what the meta line is for.
 */

const REFUNDED = 'Reembolsado';

export type OrderHistoryRowProps = {
  order: OrderRecord;
  merchantName: string;
  onPress: () => void;
  /** Injected so `Hoje` is deterministic in a test. */
  now?: number;
};

export function OrderHistoryRow({ order, merchantName, onPress, now }: OrderHistoryRowProps) {
  const itemCount = order.lines.reduce((total, line) => total + line.quantity, 0);
  const meta =
    order.stage === 'cancelled'
      ? `${content.historyMeta(order.placedAt, itemCount, now).split(' · ')[0]} · ${REFUNDED}`
      : content.historyMeta(order.placedAt, itemCount, now);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${merchantName}, ${meta}, ${formatKwanza(order.totals.total)}`}
    >
      <Row>
        <TopRow>
          <Info>
            <Merchant>{merchantName}</Merchant>
            <Meta>{meta}</Meta>
          </Info>
          <Total>{formatKwanza(order.totals.total)}</Total>
        </TopRow>
        <BottomRow>
          {order.stage ? <OrderStatusChip stage={order.stage} /> : null}
          <OrderId>#{order.orderId}</OrderId>
        </BottomRow>
      </Row>
    </Pressable>
  );
}
