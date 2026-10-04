import styled from 'styled-components/native';
import { productTextStyle } from '@/theme';

/**
 * `Ingredientes`, `Alergénios`, `Peso aproximado` — board 06. A plain
 * separated list rather than cards: these are reference, and giving them the
 * same weight as a group card would make them compete with the choices.
 */
export const List = styled.View`
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border.subtle};
`;

export const Row = styled.View`
  min-height: 48px;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.product.metrics.optionGap}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border.subtle};
`;

export const Label = styled.Text`
  ${productTextStyle('optionLabel')}
  flex: 1;
  color: ${({ theme }) => theme.colors.text.primary};
`;

/** The value the row carries while closed — "7 itens", "650 g". */
export const Summary = styled.Text`
  ${productTextStyle('optionNote')}
  color: ${({ theme }) => theme.colors.text.muted};
`;

export const Body = styled.Text`
  ${productTextStyle('description')}
  color: ${({ theme }) => theme.colors.text.secondary};
  padding-bottom: 14px;
`;
