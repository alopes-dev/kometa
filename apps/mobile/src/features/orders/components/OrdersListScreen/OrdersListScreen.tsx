import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Icon } from '@/components/design-system/atoms';
import { ordersTextStyle } from '@/theme';
import { content } from '../../content';
import type { OrderRecord } from '../../store';
import { ActiveOrderCard } from '../ActiveOrderCard';
import { OrderHistoryRow } from '../OrderHistoryRow';

/**
 * Board 05 — the Pedidos tab.
 *
 * Data arrives as props rather than being read from the store here, the
 * pattern `HomeScreen` sets: the route resolves what to show and where each
 * row goes, so the screen renders in a test without a navigator or a
 * provider.
 *
 * A section with nothing under it is omitted rather than shown empty, and
 * with no orders at all the screen says so instead of presenting two bare
 * headings.
 */

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const Header = styled.View<{ topInset: number }>`
  padding-top: ${({ theme, topInset }) => theme.spacing[16] + topInset}px;
  padding-horizontal: ${({ theme }) => theme.orders.metrics.bodyPaddingH}px;
  padding-bottom: ${({ theme }) => theme.spacing[8]}px;
`;

const Title = styled.Text`
  ${ordersTextStyle('statusTitle')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Body = styled.View`
  gap: ${({ theme }) => theme.orders.metrics.bodyGap}px;
  padding-horizontal: ${({ theme }) => theme.orders.metrics.bodyPaddingH}px;
  padding-bottom: ${({ theme }) => theme.spacing[32]}px;
`;

const Section = styled.View`
  gap: ${({ theme }) => theme.spacing[12]}px;
`;

const SectionTitle = styled.Text`
  ${ordersTextStyle('sectionTitle')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Empty = styled.View`
  align-items: center;
  gap: ${({ theme }) => theme.spacing[8]}px;
  padding-vertical: ${({ theme }) => theme.spacing[32]}px;
`;

const EmptyTitle = styled.Text`
  ${ordersTextStyle('merchantName')}
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

const EmptyBody = styled.Text`
  ${ordersTextStyle('caption')}
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

export type OrdersListScreenProps = {
  active?: OrderRecord;
  history: OrderRecord[];
  /** Resolves a merchant id to its name — injected so the screen reads no catalogue. */
  merchantName: (merchantId: string) => string;
  onTrack: (order: OrderRecord) => void;
  onOpen: (order: OrderRecord) => void;
  now?: number;
};

export function OrdersListScreen({
  active,
  history,
  merchantName,
  onTrack,
  onOpen,
  now,
}: OrdersListScreenProps) {
  const insets = useSafeAreaInsets();
  const isEmpty = !active && history.length === 0;

  return (
    <Screen>
      <Header topInset={insets.top}>
        <Title>{content.ordersTitle}</Title>
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Body>
          {isEmpty ? (
            <Empty>
              <Icon name="receipt-outline" sf="list.bullet.rectangle" size={32} color="secondary" />
              <EmptyTitle>{content.emptyTitle}</EmptyTitle>
              <EmptyBody>{content.emptyBody}</EmptyBody>
            </Empty>
          ) : null}

          {active ? (
            <Section>
              <SectionTitle>{content.sectionActive}</SectionTitle>
              <ActiveOrderCard
                order={active}
                merchantName={merchantName(active.merchantId)}
                onTrack={() => onTrack(active)}
              />
            </Section>
          ) : null}

          {history.length > 0 ? (
            <Section>
              <SectionTitle>{content.sectionHistory}</SectionTitle>
              {history.map((order) => (
                <OrderHistoryRow
                  key={order.orderId}
                  order={order}
                  merchantName={merchantName(order.merchantId)}
                  onPress={() => onOpen(order)}
                  now={now}
                />
              ))}
            </Section>
          ) : null}
        </Body>
      </ScrollView>
    </Screen>
  );
}
