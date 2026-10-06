import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { getRestaurantById } from '@/features/home/data';
import { formatDeliveryWindow, formatKwanza } from '@/features/home/format';
import { useCart } from '@/hooks/useCart';
import { useCheckoutFlow } from '@/hooks/useCheckoutFlow';
import { checkoutTextStyle, continuousCorners } from '@/theme';
import { deriveCtaContract } from '../../checkoutState';
import { content } from '../../content';
import { getPaymentMethod, mockAddresses } from '../../mockData';
import { computeOrderSummary } from '../../pricing';
import { evaluatePromo, promoDiscount } from '../../promotions';
import { CheckoutAction } from '../CheckoutAction';
import { MerchantContext } from '../MerchantContext';
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

const Lines = styled.View`
  gap: ${({ theme }) => theme.spacing[8]}px;
  padding: ${({ theme }) => theme.checkout.metrics.rowPadding}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.merchantRadius}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

const Line = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[12]}px;
`;

const LineLabel = styled.Text`
  ${checkoutTextStyle('reviewLine')}
  flex: 1;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const LinePrice = styled.Text`
  ${checkoutTextStyle('reviewPrice')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

/**
 * Board 13. The last reading before the money moves.
 *
 * Every section is a link back to the step that produced it, and going back
 * keeps everything — board 13's "Voltar sem perder dados". The two rows that
 * are already settled (the address and the payment method) are drawn as
 * selected rather than as links, because there is nothing left to decide about
 * them here.
 */
export function ReviewScreen() {
  const router = useRouter();
  const { items, subtotal, restaurantId } = useCart();
  const { addressId, instructions, phone, paymentMethodId, promoCode } = useCheckoutFlow();

  const merchant = restaurantId ? getRestaurantById(restaurantId) : undefined;
  const address = mockAddresses.find((candidate) => candidate.id === addressId);
  const method = paymentMethodId ? getPaymentMethod(paymentMethodId) : undefined;
  const promo = promoCode ? evaluatePromo(promoCode, subtotal) : { state: 'idle' as const };
  const summary = computeOrderSummary({
    subtotal,
    deliveryFee: merchant?.deliveryFee ?? 0,
    discount: promoDiscount(promo),
  });

  const contract = deriveCtaContract({
    step: 'review',
    cart: items.length === 0 ? 'empty' : 'ready',
    delivery: address ? 'valid' : 'missing',
    payment: method ? 'selected' : 'unselected',
    order: 'draft',
    total: summary.total,
    remainingToMinimum: 0,
  });

  return (
    <Screen>
      <ScreenHeader title={content.reviewTitle} caption={content.reviewCaption} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Body>
          {merchant ? <MerchantContext merchant={merchant} /> : null}

          <Lines>
            {items.map((entry) => (
              <Line key={entry.lineId}>
                <LineLabel numberOfLines={2}>
                  {content.reviewLine(entry.quantity, entry.item.name)}
                </LineLabel>
                <LinePrice>{formatKwanza(entry.unitPrice * entry.quantity)}</LinePrice>
              </Line>
            ))}
          </Lines>

          {address ? (
            <SelectionRow
              icon={{ name: 'home-outline', sf: 'house' }}
              title={address.label}
              subtitle={`${address.zone}, ${address.city}${merchant ? ` · ${formatDeliveryWindow(merchant.deliveryTimeMinutes)}` : ''}`}
              state="selected"
            />
          ) : null}

          <SelectionRow
            icon={{ name: 'call-outline', sf: 'phone' }}
            title={content.contactRow}
            subtitle={phone || content.contactPlaceholder}
            onPress={() => router.push('/checkout/instructions')}
          />

          <SelectionRow
            icon={{ name: 'chatbubble-ellipses-outline', sf: 'message' }}
            title={content.instructionsRow}
            subtitle={instructions || content.instructionsPlaceholder}
            onPress={() => router.push('/checkout/instructions')}
          />

          {method ? (
            <SelectionRow
              icon={method.icon}
              title={content.paymentRow}
              subtitle={method.label}
              state="selected"
            />
          ) : (
            <SelectionRow
              icon={{ name: 'card-outline', sf: 'creditcard' }}
              title={content.paymentRow}
              subtitle={content.paymentMissingBody}
              onPress={() => router.push('/checkout/payment')}
            />
          )}

          <OrderSummaryCard summary={summary} />
        </Body>
      </ScrollView>
      <CheckoutAction contract={contract} onPress={() => router.push('/checkout/status')} />
    </Screen>
  );
}
