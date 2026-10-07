import styled from 'styled-components/native';
import type { DefaultTheme } from 'styled-components/native';
import { continuousCorners, ordersTextStyle } from '@/theme';
import type { BannerTone } from './StatusBanner';

const tint = (theme: DefaultTheme, tone: BannerTone) => theme.colors.status[tone];

export const Container = styled.View<{ tone: BannerTone }>`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[8]}px;
  padding: ${({ theme }) => theme.spacing[12]}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  ${continuousCorners}
  background-color: ${({ theme, tone }) => tint(theme, tone).bg};
`;

export const Body = styled.View`
  flex: 1;
  gap: 2px;
`;

export const Title = styled.Text<{ tone: BannerTone }>`
  ${ordersTextStyle('merchantName')}
  color: ${({ theme, tone }) => tint(theme, tone).fg};
`;

export const Message = styled.Text`
  ${ordersTextStyle('caption')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;
