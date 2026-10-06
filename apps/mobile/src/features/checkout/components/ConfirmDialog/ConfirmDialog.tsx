import { Modal, Pressable } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Icon, type IconProps } from '@/components/design-system/atoms';
import { checkoutTextStyle, continuousCorners, textStyle } from '@/theme';

const Backdrop = styled.View`
  flex: 1;
  justify-content: flex-end;
  background-color: ${({ theme }) => theme.colors.overlay.backdrop};
`;

const Sheet = styled.View<{ bottomInset: number }>`
  gap: ${({ theme }) => theme.spacing[12]}px;
  padding: ${({ theme }) => theme.spacing[24]}px;
  padding-bottom: ${({ theme, bottomInset }) => bottomInset + theme.spacing[24]}px;
  border-top-left-radius: ${({ theme }) => theme.radius.xxl}px;
  border-top-right-radius: ${({ theme }) => theme.radius.xxl}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const Badge = styled.View<{ destructive: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  ${continuousCorners}
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, destructive }) =>
    destructive ? theme.colors.status.error.bg : theme.colors.status.warning.bg};
`;

const Title = styled.Text`
  ${textStyle('h4')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Body = styled.Text`
  ${checkoutTextStyle('stateBody')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Primary = styled.View<{ destructive: boolean }>`
  height: ${({ theme }) => theme.checkout.metrics.ctaHeight}px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.checkout.metrics.ctaRadius}px;
  ${continuousCorners}
  background-color: ${({ theme, destructive }) =>
    destructive ? theme.colors.status.error.fill : theme.colors.brand.base};
`;

const PrimaryLabel = styled.Text`
  ${checkoutTextStyle('actionLabel')}
  color: ${({ theme }) => theme.colors.text.onBrand};
`;

const Dismiss = styled.View`
  min-height: ${({ theme }) => theme.layout.minHitTarget}px;
  align-items: center;
  justify-content: center;
`;

const DismissLabel = styled.Text`
  ${checkoutTextStyle('secondaryActionLabel')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  dismissLabel: string;
  destructive?: boolean;
  icon?: Pick<IconProps, 'name' | 'sf'>;
  onConfirm: () => void;
  onDismiss: () => void;
};

/**
 * The confirmation boards 06 and 15 draw: removing a line, and replacing a
 * cart that belongs to another merchant.
 *
 * Both answers are given equal reachability — the destructive one is coloured,
 * not hidden, and the way out is a full-width target rather than a corner X.
 * Board 19's "conflito exige confirmação explícita" is about the choice being
 * real, which it is not if one answer is harder to hit than the other.
 */
export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  dismissLabel,
  destructive = false,
  icon,
  onConfirm,
  onDismiss,
}: ConfirmDialogProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable
        style={{ flex: 1 }}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Fechar"
      >
        <Backdrop>
          <Pressable onPress={() => {}} accessible={false}>
            <Sheet bottomInset={theme.spacing[8]}>
              <Badge destructive={destructive}>
                <Icon
                  name={icon?.name ?? (destructive ? 'trash-outline' : 'warning-outline')}
                  sf={icon?.sf ?? (destructive ? 'trash' : 'exclamationmark.triangle')}
                  size={20}
                  color={destructive ? 'error' : 'warning'}
                />
              </Badge>
              <Title>{title}</Title>
              <Body>{body}</Body>
              <Pressable onPress={onConfirm} accessibilityRole="button">
                <Primary destructive={destructive}>
                  <PrimaryLabel>{confirmLabel}</PrimaryLabel>
                </Primary>
              </Pressable>
              <Pressable onPress={onDismiss} accessibilityRole="button">
                <Dismiss>
                  <DismissLabel>{dismissLabel}</DismissLabel>
                </Dismiss>
              </Pressable>
            </Sheet>
          </Pressable>
        </Backdrop>
      </Pressable>
    </Modal>
  );
}
