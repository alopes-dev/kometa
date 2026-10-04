import styled from 'styled-components/native';
import { continuousCorners, productTextStyle } from '@/theme';

/**
 * `Marca / Apresentação / Disponibilidade` — board 06, the health variant.
 *
 * A panel of labelled rows rather than the inline chip row: a pharmacy fact
 * is useless without the word that names it. "Genérico" alone says nothing.
 */
export const Panel = styled.View`
  border-radius: ${({ theme }) => theme.radius.md}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.secondary};
  padding-horizontal: 14px;
`;

export const Row = styled.View<{ last: boolean }>`
  min-height: 40px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.product.metrics.optionGap}px;
  border-bottom-width: ${({ last }) => (last ? 0 : 1)}px;
  border-bottom-color: ${({ theme }) => theme.colors.border.subtle};
`;

export const Label = styled.Text`
  ${productTextStyle('attribute')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Value = styled.Text<{ positive: boolean }>`
  ${productTextStyle('groupCounter')}
  flex-shrink: 1;
  text-align: right;
  color: ${({ theme, positive }) =>
    positive ? theme.colors.text.success : theme.colors.text.primary};
`;
