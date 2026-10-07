import { content } from '../../content';
import { refundState, type OrderRecord } from '../../store';
import { ResultScreen } from '../ResultScreen';

/**
 * Board 14's outcome screen.
 *
 * Neutral, not red: the board is explicit that red belongs to the destructive
 * action and to real errors, and that a concluded result returns to a neutral
 * palette. A cancellation the customer asked for is not an error.
 */
export type CancelledScreenProps = {
  order: OrderRecord;
  onBackToOrders: () => void;
  onHelp: () => void;
};

export function CancelledScreen({ order, onBackToOrders, onHelp }: CancelledScreenProps) {
  // A refund is only news when there was a charge. Saying "o estorno de X"
  // for an order that was never paid invents a debt on the customer's behalf.
  const refunding = refundState(order) === 'started';

  return (
    <ResultScreen
      tone="neutral"
      icon={{ name: 'close-circle-outline', sf: 'xmark.circle' }}
      title={content.cancelledHeadline}
      body={refunding ? content.refundBody(order.totals.total) : content.cancelledNoChargeBody}
      chip={refunding ? content.refundChip : content.noChargeChip}
      primary={{ label: content.backToOrders, onPress: onBackToOrders }}
      secondary={{ label: content.needHelp, onPress: onHelp }}
    />
  );
}
