import { ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { ordersTextStyle } from '@/theme';
import { content } from '../../content';
import type { OrderRecord } from '../../store';
import { buildTimeline } from '../../timeline';
import { ScreenHeader } from '../ScreenHeader';
import { TimelineList } from '../TimelineList';

/**
 * Board 10 — the order's history, in full.
 *
 * The rows come from `buildTimeline`, which is where the two board-10 rules
 * live: a stage that has not happened carries no time, and a failed refresh
 * adds a row rather than removing any.
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

const Title = styled.Text`
  ${ordersTextStyle('statusTitle')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Caption = styled.Text`
  ${ordersTextStyle('rowMeta')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export type TimelineScreenProps = {
  order: OrderRecord;
  merchantName: string;
  onBack: () => void;
  /** Set when the last refresh failed — board 10's error row. */
  failedAt?: number;
};

export function TimelineScreen({ order, merchantName, onBack, failedAt }: TimelineScreenProps) {
  if (order.stage === null) return null;

  return (
    <Screen>
      <ScreenHeader title={content.timelineTitle} onBack={onBack} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Body>
          <Title>Pedido #{order.orderId}</Title>
          <Caption>
            {merchantName} · {order.delivery.zone}
          </Caption>
          <TimelineList rows={buildTimeline(order.events, order.stage, failedAt)} />
        </Body>
      </ScrollView>
    </Screen>
  );
}
