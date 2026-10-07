import styled from 'styled-components/native';
import { continuousCorners, ordersTextStyle } from '@/theme';

export const Card = styled.View`
  gap: ${({ theme }) => theme.spacing[12]}px;
  padding: ${({ theme }) => theme.orders.metrics.cardPadding}px;
  border-radius: ${({ theme }) => theme.orders.metrics.cardRadius}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

export const Head = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[12]}px;
`;

export const Portrait = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.status.success.bg};
`;

export const Info = styled.View`
  flex: 1;
  gap: 2px;
`;

export const Name = styled.Text`
  ${ordersTextStyle('merchantName')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Meta = styled.Text`
  ${ordersTextStyle('rowMeta')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Rating = styled.Text`
  ${ordersTextStyle('rowMeta')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Actions = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[8]}px;
`;

export const ActionInner = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[6]}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  ${continuousCorners}
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border.subtle};
  background-color: ${({ theme }) => theme.colors.background.primary};
  padding-horizontal: ${({ theme }) => theme.spacing[12]}px;
  height: 100%;
`;

export const ActionLabel = styled.Text`
  ${ordersTextStyle('eta')}
  color: ${({ theme }) => theme.colors.text.primary};
`;
