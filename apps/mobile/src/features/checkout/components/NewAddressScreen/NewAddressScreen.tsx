import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { checkoutTextStyle } from '@/theme';
import { content } from '../../content';
import { CheckoutAction } from '../CheckoutAction';
import { FeedbackBanner } from '../FeedbackBanner';
import { FormField } from '../FormField';
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

const Note = styled.Text`
  ${checkoutTextStyle('progressNote')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

/**
 * Board 10, third screen. A manual address, typed.
 *
 * Location is offered at the top as an optional shortcut and is never
 * required: the whole form can be completed without granting anything, which
 * is what board 19's privacy principle asks for.
 */
export function NewAddressScreen() {
  const router = useRouter();
  const [label, setLabel] = useState('');
  const [zone, setZone] = useState('');
  const [street, setStreet] = useState('');
  const [reference, setReference] = useState('');

  const canSave = label.trim().length > 0 && zone.trim().length > 0 && street.trim().length > 0;

  return (
    <Screen>
      <ScreenHeader title={content.newAddressTitle} caption={content.newAddressCaption} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Body>
            <FeedbackBanner
              tone="info"
              icon={{ name: 'navigate-outline', sf: 'location' }}
              title={content.fillWithLocation}
              body={content.optional}
            />
            <FormField
              label={content.addressNameLabel}
              value={label}
              onChangeText={setLabel}
              placeholder="Casa"
            />
            <FormField
              label={content.addressZoneLabel}
              value={zone}
              onChangeText={setZone}
              placeholder="Talatona"
            />
            <FormField
              label={content.addressStreetLabel}
              value={street}
              onChangeText={setStreet}
              placeholder="Rua do MAT, Condomínio 12"
            />
            <FormField
              label={content.addressReferenceLabel}
              value={reference}
              onChangeText={setReference}
              placeholder="Portão ao lado da farmácia"
            />
            <FormField label={content.addressCityLabel} value="Luanda" editable={false} />
            <Note>{content.addressFormNote}</Note>
          </Body>
        </ScrollView>
      </KeyboardAvoidingView>
      <CheckoutAction
        contract={{
          label: content.saveAddress,
          tone: canSave ? 'brand' : 'disabled',
          enabled: canSave,
        }}
        onPress={() => router.back()}
      />
    </Screen>
  );
}
