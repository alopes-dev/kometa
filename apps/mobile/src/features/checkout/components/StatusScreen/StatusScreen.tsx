import { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import styled from 'styled-components/native';
import { getRestaurantById } from '@/features/home/data';
import { formatDeliveryWindow, formatKwanza } from '@/features/home/format';
import { useCart } from '@/hooks/useCart';
import { useCheckoutFlow } from '@/hooks/useCheckoutFlow';
import { checkoutTextStyle, continuousCorners } from '@/theme';
import { content } from '../../content';
import { getPaymentMethod, mockAddresses } from '../../mockData';
import { buildIdempotencyKey, submitOrder, type GatewayResult } from '../../order';
import { computeOrderSummary } from '../../pricing';
import { evaluatePromo, promoDiscount } from '../../promotions';
import { clearSession } from '../../session';
import type { Order } from '../../types';
import { CheckoutAction } from '../CheckoutAction';
import { FeedbackBanner } from '../FeedbackBanner';
import { ScreenHeader } from '../ScreenHeader';
import { SelectionRow } from '../SelectionRow';
import { StateScreen } from '../StateScreen';

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const Body = styled.View`
  gap: ${({ theme }) => theme.checkout.metrics.bodyGap}px;
  padding-horizontal: ${({ theme }) => theme.checkout.metrics.bodyPaddingH}px;
  padding-bottom: ${({ theme }) => theme.checkout.metrics.bodyPaddingBottom}px;
`;

const Facts = styled.View`
  gap: ${({ theme }) => theme.checkout.metrics.summaryGap}px;
  padding: ${({ theme }) => theme.checkout.metrics.summaryPadding}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.summaryRadius}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

const Fact = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[12]}px;
`;

const FactLabel = styled.Text`
  ${checkoutTextStyle('summaryLabel')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const FactValue = styled.Text`
  ${checkoutTextStyle('summaryValue')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

/** How long a digital payment is given before it is reported as pending. */
const SETTLE_DELAY = 1400;

/**
 * Boards 14 and 17 — everything after the pay button.
 *
 * The submission happens here rather than on the review screen, so the
 * processing state has somewhere to live and the back gesture cannot fire a
 * second attempt at a payment that is already in flight. The key is derived
 * from the cart, so even if it did, the order would be the same one.
 *
 * `simulate` exists for the two outcomes a fixture cannot produce on its own —
 * board 17 draws a pending payment and a refused one, and both have to be
 * reachable to be reviewed.
 */
export function StatusScreen() {
  const router = useRouter();
  const { simulate } = useLocalSearchParams<{ simulate?: 'pending' | 'failed' }>();
  const { items, subtotal, restaurantId, clearCart } = useCart();
  const { addressId, paymentMethodId, promoCode, order, setOrder, reset } = useCheckoutFlow();

  const [isSubmitting, setIsSubmitting] = useState(order === null);
  const hasSubmitted = useRef(false);

  const merchant = restaurantId ? getRestaurantById(restaurantId) : undefined;
  const address = mockAddresses.find((candidate) => candidate.id === addressId);
  const method = paymentMethodId ? getPaymentMethod(paymentMethodId) : undefined;
  const promo = promoCode ? evaluatePromo(promoCode, subtotal) : { state: 'idle' as const };
  const summary = computeOrderSummary({
    subtotal,
    deliveryFee: merchant?.deliveryFee ?? 0,
    discount: promoDiscount(promo),
  });

  useEffect(() => {
    if (hasSubmitted.current || !method || !restaurantId || order) return;
    hasSubmitted.current = true;

    const key = buildIdempotencyKey({
      merchantId: restaurantId,
      lines: items.map((entry) => `${entry.lineId}:${entry.quantity}`),
      total: summary.total,
    });

    const gateway = () =>
      new Promise<GatewayResult>((resolve) => {
        setTimeout(() => {
          if (simulate === 'failed') resolve({ outcome: 'failed' });
          else if (simulate === 'pending') resolve({ outcome: 'timeout' });
          else resolve({ outcome: 'confirmed', providerReference: key });
        }, SETTLE_DELAY);
      });

    let cancelled = false;
    submitOrder({
      key,
      totals: summary,
      settlesOnDelivery: method.settlesOnDelivery,
      gateway,
    }).then((result) => {
      if (cancelled) return;
      setOrder(result);
      setIsSubmitting(false);
      if (result.status === 'confirmed') {
        // Board 19 · 07: the success haptic belongs to a confirmed order
        // and to nothing before it.
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        clearSession();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [items, method, order, restaurantId, setOrder, simulate, summary]);

  const retry = () => {
    hasSubmitted.current = false;
    setOrder(null);
    setIsSubmitting(true);
  };

  const track = (confirmed: Order) => {
    clearCart();
    reset();
    router.replace({
      pathname: '/order-tracking',
      params: {
        restaurantId: restaurantId ?? '',
        itemCount: String(items.length),
        total: String(confirmed.totals.total),
        deliverySummary: address ? `${address.label} · ${address.zone}` : content.deliveryRow,
        paymentSummary: method?.label ?? '',
      },
    });
  };

  if (isSubmitting || !order) {
    return (
      <Screen>
        <ScreenHeader
          title={content.processingTitle}
          caption={content.processingCaption}
          onBack={() => {}}
        />
        <StateScreen
          tone="progress"
          title={content.processingHeadline}
          body={content.processingBody}
        />
        <CheckoutAction
          contract={{
            label: content.ctaProcessing,
            tone: 'brand',
            enabled: false,
            icon: 'spinner',
          }}
          onPress={() => {}}
        />
      </Screen>
    );
  }

  if (order.status === 'pending') {
    return (
      <Screen>
        <ScreenHeader title={content.pendingTitle} caption={content.pendingCaption} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <StateScreen tone="pending" title={content.pendingHeadline} body={content.pendingBody} />
          <Body>
            <SelectionRow
              icon={{ name: 'receipt-outline', sf: 'doc.text' }}
              title={content.orderRow}
              subtitle={content.orderReference(order.orderId, order.totals.total)}
            />
            <FeedbackBanner
              tone="info"
              title={content.pendingSafeTitle}
              body={content.pendingSafeBody}
            />
          </Body>
        </ScrollView>
      </Screen>
    );
  }

  if (order.status === 'failed') {
    return (
      <Screen>
        <ScreenHeader title={content.failedTitle} caption={content.failedCaption} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <StateScreen tone="error" title={content.failedHeadline} body={content.failedBody} />
          <Body>
            {method ? (
              <SelectionRow
                icon={method.icon}
                title={method.label}
                subtitle={content.failedMethodSubtitle}
              />
            ) : null}
            <SelectionRow
              icon={{ name: 'swap-horizontal-outline', sf: 'arrow.left.arrow.right' }}
              title={content.changePaymentMethod}
              onPress={() => router.replace('/checkout/payment')}
            />
            <FeedbackBanner
              tone="success"
              title={content.dataKeptTitle}
              body={content.dataKeptBody}
            />
          </Body>
        </ScrollView>
        <CheckoutAction
          contract={{ label: content.retry, tone: 'destructive', enabled: true }}
          onPress={retry}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title={content.confirmedTitle}
        caption={order.orderId}
        onBack={() => track(order)}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <StateScreen
          tone="success"
          title={content.confirmedHeadline}
          body={content.confirmedBody(merchant?.name ?? '')}
        />
        <Body>
          <Facts>
            <Fact>
              <FactLabel>{content.forecastRow}</FactLabel>
              <FactValue>
                {merchant ? formatDeliveryWindow(merchant.deliveryTimeMinutes) : content.etaBody}
              </FactValue>
            </Fact>
            <Fact>
              <FactLabel>{content.deliveryRow}</FactLabel>
              <FactValue>{address ? `${address.label} · ${address.zone}` : ''}</FactValue>
            </Fact>
            <Fact>
              <FactLabel>{content.totalRow}</FactLabel>
              <FactValue>{formatKwanza(order.totals.total)}</FactValue>
            </Fact>
          </Facts>
          {method?.settlesOnDelivery ? (
            <FeedbackBanner
              tone="info"
              icon={method.icon}
              title={method.label}
              body={content.cashOnDeliveryBody(order.totals.total)}
            />
          ) : null}
        </Body>
      </ScrollView>
      <CheckoutAction
        contract={{ label: content.trackOrder, tone: 'brand', enabled: true }}
        onPress={() => track(order)}
      />
    </Screen>
  );
}
