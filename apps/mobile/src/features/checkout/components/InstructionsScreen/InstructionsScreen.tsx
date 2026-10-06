import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import styled, { useTheme } from 'styled-components/native';
import { getRestaurantById } from '@/features/home/data';
import { formatDeliveryWindow } from '@/features/home/format';
import { useCart } from '@/hooks/useCart';
import { useCheckoutFlow } from '@/hooks/useCheckoutFlow';
import { checkoutTextStyle, continuousCorners } from '@/theme';
import { content } from '../../content';
import { INSTRUCTION_MAX_LENGTH, mockAddresses } from '../../mockData';
import { CheckoutAction } from '../CheckoutAction';
import { FeedbackBanner } from '../FeedbackBanner';
import { FormField } from '../FormField';
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

const Suggestions = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[8]}px;
`;

const Suggestion = styled.View<{ active: boolean }>`
  min-height: ${({ theme }) => theme.layout.minHitTarget - 10}px;
  justify-content: center;
  padding-horizontal: ${({ theme }) => theme.spacing[12]}px;
  padding-vertical: ${({ theme }) => theme.spacing[8]}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  ${continuousCorners}
  background-color: ${({ theme, active }) =>
    active ? theme.colors.status.success.bg : theme.colors.background.secondary};
`;

const SuggestionLabel = styled.Text<{ active: boolean }>`
  ${checkoutTextStyle('rowSubtitle')}
  color: ${({ theme, active }) => (active ? theme.colors.text.success : theme.colors.text.secondary)};
`;

/**
 * Board 11. Instructions, a contact and the ETA.
 *
 * The suggestions are not a taxonomy — they are the three sentences couriers
 * are told most often, offered as one tap each so the common case needs no
 * typing. Choosing one writes it into the field, where it stays editable.
 *
 * The contact is Angolan by default (+244) and its privacy note is immediately
 * under it: "usado apenas para coordenar esta entrega" is the whole scope of
 * the permission being asked for.
 */
export function InstructionsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { restaurantId } = useCart();
  const { addressId, instructions, setInstructions, phone, setPhone } = useCheckoutFlow();

  const [draft, setDraft] = useState(instructions);
  const merchant = restaurantId ? getRestaurantById(restaurantId) : undefined;
  const address = mockAddresses.find((candidate) => candidate.id === addressId);

  const save = () => {
    setInstructions(draft.slice(0, INSTRUCTION_MAX_LENGTH));
    router.push('/checkout/payment');
  };

  return (
    <Screen>
      <ScreenHeader title={content.instructionsTitle} caption={content.instructionsCaption} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Body>
            <FormField
              label={content.instructionsLabel}
              value={draft}
              onChangeText={(next) => setDraft(next.slice(0, INSTRUCTION_MAX_LENGTH))}
              placeholder={content.instructionsPlaceholder}
              multiline
              maxLength={INSTRUCTION_MAX_LENGTH}
              helper={content.characterCount(draft.length, INSTRUCTION_MAX_LENGTH)}
            />

            <Suggestions>
              {content.instructionSuggestions.map((suggestion) => {
                const active = draft.includes(suggestion);
                return (
                  <Pressable
                    key={suggestion}
                    onPress={() =>
                      setDraft(active ? draft.replace(suggestion, '').trim() : `${suggestion}. `)
                    }
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => ({ opacity: pressed ? theme.pressed.opacity : 1 })}
                  >
                    <Suggestion active={active}>
                      <SuggestionLabel active={active}>{suggestion}</SuggestionLabel>
                    </Suggestion>
                  </Pressable>
                );
              })}
            </Suggestions>

            <FormField
              label={content.contactLabel}
              value={phone}
              onChangeText={setPhone}
              placeholder={content.contactPlaceholder}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              helper={content.contactPrivacyNote}
            />

            {address ? (
              <SelectionRow
                icon={{ name: 'home-outline', sf: 'house' }}
                title={address.label}
                subtitle={`${address.zone}, ${address.city}`}
                state="selected"
              />
            ) : null}

            <FeedbackBanner
              tone="success"
              icon={{ name: 'time-outline', sf: 'clock' }}
              title={content.etaTitle}
              body={
                merchant
                  ? `${formatDeliveryWindow(merchant.deliveryTimeMinutes)} após confirmação do pedido.`
                  : content.etaBody
              }
            />
          </Body>
        </ScrollView>
      </KeyboardAvoidingView>
      <CheckoutAction
        contract={{ label: content.saveAndContinue, tone: 'brand', enabled: true }}
        onPress={save}
      />
    </Screen>
  );
}
