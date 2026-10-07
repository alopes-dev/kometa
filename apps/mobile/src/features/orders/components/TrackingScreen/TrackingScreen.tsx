import { useEffect, useState } from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { Button } from '@/components/design-system/atoms';
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

/** How often the screen re-asks whether its snapshot has aged. */
const STALE_TICK_MS = 10_000;

/** A clock value that moves, so staleness is evaluated against now, not mount. */
function useTicking(intervalMs: number): number {
  const [value, setValue] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setValue(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return value;
}

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
  /** Called once the order has landed, so flow A can reach board 11. */
  onDelivered?: () => void;
  /** Board 13: the device could not reach the service. */
  offline?: boolean;
  /** Board 13's `Tentar novamente`. */
  onRetry?: () => void;
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
  onDelivered,
  offline,
  onRetry,
  now,
}: TrackingScreenProps) {
  // Freshness is a question about *this moment*, so it needs a value that
  // moves. Reading the clock during render would both be impure and freeze
  // staleness at mount — a screen left open would never admit it had gone
  // stale, which is the one thing board 13 asks it to do.
  const ticking = useTicking(STALE_TICK_MS);
  const moment = now ?? ticking;
  const landed = order.stage === 'delivered';

  useEffect(() => {
    if (landed) onDelivered?.();
  }, [landed, onDelivered]);

  if (order.stage === null) return null;

  const stale = isSnapshotStale(order, moment);
  const delivered = order.events.find((event) => event.stage === 'delivered')?.occurredAt;
  // The delivery timestamp is what turns board 18's `hora real` into a real
  // hour. Resolving the band without it rendered an empty ETA beneath a title
  // still claiming the order was on its way.
  const band = etaBand(order.stage, delivered);

  // Board 13 puts the title in the past tense when the app cannot confirm
  // the present: "estava a caminho" is what it last knew to be true.
  const title = landed
    ? content.deliveredHeadline
    : offline
      ? content.wasOnTheWay
      : delay
        ? content.stillOnTheWay
        : content.onTheWay;

  // Offline, every figure on screen is a last-known one, whatever its age.
  const dated = stale || offline === true;

  return (
    <Screen>
      <ScreenHeader title={content.trackingTitle} onBack={onBack} />

      <Map>
        <MapCanvas stage={order.stage} locationDenied={locationDenied} />
      </Map>

      <TrackingSheet>
        <Sheet>
          {offline ? (
            <StatusBanner
              tone="info"
              title={content.offlineTitle}
              body={content.offlineBody(formatEta({ kind: 'time', at: order.snapshotAt }))}
            />
          ) : null}

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
            <Eta>{dated ? content.lastEta(band) : content.etaLine(band)}</Eta>
            <Freshness>
              {dated
                ? content.lastUpdatedAt(formatEta({ kind: 'time', at: order.snapshotAt }))
                : content.updatedNow}
            </Freshness>
          </View>

          <View style={{ alignSelf: 'flex-start' }}>
            <OrderStatusChip stage={order.stage} />
          </View>

          {offline && onRetry ? (
            <Button variant="outline" size="lg" shape="pill" onPress={onRetry}>
              {content.retry}
            </Button>
          ) : null}

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
