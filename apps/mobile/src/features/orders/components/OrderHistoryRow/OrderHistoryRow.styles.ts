import styled from 'styled-components/native';
import { continuousCorners, ordersTextStyle } from '@/theme';

export const Row = styled.View`
  gap: ${({ theme }) => theme.spacing[8]}px;
  padding: ${({ theme }) => theme.orders.metrics.cardPadding}px;
  border-radius: ${({ theme }) => theme.orders.metrics.cardRadius}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.secondary};
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

export const Meta = styled.Text`
  ${ordersTextStyle('rowMeta')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Total = styled.Text`
  ${ordersTextStyle('merchantName')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const BottomRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[8]}px;
`;

export const OrderId = styled.Text`
  ${ordersTextStyle('orderNumber')}
  color: ${({ theme }) => theme.colors.text.muted};
`;
