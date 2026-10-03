import styled from 'styled-components/native';
import { productTextStyle, textStyle } from '@/theme';

export const Container = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[8]}px;
  background-color: ${({ theme }) => theme.colors.brand.subtle};
  border-radius: ${({ theme }) => theme.radius.full}px;
  padding: ${({ theme }) => theme.spacing[4]}px;
`;

export const StepButton = styled.View<{ variant: 'decrement' | 'increment' }>`
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, variant }) =>
    variant === 'increment' ? theme.colors.brand.base : theme.colors.surface.primary};
`;

export const Value = styled.Text`
  min-width: 20px;
  text-align: center;
  ${textStyle('bodyStrong')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

/**
 * `Quantidade` — board 64:2470. The control that sits at the right of its
 * own row rather than beside the CTA: a bare minus, the value, and a filled
 * circle for plus.
 *
 * A third variant rather than a reshaped `panel`, because `panel` is still
 * what the retired board draws and `pill` is what the cart row uses; the
 * three differ in shape, not only in size.
 */
export const InlineContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.product.metrics.stepperGap}px;
`;

/**
 * The plus is a filled brand circle and the minus is not: board 02 gives
 * the additive action the accent so it reads first. Disabled drops both to
 * the muted surface — a cap the customer can see before they press.
 */
export const InlineButton = styled.View<{ accent: boolean; disabled: boolean }>`
  width: ${({ theme }) => theme.product.metrics.stepperButtonSize}px;
  height: ${({ theme }) => theme.product.metrics.stepperButtonSize}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, accent, disabled }) =>
    disabled
      ? theme.colors.surface.disabled
      : accent
        ? theme.colors.brand.base
        : theme.colors.background.secondary};
`;

export const InlineSign = styled.Text<{ onAccent: boolean; disabled: boolean }>`
  ${productTextStyle('stepperSign')}
  line-height: ${({ theme }) => theme.product.metrics.stepperButtonSize}px;
  color: ${({ theme, onAccent, disabled }) =>
    disabled
      ? theme.colors.text.disabled
      : onAccent
        ? theme.colors.text.onBrand
        : theme.colors.text.primary};
`;

export const InlineValue = styled.Text`
  min-width: 24px;
  text-align: center;
  ${productTextStyle('stepperValue')}
  color: ${({ theme }) => theme.colors.text.primary};
`;
