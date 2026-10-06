import styled from 'styled-components/native';
import { checkoutTextStyle, continuousCorners } from '@/theme';

export const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

export const Body = styled.View`
  gap: ${({ theme }) => theme.checkout.metrics.bodyGap}px;
  padding-horizontal: ${({ theme }) => theme.checkout.metrics.bodyPaddingH}px;
  padding-top: ${({ theme }) => theme.checkout.metrics.bodyPaddingTop}px;
  padding-bottom: ${({ theme }) => theme.checkout.metrics.bodyPaddingBottom}px;
`;

/** The cart list, separated by hairlines rather than boxed into a card. */
export const List = styled.View``;

export const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.subtle};
`;

export const PreviousPrice = styled.Text`
  ${checkoutTextStyle('rowSubtitle')}
  color: ${({ theme }) => theme.colors.text.muted};
  text-decoration-line: line-through;
`;

export { continuousCorners };
