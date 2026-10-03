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
 * `Quantidade` — node 48:20724 of the product board.
 *
 * A wider, flatter control than the pill above: it sits beside the add-to-cart
 * button and has to match its 54px height and 16px radius, which is why this
 * is a variant rather than a second component.
 */
export const PanelContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.product.metrics.stepperGap}px;
  height: ${({ theme }) => theme.product.metrics.controlHeight}px;
  padding-horizontal: ${({ theme }) => theme.product.metrics.stepperPaddingHorizontal}px;
  border-radius: ${({ theme }) => theme.product.metrics.controlRadius}px;
  border-curve: continuous;
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

/**
 * `Menos` / `Mais` — nodes 48:20725, 48:20727. Glyphs rather than icons,
 * because that is what the board draws: a 22px minus and plus set in the text
 * face, the plus carrying the accent so the additive action is the one that
 * reads first.
 */
export const PanelSign = styled.Text<{ accent?: boolean }>`
  ${productTextStyle('stepperSign')}
  color: ${({ theme, accent }) => (accent ? theme.colors.brand.base : theme.colors.text.primary)};
`;

/** `Valor` — node 48:20726. */
export const PanelValue = styled.Text`
  min-width: 12px;
  text-align: center;
  ${productTextStyle('stepperValue')}
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
