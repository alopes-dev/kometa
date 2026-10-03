import styled from 'styled-components/native';
import { productTextStyle } from '@/theme';

/** `Título e preço` — name, price, description, attributes, in board order. */
export const Header = styled.View`
  gap: ${({ theme }) => theme.product.metrics.titleGap}px;
`;

export const PriceRow = styled.View`
  flex-direction: row;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
`;

/** The green line directly under the name — the board's second reading. */
export const Price = styled.Text`
  ${productTextStyle('price')}
  color: ${({ theme }) => theme.colors.text.brand};
`;

/** What the product used to cost, struck through beside the new price. */
export const PreviousPrice = styled.Text`
  ${productTextStyle('previousPrice')}
  color: ${({ theme }) => theme.colors.text.muted};
  text-decoration-line: line-through;
`;

export const Description = styled.Text`
  ${productTextStyle('description')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

/** `Coca-Cola · 1,5 L · Disponível` — facts, not controls. */
export const Attributes = styled.View`
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.product.metrics.attributeGap}px;
  margin-top: 4px;
`;

export const Attribute = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
`;

export const AttributeValue = styled.Text<{ positive: boolean }>`
  ${productTextStyle('attribute')}
  color: ${({ theme, positive }) =>
    positive ? theme.colors.text.success : theme.colors.text.secondary};
`;

export const Notices = styled.View`
  gap: 8px;
  margin-top: 4px;
`;

/** The meta line an unavailable product keeps — where it is, when to look again. */
export const Meta = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.product.metrics.attributeGap}px;
  flex-wrap: wrap;
`;

export const Explainer = styled.Text`
  ${productTextStyle('optionNote')}
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 2px;
`;
