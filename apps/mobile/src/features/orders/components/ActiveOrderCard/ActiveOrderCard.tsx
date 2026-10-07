import { useWindowDimensions, View } from 'react-native';
import { Button } from '@/components/design-system/atoms';
import { formatKwanza } from '@/features/home/format';
import { content } from '../../content';
import { etaBand } from '../../eta';
import type { OrderRecord } from '../../store';
import { OrderNumber } from '../OrderNumber';
import { OrderStatusChip } from '../OrderStatusChip';
import { Card, ChipRow, Eta, Info, Merchant, Total, TopRow } from './ActiveOrderCard.styles';

/**
 * The order in flight — board 05's `Em curso`, persistent on Home and on
 * Pedidos for as long as there is one.
 *
 * It deliberately shows merchant, total, state and ETA and NOTHING about what
 * was ordered. Board 05: "A Home não expõe detalhes de itens." The order
 * carries its lines; printing them here would put the contents of someone's
 * basket on a screen they may hand to a colleague.
 */

/**
 * Above this font scale the ETA is spelled out — board 16's AX3 screen writes
 * `Chega em aproximadamente 12 minutos` rather than `~12 min`, because a
 * tilde and an abbreviation are what a reader at that size is least able to
 * resolve.
 */
const SPELL_OUT_ABOVE = 1.5;

export type ActiveOrderCardProps = {
  order: OrderRecord;
  merchantName: string;
  onTrack: () => void;
};

export function ActiveOrderCard({ order, merchantName, onTrack }: ActiveOrderCardProps) {
  const { fontScale } = useWindowDimensions();
  const band = order.stage === null ? null : etaBand(order.stage);
  const eta =
    band === null
      ? ''
      : fontScale >= SPELL_OUT_ABOVE
        ? content.etaSpoken(band)
        : content.etaLine(band);

  return (
    <Card accessible accessibilityLabel={content.activeOrderLabel(order, merchantName)}>
      <TopRow>
        <Info>
          {/* No numberOfLines anywhere in this card: board 16 forbids critical
              content truncating or being pinned to a fixed height. */}
          <Merchant>{merchantName}</Merchant>
          <Eta>
            {eta}
            {order.delivery.zone ? ` · ${order.delivery.zone}` : ''}
          </Eta>
        </Info>
        <Total>{formatKwanza(order.totals.total)}</Total>
      </TopRow>

      <ChipRow>
        {order.stage ? <OrderStatusChip stage={order.stage} /> : null}
        <View style={{ flexShrink: 1 }}>
          <OrderNumber orderId={order.orderId} />
        </View>
      </ChipRow>

      <Button variant="primary" size="lg" shape="pill" onPress={onTrack}>
        {content.track}
      </Button>
    </Card>
  );
}
