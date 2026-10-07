import styled from 'styled-components/native';
import { continuousCorners, ordersTextStyle } from '@/theme';

export const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

export const Body = styled.View`
  gap: ${({ theme }) => theme.spacing[16]}px;
  padding-horizontal: ${({ theme }) => theme.orders.metrics.bodyPaddingH}px;
  padding-bottom: ${({ theme }) => theme.spacing[32]}px;
`;

export const HeadRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[12]}px;
`;

export const OrderTitle = styled.Text`
  ${ordersTextStyle('statusTitle')}
  color: ${({ theme }) => theme.colors.text.primary};
  flex: 1;
`;

export const Caption = styled.Text`
  ${ordersTextStyle('rowMeta')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Card = styled.View`
  gap: ${({ theme }) => theme.spacing[8]}px;
  padding: ${({ theme }) => theme.orders.metrics.cardPadding}px;
  border-radius: ${({ theme }) => theme.orders.metrics.cardRadius}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

export const CardTitle = styled.Text`
  ${ordersTextStyle('merchantName')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Line = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[12]}px;
`;

export const LineLabel = styled.Text<{ strong?: boolean; discount?: boolean }>`
  ${ordersTextStyle('rowMeta')}
  flex: 1;
  color: ${({ theme, strong, discount }) =>
    discount
      ? theme.colors.brand.base
      : strong
        ? theme.colors.text.primary
        : theme.colors.text.secondary};
`;

export const LineValue = styled.Text<{ strong?: boolean; discount?: boolean }>`
  ${ordersTextStyle('rowMeta')}
  color: ${({ theme, strong, discount }) =>
    discount ? theme.colors.brand.base : theme.colors.text.primary};
  font-family: ${({ theme, strong }) =>
    strong ? theme.orders.type.merchantName.fontFamily : theme.orders.type.rowMeta.fontFamily};
`;

export const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.subtle};
`;

export const DeliveryCard = styled(Card)`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[12]}px;
`;

export const DeliveryBody = styled.View`
  flex: 1;
  gap: 2px;
`;

export const DeliveryLabel = styled.Text`
  ${ordersTextStyle('chip')}
  color: ${({ theme }) => theme.colors.text.muted};
  letter-spacing: 0.6px;
`;

export const Actions = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[8]}px;
`;
