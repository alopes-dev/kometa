import styled from 'styled-components/native';
import { checkoutTextStyle, continuousCorners } from '@/theme';

/**
 * Board 03 · Delivery and Payment: `selected · default · unavailable ·
 * loading`. One row serves the address list, the payment list and the review's
 * summary rows, because the boards draw them at identical geometry — the only
 * differences are the glyph, the trailing mark and the state.
 */
export type RowState = 'default' | 'selected' | 'unavailable' | 'loading';

export const Container = styled.View<{ state: RowState }>`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.checkout.metrics.rowGap}px;
  min-height: ${({ theme }) => theme.checkout.metrics.rowMinHeight}px;
  padding: ${({ theme }) => theme.checkout.metrics.rowPadding}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.rowRadius}px;
  ${continuousCorners}
  border-width: 1px;
  background-color: ${({ theme, state }) =>
    state === 'selected' ? theme.colors.status.success.bg : theme.colors.background.secondary};
  border-color: ${({ theme, state }) =>
    state === 'selected' ? theme.colors.brand.base : theme.colors.border.subtle};
`;

export const Copy = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing[2]}px;
`;

export const Title = styled.Text<{ state: RowState }>`
  ${checkoutTextStyle('rowTitle')}
  color: ${({ theme, state }) =>
    state === 'unavailable' ? theme.colors.text.muted : theme.colors.text.primary};
`;

export const Subtitle = styled.Text<{ state: RowState }>`
  ${checkoutTextStyle('rowSubtitle')}
  color: ${({ theme, state }) =>
    state === 'unavailable' ? theme.colors.text.disabled : theme.colors.text.secondary};
`;
