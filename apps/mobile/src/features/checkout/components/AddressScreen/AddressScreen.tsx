import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { getRestaurantById } from '@/features/home/data';
import { formatKwanza } from '@/features/home/format';
import { useCart } from '@/hooks/useCart';
import { useCheckoutFlow } from '@/hooks/useCheckoutFlow';
import { checkoutTextStyle } from '@/theme';
import { content } from '../../content';
import { checkDeliveryArea, mockAddresses } from '../../mockData';
import type { Address, AddressKind } from '../../types';
import { CheckoutAction } from '../CheckoutAction';
import { FeedbackBanner } from '../FeedbackBanner';
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

const KIND_ICON: Record<
  AddressKind,
  { name: 'home-outline' | 'business-outline' | 'location-outline'; sf: string }
> = {
  home: { name: 'home-outline', sf: 'house' },
  work: { name: 'business-outline', sf: 'building.2' },
  other: { name: 'location-outline', sf: 'mappin.and.ellipse' },
};

/**
 * Board 10. The address list, the area check and the privacy note.
 *
 * The area check runs against the chosen address rather than against the
 * device's location: board 10 states that the location "nunca é necessária
 * para concluir manualmente", so nothing here is gated on a permission.
 *
 * An address outside the area is an explained refusal with the list still on
 * screen — board 15 draws exactly that, and the way out is choosing another
 * address, not going back.
 */
export function AddressScreen() {
  const router = useRouter();
  const { restaurantId } = useCart();
  const { addressId, setAddressId } = useCheckoutFlow();
  const [addresses] = useState<Address[]>(mockAddresses);

  const merchant = restaurantId ? getRestaurantById(restaurantId) : undefined;
  const selected = addresses.find((address) => address.id === addressId);

  const area = useMemo(
    () => (selected ? checkDeliveryArea(selected, merchant?.deliveryFee ?? 0) : undefined),
    [selected, merchant?.deliveryFee]
  );

  const canContinue = area?.status === 'inside';

  return (
    <Screen>
      <ScreenHeader
        title={content.deliveryTitle}
        caption={selected ? content.deliveryConfirmCaption : content.deliveryCaption}
        action={{ label: content.add, onPress: () => router.push('/checkout/address/new') }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Body>
          {area?.status === 'outside' ? (
            <FeedbackBanner
              tone="error"
              icon={{ name: 'location-outline', sf: 'location.slash' }}
              title={content.errorOutOfAreaTitle}
              body={content.outOfAreaBody(area.zone, merchant?.name ?? '')}
            />
          ) : null}

          {addresses.map((address) => (
            <SelectionRow
              key={address.id}
              icon={KIND_ICON[address.kind] as { name: 'home-outline'; sf: 'house' }}
              title={address.label}
              subtitle={`${address.zone}, ${address.city}`}
              state={address.id === addressId ? 'selected' : 'default'}
              onPress={() => setAddressId(address.id)}
            />
          ))}

          {area?.status === 'inside' ? (
            <FeedbackBanner
              tone="success"
              icon={{ name: 'navigate-outline', sf: 'location' }}
              title={content.insideAreaTitle}
              body={`Entrega estimada em ${area.etaMinutes}–${area.etaMinutes + 10} min · ${formatKwanza(area.deliveryFee)}`}
            />
          ) : null}

          <SelectionRow
            icon={{ name: 'navigate-outline', sf: 'location' }}
            title={content.useCurrentLocation}
            subtitle={content.useCurrentLocationSubtitle}
            onPress={() => router.push('/checkout/address/new')}
          />

          <FeedbackBanner
            tone="info"
            icon={{ name: 'shield-outline', sf: 'lock.shield' }}
            title={content.privacyTitle}
            body={content.privacyBody}
          />

          <Note>{content.addressFormNote}</Note>
        </Body>
      </ScrollView>
      <CheckoutAction
        contract={{
          label: canContinue ? content.useThisAddress : content.ctaAddAddress,
          tone: canContinue ? 'brand' : 'disabled',
          enabled: canContinue,
        }}
        onPress={() => router.push('/checkout/instructions')}
      />
    </Screen>
  );
}
