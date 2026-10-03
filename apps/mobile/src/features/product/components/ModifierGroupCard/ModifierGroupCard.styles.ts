import styled from 'styled-components/native';
import { continuousCorners, productTextStyle } from '@/theme';

/**
 * `Grupo` — board 02. A bordered card, not a bare stack: the border is what
 * tells one set of choices from the next when several sit in a column.
 *
 * The error state swaps the hairline for the brand tint rather than red.
 * Board 04 draws validation in green with an ⓘ — an unanswered question is
 * not a failure, and red is kept for the ones that are.
 */
export const Card = styled.View<{ hasError: boolean }>`
  border-width: 1px;
  border-color: ${({ theme, hasError }) =>
    hasError ? theme.colors.brand.graphic : theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.product.metrics.cardRadius}px;
  ${continuousCorners}
  padding: ${({ theme }) => theme.product.metrics.cardPadding}px;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.product.metrics.optionGap}px;
`;

export const Heading = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.product.metrics.cardHeaderGap}px;
`;

/** `Escolha 1 · obrigatório` — what the group asks for, under its title. */
export const Subtitle = styled.Text`
  ${productTextStyle('groupSubtitle')}
  color: ${({ theme }) => theme.colors.text.muted};
`;

/** `2/3` — shown only where a cap exists to count against. */
export const Counter = styled.Text`
  ${productTextStyle('groupCounter')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Options = styled.View`
  margin-top: ${({ theme }) => theme.product.metrics.cardHeaderGap + 8}px;
`;

export const ErrorRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
`;

/**
 * The outline never stands alone — board 07: "Verde comunica acção, mas
 * nunca é o único indicador". The sentence is the indicator; the tint is
 * only how it is found.
 */
export const ErrorText = styled.Text`
  ${productTextStyle('groupError')}
  color: ${({ theme }) => theme.colors.text.brand};
`;
