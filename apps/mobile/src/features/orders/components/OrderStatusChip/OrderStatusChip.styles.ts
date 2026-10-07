import styled from 'styled-components/native';
import type { DefaultTheme } from 'styled-components/native';
import { continuousCorners, ordersTextStyle } from '@/theme';
import type { ChipTone } from './OrderStatusChip';

/**
 * Board 03's three tones, resolved from the semantic ramp. The board's
 * #1BAC4B green reaches the chip through `status.success`, never frozen here.
 */
const background = (theme: DefaultTheme, tone: ChipTone) =>
  tone === 'failed'
    ? theme.colors.status.error.bg
    : tone === 'active'
      ? theme.colors.status.success.bg
      : theme.colors.background.secondary;

const foreground = (theme: DefaultTheme, tone: ChipTone) =>
  tone === 'failed'
    ? theme.colors.status.error.fg
    : tone === 'active'
      ? theme.colors.status.success.fg
      : theme.colors.text.secondary;

export const Container = styled.View<{ tone: ChipTone }>`
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  gap: ${({ theme }) => theme.spacing[6]}px;
  height: 26px;
  padding-horizontal: ${({ theme }) => theme.spacing[8]}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  ${continuousCorners}
  background-color: ${({ theme, tone }) => background(theme, tone)};
`;

export const Label = styled.Text<{ tone: ChipTone }>`
  ${ordersTextStyle('chip')}
  color: ${({ theme, tone }) => foreground(theme, tone)};
`;
