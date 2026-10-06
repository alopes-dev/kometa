import { useState } from 'react';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { getRestaurantById } from '@/features/home/data';
import { useCart } from '@/hooks/useCart';
import { useCheckoutFlow } from '@/hooks/useCheckoutFlow';
import { checkoutTextStyle } from '@/theme';
import { content } from '../../content';
import { PAYMENT_METHODS } from '../../mockData';
import { computeOrderSummary } from '../../pricing';
import { evaluatePromo, promoDiscount } from '../../promotions';
import { CheckoutAction } from '../CheckoutAction';
import { FeedbackBanner } from '../FeedbackBanner';
import { OrderSummaryCard } from '../OrderSummaryCard';
import { ScreenHeader } from '../ScreenHeader';
import { SelectionRow } from '../SelectionRow';

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const Body = styled.View`
  gap: ${({ theme }) => theme.checkout.metrics.bodyGap}px;
  padding-horizontal: ${({ theme }) => theme.checkout.metrics.bodyPaddingH}px;
  padding-top: ${({ theme }) => theme.checkout.metrics.bodyPaddingTop}px;
  padding-bottom: ${({ theme }) => theme.checkout.metrics.bodyPaddingBottom}px;
`;

const Note = styled.Text`
  ${checkoutTextStyle('progressNote')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

/**
 * Board 12. One method per order, and indisponibilidade explained.
 *
 * `digitalAvailable` is local state so the board's third screen is reachable:
 * when the digital methods are down the rows lock, the banner names the
 * alternative that still works, and `Tentar novamente` brings them back
 * without leaving the screen. Cash is never locked — it is what the fallback
 * is made of.
 */
export function PaymentScreen() {
  const router = useRouter();
  const { subtotal, restaurantId } = useCart();
  const { paymentMethodId, setPaymentMethodId, promoCode } = useCheckoutFlow();
  const [digitalAvailable, setDigitalAvailable] = useState(true);
  const [showMissing, setShowMissing] = useState(false);

  const merchant = restaurantId ? getRestaurantById(restaurantId) : undefined;
  const promo = promoCode ? evaluatePromo(promoCode, subtotal) : { state: 'idle' as const };
  const summary = computeOrderSummary({
    subtotal,
    deliveryFee: merchant?.deliveryFee ?? 0,
    discount: promoDiscount(promo),
  });

  const selected = PAYMENT_METHODS.find((method) => method.id === paymentMethodId);

  return (
    <Screen>
      <ScreenHeader
        title={content.paymentTitle}
        caption={
          !digitalAvailable
            ? content.paymentLiveCaption
            : selected
              ? content.paymentChooseCaption
              : content.paymentNoneCaption
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Body>
          {showMissing && !selected ? (
            <FeedbackBanner
              tone="warning"
              title={content.paymentMissingTitle}
              body={content.paymentMissingBody}
            />
          ) : null}

          {PAYMENT_METHODS.map((method) => {
            const unavailable = !method.settlesOnDelivery && !digitalAvailable;
            return (
              <SelectionRow
                key={method.id}
                icon={method.icon}
                title={method.label}
                subtitle={
                  unavailable
                    ? content.paymentTemporarilyUnavailable
                    : method.id === paymentMethodId
                      ? `${method.subtitle} · selecionado`
                      : method.subtitle
                }
                state={
                  unavailable
                    ? 'unavailable'
                    : method.id === paymentMethodId
                      ? 'selected'
                      : 'default'
                }
                onPress={() => {
                  setPaymentMethodId(method.id);
                  setShowMissing(false);
                }}
              />
            );
          })}

          {!digitalAvailable ? (
            <>
              <FeedbackBanner
                tone="warning"
                icon={{ name: 'cloud-offline-outline', sf: 'wifi.slash' }}
                title={content.paymentUnavailableTitle}
                body={content.paymentUnavailableBody}
              />
              <SelectionRow
                icon={{ name: 'refresh-outline', sf: 'arrow.clockwise' }}
                title={content.retry}
                onPress={() => setDigitalAvailable(true)}
              />
            </>
          ) : (
            <FeedbackBanner
              tone="info"
              title={content.singleMethodTitle}
              body={content.singleMethodBody}
            />
          )}

          {selected ? (
            <OrderSummaryCard summary={summary} />
          ) : (
            <Note>{content.digitalConfirmNote}</Note>
          )}
        </Body>
      </ScrollView>
      <CheckoutAction
        contract={{
          label: selected
            ? selected.settlesOnDelivery && !digitalAvailable
              ? content.continueWithCash
              : content.continueToReview
            : content.ctaSelectPayment,
          tone: selected ? 'brand' : 'disabled',
          enabled: Boolean(selected),
        }}
        onPress={() => {
          if (!selected) {
            setShowMissing(true);
            return;
          }
          router.push('/checkout/review');
        }}
      />
    </Screen>
  );
}
