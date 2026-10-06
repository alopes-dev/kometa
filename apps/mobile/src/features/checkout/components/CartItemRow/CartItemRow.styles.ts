import styled from 'styled-components/native';
import { Image } from 'expo-image';
import { checkoutTextStyle, continuousCorners } from '@/theme';

/** Board 03 · Cart Item: `default · editing · unavailable · updating`. */
export type LineState = 'default' | 'editing' | 'unavailable' | 'updating';

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.checkout.metrics.itemGap}px;
  padding-vertical: ${({ theme }) => theme.checkout.metrics.itemPaddingV}px;
`;

export const Thumbnail = styled(Image)<{ dimmed: boolean }>`
  width: ${({ theme }) => theme.checkout.metrics.itemImage}px;
  height: ${({ theme }) => theme.checkout.metrics.itemImage}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.itemImageRadius}px;
  background-color: ${({ theme }) => theme.colors.media.placeholder};
  opacity: ${({ dimmed, theme }) => (dimmed ? theme.opacity[40] : 1)};
`;

export const Details = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.checkout.metrics.itemDetailsGap}px;
`;

export const Heading = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[8]}px;
`;

export const Name = styled.Text<{ state: LineState }>`
  ${checkoutTextStyle('itemName')}
  flex: 1;
  color: ${({ theme, state }) =>
    state === 'unavailable' ? theme.colors.text.muted : theme.colors.text.primary};
`;

export const Price = styled.Text<{ state: LineState }>`
  ${checkoutTextStyle('itemPrice')}
  color: ${({ theme, state }) =>
    state === 'unavailable' ? theme.colors.text.muted : theme.colors.text.primary};
`;

export const Options = styled.Text<{ state: LineState }>`
  ${checkoutTextStyle('itemOptions')}
  color: ${({ theme, state }) =>
    state === 'unavailable' ? theme.colors.text.disabled : theme.colors.text.secondary};
`;

export const Controls = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[8]}px;
`;

export const ActionLabel = styled.Text<{ state: LineState }>`
  ${checkoutTextStyle('itemAction')}
  color: ${({ theme, state }) =>
    state === 'editing'
      ? theme.colors.text.brand
      : state === 'unavailable'
        ? theme.colors.text.disabled
        : theme.colors.text.secondary};
`;

export const Stepper = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.checkout.metrics.stepperGap}px;
  padding: ${({ theme }) => theme.checkout.metrics.stepperPadding}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

export const Quantity = styled.Text`
  ${checkoutTextStyle('stepperValue')}
  min-width: 14px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.subtle};
`;

export { continuousCorners };
