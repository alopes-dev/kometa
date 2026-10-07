import styled from 'styled-components/native';
import { continuousCorners, ordersTextStyle } from '@/theme';

export const Card = styled.View`
  gap: ${({ theme }) => theme.spacing[12]}px;
  padding: ${({ theme }) => theme.orders.metrics.cardPadding}px;
  border-radius: ${({ theme }) => theme.orders.metrics.cardRadius}px;
  ${continuousCorners}
  /* Board 05 outlines the active card in the brand green; the history rows
     have no outline, which is what marks this one as live. */
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.brand.base};
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

export const TopRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[12]}px;
`;

export const Info = styled.View`
  flex: 1;
  gap: 2px;
`;

export const Merchant = styled.Text`
  ${ordersTextStyle('merchantName')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Eta = styled.Text`
  ${ordersTextStyle('eta')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Total = styled.Text`
  ${ordersTextStyle('merchantName')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ChipRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[8]}px;
  flex-wrap: wrap;
`;
