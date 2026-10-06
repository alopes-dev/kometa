import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import { Icon } from '@/components/design-system/atoms';
import type { CtaContract } from '../../checkoutState';
import {
  Band,
  Button,
  Label,
  SecondaryButton,
  SecondaryLabel,
  SecondaryRow,
} from './CheckoutAction.styles';

export type CheckoutActionProps = {
  contract: CtaContract;
  onPress: () => void;
  /** Rendered above the button — a banner, or the pair of secondary actions. */
  children?: ReactNode;
  secondary?: { label: string; onPress: () => void; destructive?: boolean }[];
};

/**
 * The bottom band every screen in the path ends with.
 *
 * It renders a contract rather than a set of props, so the seven states board
 * 14 draws are decided in one place — `deriveCtaContract` — and the button
 * cannot say "Pagar" on a screen whose cart is blocked. The band owns the safe
 * area so the action is never under the home indicator (board 19 · 06).
 *
 * The haptic fires on a press that will do something. Board 19 · 07 reserves
 * the success haptic for a confirmed order, which is why there is none here.
 */
export function CheckoutAction({ contract, onPress, children, secondary }: CheckoutActionProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    if (!contract.enabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <Band bottomInset={insets.bottom}>
      {children}
      {secondary && secondary.length > 0 ? (
        <SecondaryRow>
          {secondary.map((action) => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              accessibilityRole="button"
              style={({ pressed }) => ({ flex: 1, opacity: pressed ? theme.pressed.opacity : 1 })}
            >
              <SecondaryButton destructive={action.destructive}>
                <SecondaryLabel destructive={action.destructive}>{action.label}</SecondaryLabel>
              </SecondaryButton>
            </Pressable>
          ))}
        </SecondaryRow>
      ) : null}
      <Pressable
        onPress={handlePress}
        disabled={!contract.enabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: !contract.enabled, busy: contract.icon === 'spinner' }}
        accessibilityLabel={contract.label}
        style={({ pressed }) => ({
          opacity: pressed && contract.enabled ? theme.pressed.opacity : 1,
        })}
      >
        <Button tone={contract.tone}>
          {contract.icon === 'spinner' ? (
            <ActivityIndicator size="small" color={theme.colors.text.onBrand} />
          ) : null}
          {contract.icon === 'check' ? (
            <Icon name="checkmark" sf="checkmark" size={18} color="onBrand" />
          ) : null}
          <Label tone={contract.tone}>{contract.label}</Label>
        </Button>
      </Pressable>
    </Band>
  );
}
