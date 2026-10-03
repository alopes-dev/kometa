import styled from 'styled-components/native';
import { productTextStyle } from '@/theme';

/** `Quantidade` — board 02: the label holds the left, the control the right. */
export const Row = styled.View`
  min-height: ${({ theme }) => theme.product.metrics.quantityHeight}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.product.metrics.optionGap}px;
`;

export const Labels = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.product.metrics.cardHeaderGap}px;
`;

/** `Máximo disponível: 3` — present only where a cap exists. */
export const Limit = styled.Text`
  ${productTextStyle('optionNote')}
  color: ${({ theme }) => theme.colors.text.muted};
`;
