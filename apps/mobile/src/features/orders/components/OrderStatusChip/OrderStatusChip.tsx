import { View } from 'react-native';
import type { Ionicons } from '@expo/vector-icons';
import type { SFSymbol } from 'expo-symbols';
import { Icon } from '@/components/design-system/atoms';
import { stageCopy } from '../../stages';
import type { OrderStage } from '../../types';
import { Container, Label } from './OrderStatusChip.styles';

/**
 * The state chip board 03 draws for each of the eleven stages.
 *
 * Three tones, not eleven. Board 03 paints everything in flight green,
 * `Pendente` and `Entregue` grey, and only `Cancelado` red — and board 14
 * states the rule behind it: "O resultado concluído volta a uma paleta
 * neutra", with red reserved for the final destructive outcome. A delivered
 * order is history, not a success banner.
 *
 * The design system's `StatusChip` atom is deliberately NOT reused here: it is
 * keyed to `theme.colors.delivery`, an eight-tone palette that paints
 * `preparing` amber and `delivered` green, which contradicts both boards.
 */
export type ChipTone = 'neutral' | 'active' | 'failed';

export function chipTone(stage: OrderStage): ChipTone {
  if (stage === 'cancelled') return 'failed';
  if (stage === 'pending' || stage === 'delivered') return 'neutral';
  return 'active';
}

const ICONS: Record<OrderStage, { name: keyof typeof Ionicons.glyphMap; sf: SFSymbol }> = {
  pending: { name: 'time-outline', sf: 'clock' },
  confirmed: { name: 'checkmark-circle-outline', sf: 'checkmark.circle' },
  preparing: { name: 'restaurant-outline', sf: 'fork.knife' },
  ready: { name: 'bag-check-outline', sf: 'checkmark.seal' },
  assigned: { name: 'person-outline', sf: 'person' },
  'picked-up': { name: 'cube-outline', sf: 'shippingbox' },
  transit: { name: 'bicycle-outline', sf: 'bicycle' },
  arriving: { name: 'navigate-outline', sf: 'location.fill' },
  arrived: { name: 'location-outline', sf: 'mappin.and.ellipse' },
  delivered: { name: 'checkmark-done-outline', sf: 'checkmark.circle.fill' },
  cancelled: { name: 'close-circle-outline', sf: 'xmark.circle' },
};

const ICON_COLOR = { neutral: 'secondary', active: 'success', failed: 'error' } as const;

export type OrderStatusChipProps = { stage: OrderStage };

export function OrderStatusChip({ stage }: OrderStatusChipProps) {
  const tone = chipTone(stage);
  const label = stageCopy(stage);
  const icon = ICONS[stage];

  return (
    <Container tone={tone} accessibilityRole="text" accessibilityLabel={`Estado: ${label}`}>
      {/*
        Board 10's "Redundância visual": the icon is what keeps the state
        readable without colour, so it is never optional.
      */}
      <View testID="order-status-chip-icon">
        <Icon name={icon.name} sf={icon.sf} size={13} color={ICON_COLOR[tone]} />
      </View>
      <Label tone={tone}>{label}</Label>
    </Container>
  );
}
