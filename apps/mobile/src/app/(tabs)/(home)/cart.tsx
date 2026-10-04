import { Fragment, useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Button, Icon, Text, TextField } from '@/components/design-system/atoms';
import { withAlpha } from '@/theme';
import { useTabBarVisibility } from '@/hooks/useTabBarVisibility';
import { useCart } from '@/hooks/useCart';
import { useCheckoutFlow } from '@/hooks/useCheckoutFlow';
import { getRestaurantById } from '@/features/home/data';
import { formatKwanza } from '@/features/home/format';
import { OrderItemRow } from '@/features/checkout/components/OrderItemRow';
import { OrderSummaryCard } from '@/features/checkout/components/OrderSummaryCard';
import { countSeparateConfigurations } from '@/features/checkout/configurations';
import { TIP_PRESETS } from '@/features/checkout/mockData';
import { computeOrderSummary } from '@/features/checkout/pricing';

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const Header = styled.View<{ topInset: number }>`
  padding-top: ${({ theme, topInset }) => theme.spacing[16] + topInset}px;
  padding-horizontal: ${({ theme }) => theme.spacing[16]}px;
  padding-bottom: ${({ theme }) => theme.spacing[8]}px;
  gap: ${({ theme }) => theme.spacing[8]}px;
`;

const BackButton = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surface.primary};
`;

const Content = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing[16]}px;
  gap: ${({ theme }) => theme.spacing[24]}px;
  padding-bottom: ${({ theme }) => theme.spacing[32]}px;
`;

/**
 * Board 05 E. Two lines of the same product read as a double-count unless
 * the cart says why they are separate.
 */
const ConfigurationNote = styled.View`
  gap: ${({ theme }) => theme.spacing[4]}px;
  margin-bottom: ${({ theme }) => theme.spacing[12]}px;
`;

const SectionLabel = styled.Text`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  margin-bottom: ${({ theme }) => theme.spacing[8]}px;
`;

const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  padding: ${({ theme }) => theme.spacing[16]}px;
  gap: ${({ theme }) => theme.spacing[16]}px;
`;

const CardDivider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.subtle};
`;

const AddMoreRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]}px;
  padding-top: ${({ theme }) => theme.spacing[8]}px;
`;

const CouponRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[8]}px;
`;

const CouponField = styled.View`
  flex: 1;
`;

const PillSection = styled.View`
  gap: ${({ theme }) => theme.spacing[8]}px;
  padding: ${({ theme }) => theme.spacing[16]}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => withAlpha(theme.colors.brand.base, 0.12)};
`;

const PillRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[8]}px;
`;

const TipChipRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[8]}px;
`;

const TipPill = styled.View<{ selected: boolean }>`
  height: 36px;
  padding-horizontal: ${({ theme }) => theme.spacing[16]}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, selected }) => (selected ? theme.colors.brand.base : theme.colors.background.primary)};
  border-width: ${({ selected }) => (selected ? 0 : 1)}px;
  border-color: ${({ theme }) => theme.colors.border.default};
`;

const BottomBar = styled.View<{ bottomInset: number }>`
  position: absolute;
  left: ${({ theme }) => theme.spacing[16]}px;
  right: ${({ theme }) => theme.spacing[16]}px;
  bottom: ${({ theme, bottomInset }) => bottomInset + theme.spacing[8]}px;
`;

const EmptyState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[16]}px;
  padding: ${({ theme }) => theme.spacing[32]}px;
`;

function tipAmountLabel(preset: number, subtotal: number): string {
  return preset === 0 ? 'Sem gorjeta' : formatKwanza(Math.round((subtotal * preset) / 100));
}

export default function Cart() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setIsTabBarHidden } = useTabBarVisibility();
  const { items, restaurantId, subtotal, incrementItem, decrementItem } = useCart();
  const separateConfigurations = countSeparateConfigurations(items);
  const { tipPercent, setTipPercent, couponCode, discountPercent, applyCoupon, notes, setNotes } = useCheckoutFlow();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setIsTabBarHidden(true);
      return () => setIsTabBarHidden(false);
    }, [setIsTabBarHidden])
  );

  const restaurant = restaurantId ? getRestaurantById(restaurantId) : undefined;
  const summary = computeOrderSummary(subtotal, restaurant?.deliveryFee ?? 0, discountPercent, tipPercent);

  const handleApplyCoupon = () => {
    const success = applyCoupon(couponInput);
    setCouponError(success ? null : 'Cupão inválido');
    if (success) setCouponInput('');
  };

  if (items.length === 0) {
    return (
      <Screen>
        <EmptyState>
          <Text variant="h3">O seu carrinho está vazio</Text>
          <Pressable onPress={() => router.back()} accessibilityRole="button">
            <Text color="brand">Voltar</Text>
          </Pressable>
        </EmptyState>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 96 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <Header topInset={insets.top}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={8}>
            <BackButton>
              <Icon name="chevron-back" sf="chevron.left" size={18} color="primary" />
            </BackButton>
          </Pressable>
          <Text variant="bodyStrong">Carrinho</Text>
        </Header>
        <Content>
          <View>
            <SectionLabel>Seu Pedido</SectionLabel>
            {separateConfigurations > 1 ? (
              <ConfigurationNote>
                <Text variant="h3">{`${separateConfigurations} configurações`}</Text>
                <Text variant="caption" color="secondary">
                  O mesmo produto permanece separado para não misturar escolhas.
                </Text>
              </ConfigurationNote>
            ) : null}
            <Card>
              {items.map((entry, index) => (
                <Fragment key={entry.lineId}>
                  {index > 0 ? <CardDivider /> : null}
                  <OrderItemRow
                    entry={entry}
                    onIncrement={() => incrementItem(entry.lineId)}
                    onDecrement={() => decrementItem(entry.lineId)}
                    onEdit={() =>
                      router.push(`/product/${entry.item.id}?lineId=${encodeURIComponent(entry.lineId)}`)
                    }
                  />
                </Fragment>
              ))}
            </Card>
            {restaurantId ? (
              <Pressable onPress={() => router.push(`/restaurant/${restaurantId}`)} accessibilityRole="button">
                <AddMoreRow>
                  <Icon name="add-circle-outline" sf="plus.circle" size={18} color="brand" />
                  <Text variant="caption" color="brand">
                    Adicionar mais itens
                  </Text>
                </AddMoreRow>
              </Pressable>
            ) : null}
          </View>

          <View>
            <SectionLabel>Cupão</SectionLabel>
            {couponCode ? (
              <Card>
                <Text variant="bodyStrong" color="brand">
                  {couponCode} aplicado — {discountPercent}% de desconto
                </Text>
              </Card>
            ) : (
              <View>
                <CouponRow>
                  <CouponField>
                    <TextField
                      value={couponInput}
                      onChangeText={setCouponInput}
                      placeholder="Ex: COMETA10"
                      autoCapitalize="characters"
                      error={couponError ?? undefined}
                    />
                  </CouponField>
                  <Button variant="outline" disabled={!couponInput.trim()} onPress={handleApplyCoupon}>
                    Aplicar
                  </Button>
                </CouponRow>
              </View>
            )}
          </View>

          <View>
            <SectionLabel>Gorjeta</SectionLabel>
            <PillSection>
              <PillRow>
                <Icon name="heart-outline" sf="heart" size={18} color="brand" />
                <Text variant="bodyStrong">Para o entregador</Text>
              </PillRow>
              <TipChipRow>
                {TIP_PRESETS.map((preset) => (
                  <Pressable key={preset} onPress={() => setTipPercent(preset)} accessibilityRole="button">
                    <TipPill selected={tipPercent === preset}>
                      <Text variant="caption" color={tipPercent === preset ? 'onBrand' : 'primary'}>
                        {tipAmountLabel(preset, subtotal)}
                      </Text>
                    </TipPill>
                  </Pressable>
                ))}
              </TipChipRow>
            </PillSection>
          </View>

          <View>
            <SectionLabel>Observação</SectionLabel>
            <TextField value={notes} onChangeText={setNotes} placeholder="Ex: Tocar a campainha" multiline />
          </View>

          <View>
            <SectionLabel>Resumo</SectionLabel>
            <OrderSummaryCard summary={summary} />
          </View>
        </Content>
      </ScrollView>
      <BottomBar bottomInset={insets.bottom}>
        <Button variant="primary" size="lg" shape="pill" onPress={() => router.push('/delivery-type')}>
          Continuar
        </Button>
      </BottomBar>
    </Screen>
  );
}
