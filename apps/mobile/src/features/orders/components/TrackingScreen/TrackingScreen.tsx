import { View } from 'react-native';
import styled from 'styled-components/native';
import { ordersTextStyle } from '@/theme';
import { content } from '../../content';
import { courierVisibility } from '../../stages';
import { delayWindow, etaBand, formatEta } from '../../eta';
import { isSnapshotStale, type OrderRecord } from '../../store';
import type { EtaBand } from '../../types';
import { CourierCard } from '../CourierCard';
import { MapCanvas } from '../MapCanvas';
import { OrderStatusChip } from '../OrderStatusChip';
import { ScreenHeader } from '../ScreenHeader';
import { StatusBanner } from '../StatusBanner';
import { TrackingSheet } from '../TrackingSheet';

/**
 * Boards 07 and 08 — where it is, what is happening, when it arrives and what
 * can be done about it.
 *
 * The screen never claims to be live. When the last confirmed snapshot has
 * aged, the ETA is relabelled as the last one known and the update is
 * datestamped: board 18 forbids inventing anything newer, and board 13 asks
 * that the context survive the failure rather than being replaced by it.
 */

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const Map = styled.View`
  flex: 1;
`;

const Sheet = styled.View`
  gap: ${({ theme }) => theme.spacing[12]}px;
  padding-horizontal: ${({ theme }) => theme.orders.metrics.bodyPaddingH}px;
  padding-bottom: ${({ theme }) => theme.spacing[32]}px;
`;

const Status = styled.Text`
  ${ordersTextStyle('statusTitle')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Eta = styled.Text`
  ${ordersTextStyle('eta')}
  color: ${({ theme }) => theme.colors.brand.base};
`;

const Freshness = styled.Text`
  ${ordersTextStyle('caption')}
  color: ${({ theme }) => theme.colors.text.muted};
`;

export type TrackingScreenProps = {
  order: OrderRecord;
  merchantName: string;
  onBack: () => void;
  onMessage: () => void;
  onCall: () => void;
  /**
   * Set when the delivery was re-estimated — board 07's delay banner. It
   * carries its own interval because "Novo intervalo" is the whole point: the
   * stage's own band is the estimate the delay has just replaced.
   */
  delay?: { from: number; band: EtaBand };
  locationDenied?: boolean;
  /** Injected so freshness is deterministic in a test. */
  now?: number;
};

export function TrackingScreen({
  order,
  merchantName,
  onBack,
  onMessage,
  onCall,
  delay,
  locationDenied,
  now = Date.now(),
}: TrackingScreenProps) {
  if (order.stage === null) return null;

  const stale = isSnapshotStale(order, now);
  const band = etaBand(order.stage);
  const delivered = order.events.find((event) => event.stage === 'delivered')?.occurredAt;

  const title = delay ? content.stillOnTheWay : content.onTheWay;

  return (
    <Screen>
      <ScreenHeader title={content.trackingTitle} onBack={onBack} />

      <Map>
        <MapCanvas stage={order.stage} locationDenied={locationDenied} />
      </Map>

      <TrackingSheet>
        <Sheet>
          {delay ? (
            <StatusBanner
              tone="warning"
              title={content.delayTitle}
              body={content.delayBody(delayWindow(delay.from, delay.band))}
            />
          ) : null}

          <View style={{ gap: 2 }}>
            <Status>{title}</Status>
            {/*
              A stale snapshot is relabelled rather than hidden: the figure is
              still the best the app has, and saying so is what makes it
              honest.
            */}
            <Eta>{stale ? content.lastEta(band) : content.etaLine(band)}</Eta>
            <Freshness>
              {stale
                ? content.lastUpdatedAt(formatEta({ kind: 'time', at: order.snapshotAt }))
                : content.updatedNow}
            </Freshness>
          </View>

          <View style={{ alignSelf: 'flex-start' }}>
            <OrderStatusChip stage={order.stage} />
          </View>

          <CourierCard
            visibility={courierVisibility(order.stage)}
            courier={order.courier}
            onMessage={onMessage}
            onCall={onCall}
            completedAt={delivered}
          />
        </Sheet>
      </TrackingSheet>
    </Screen>
  );
}
