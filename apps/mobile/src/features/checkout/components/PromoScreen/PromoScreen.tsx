import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { getRestaurantById } from '@/features/home/data';
import { useCart } from '@/hooks/useCart';
import { useCheckoutFlow } from '@/hooks/useCheckoutFlow';
import { checkoutTextStyle, continuousCorners } from '@/theme';
import { content } from '../../content';
import { computeOrderSummary } from '../../pricing';
import { evaluatePromo, promoDiscount, type PromoEvaluation } from '../../promotions';
import { CheckoutAction } from '../CheckoutAction';
import { FeedbackBanner } from '../FeedbackBanner';
import { FormField } from '../FormField';
import { OrderSummaryCard } from '../OrderSummaryCard';
import { ScreenHeader } from '../ScreenHeader';

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

const AppliedCard = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[12]}px;
  padding: ${({ theme }) => theme.checkout.metrics.rowPadding}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.rowRadius}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.status.success.bg};
`;

const AppliedCopy = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing[2]}px;
`;

const AppliedCode = styled.Text`
  ${checkoutTextStyle('rowTitle')}
  color: ${({ theme }) => theme.colors.text.success};
`;

const AppliedNote = styled.Text`
  ${checkoutTextStyle('rowSubtitle')}
  color: ${({ theme }) => theme.colors.text.success};
`;

const RemoveLabel = styled.Text`
  ${checkoutTextStyle('secondaryActionLabel')}
  color: ${({ theme }) => theme.colors.text.error};
`;

const Note = styled.Text`
  ${checkoutTextStyle('progressNote')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

/**
 * Board 09. One field, six outcomes.
 *
 * The code is never cleared by a failure — "a mensagem mantém o código no
 * campo para correção. O carrinho nunca é limpo" — so an expired code can be
 * edited into a valid one without retyping, and nothing about the cart depends
 * on the promotion succeeding.
 */
export function PromoScreen() {
  const router = useRouter();
  const { subtotal, restaurantId } = useCart();
  const { promoCode, setPromoCode } = useCheckoutFlow();

  const [input, setInput] = useState(promoCode ?? '');
  const [evaluation, setEvaluation] = useState<PromoEvaluation>(
    promoCode ? evaluatePromo(promoCode, subtotal) : { state: 'idle' }
  );
  const [isValidating, setIsValidating] = useState(false);

  const merchant = restaurantId ? getRestaurantById(restaurantId) : undefined;
  const summary = computeOrderSummary({
    subtotal,
    deliveryFee: merchant?.deliveryFee ?? 0,
    discount: promoDiscount(evaluation),
  });

  const apply = () => {
    setIsValidating(true);
    const result = evaluatePromo(input, subtotal);
    setEvaluation(result);
    setIsValidating(false);
    setPromoCode(result.state === 'applied' ? result.promo.code : null);
  };

  const remove = () => {
    setEvaluation({ state: 'idle' });
    setPromoCode(null);
    setInput('');
  };

  const fieldError = evaluation.state === 'invalid' ? content.promoInvalidFieldError : undefined;

  return (
    <Screen>
      <ScreenHeader
        title={content.promoTitle}
        caption={
          evaluation.state === 'applied' ? content.promoCaption : content.promoConditionsCaption
        }
      />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Body>
          <FormField
            label={content.promoFieldLabel}
            value={input}
            onChangeText={setInput}
            placeholder={content.promoPlaceholder}
            autoCapitalize="characters"
            autoCorrect={false}
            error={fieldError}
          />

          {isValidating ? <FeedbackBanner tone="loading" title={content.promoValidating} /> : null}

          {evaluation.state === 'applied' ? (
            <>
              <FeedbackBanner
                tone="success"
                title={content.promoAppliedTitle}
                body={content.promoAppliedBody(evaluation.discount)}
              />
              <OrderSummaryCard summary={summary} />
              <AppliedCard>
                <AppliedCopy>
                  <AppliedCode>{evaluation.promo.code}</AppliedCode>
                  {evaluation.promo.usageNote ? (
                    <AppliedNote>{evaluation.promo.usageNote}</AppliedNote>
                  ) : null}
                </AppliedCopy>
                <Pressable onPress={remove} accessibilityRole="button" hitSlop={8}>
                  <RemoveLabel>{content.remove}</RemoveLabel>
                </Pressable>
              </AppliedCard>
            </>
          ) : null}

          {evaluation.state === 'invalid' ? (
            <FeedbackBanner
              tone="error"
              title={content.promoInvalidTitle}
              body={content.promoInvalidBody}
            />
          ) : null}

          {evaluation.state === 'expired' ? (
            <FeedbackBanner
              tone="error"
              icon={{ name: 'time-outline', sf: 'clock' }}
              title={content.promoExpiredTitle}
              body={content.promoExpiredBody(evaluation.promo.endedOn ?? '')}
            />
          ) : null}

          {evaluation.state === 'minimum-not-met' ? (
            <FeedbackBanner
              tone="warning"
              title={content.promoMinimumTitle}
              body={content.promoMinimumBody(evaluation.remaining, evaluation.promo.code)}
            />
          ) : null}

          <Note>{content.promoKeptNote}</Note>
        </Body>
      </ScrollView>
      <CheckoutAction
        contract={{
          label: evaluation.state === 'applied' ? content.done : content.promoApply,
          tone: 'brand',
          enabled: evaluation.state === 'applied' || input.trim().length > 0,
        }}
        onPress={evaluation.state === 'applied' ? () => router.back() : apply}
      />
    </Screen>
  );
}
