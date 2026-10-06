import styled from 'styled-components/native';
import { checkoutTextStyle, continuousCorners } from '@/theme';

/**
 * Board 03 · Summary: `default · discounted · free delivery · dynamic
 * delivery`. Four lines and nothing else — board 19 · 05 asks that the
 * customer be able to verify the total from what is on screen.
 */
export const Card = styled.View`
  gap: ${({ theme }) => theme.checkout.metrics.summaryGap}px;
  padding: ${({ theme }) => theme.checkout.metrics.summaryPadding}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.summaryRadius}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[12]}px;
`;

export const Label = styled.Text`
  ${checkoutTextStyle('summaryLabel')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Value = styled.Text<{ accent?: boolean }>`
  ${checkoutTextStyle('summaryValue')}
  color: ${({ theme, accent }) => (accent ? theme.colors.text.brand : theme.colors.text.primary)};
`;

export const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.subtle};
`;

export const TotalRow = styled.View`
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[12]}px;
`;

export const TotalLabel = styled.Text`
  ${checkoutTextStyle('totalLabel')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const TotalValue = styled.Text`
  ${checkoutTextStyle('totalValue')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

/** The sentence under a dynamic fee — board 09 never leaves the cause unsaid. */
export const Note = styled.Text`
  ${checkoutTextStyle('progressNote')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;
