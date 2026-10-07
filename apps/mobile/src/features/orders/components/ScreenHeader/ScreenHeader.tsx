import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Icon } from '@/components/design-system/atoms';
import { ordersTextStyle } from '@/theme';

/**
 * The navigation bar every screen in the orders path shares.
 *
 * A near-twin of the checkout path's header, deliberately not reused: that one
 * reads `theme.checkout.metrics`, and an orders screen resolving its geometry
 * against the checkout board is precisely what the board-scoped token files
 * exist to make impossible.
 *
 * It owns the top safe area so no screen has to, and always renders something
 * in the trailing slot — the action or an invisible spacer — so the title does
 * not shift sideways between two steps of the same flow.
 */

const Bar = styled.View<{ topInset: number }>`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[8]}px;
  padding-top: ${({ theme, topInset }) => theme.spacing[8] + topInset}px;
  padding-horizontal: ${({ theme }) => theme.orders.metrics.bodyPaddingH}px;
  padding-bottom: ${({ theme }) => theme.spacing[8]}px;
`;

const Slot = styled.View`
  min-width: 56px;
  min-height: ${({ theme }) => theme.orders.metrics.touchTarget}px;
  justify-content: center;
`;

const Title = styled.Text`
  ${ordersTextStyle('merchantName')}
  flex: 1;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ActionLabel = styled.Text`
  ${ordersTextStyle('eta')}
  text-align: right;
  color: ${({ theme }) => theme.colors.brand.base};
`;

export type ScreenHeaderProps = {
  title: string;
  onBack: () => void;
  /** The trailing text action — `Ajuda`, `Fechar`. */
  action?: { label: string; onPress: () => void };
};

export function ScreenHeader({ title, onBack, action }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <Bar topInset={insets.top}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        hitSlop={8}
      >
        <Slot>
          <Icon name="chevron-back" sf="chevron.left" size={20} color="primary" />
        </Slot>
      </Pressable>

      <Title numberOfLines={1}>{title}</Title>

      {action ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          hitSlop={8}
        >
          <Slot>
            <ActionLabel>{action.label}</ActionLabel>
          </Slot>
        </Pressable>
      ) : (
        <Slot />
      )}
    </Bar>
  );
}
