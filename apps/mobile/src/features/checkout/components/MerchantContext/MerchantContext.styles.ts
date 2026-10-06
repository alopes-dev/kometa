import styled from 'styled-components/native';
import { Image } from 'expo-image';
import { checkoutTextStyle, continuousCorners } from '@/theme';

/**
 * Board 04 · 01, "Contexto persistente": the merchant, the locality and the
 * ETA, stated once and never competing with the action.
 */
export const Card = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.checkout.metrics.itemGap}px;
  padding: ${({ theme }) => theme.checkout.metrics.merchantPadding}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.merchantRadius}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

export const Thumbnail = styled(Image)`
  width: ${({ theme }) => theme.checkout.metrics.merchantImage}px;
  height: ${({ theme }) => theme.checkout.metrics.merchantImage}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.merchantImageRadius}px;
  background-color: ${({ theme }) => theme.colors.media.placeholder};
`;

export const Details = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing[2]}px;
`;

export const Name = styled.Text`
  ${checkoutTextStyle('merchantName')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Meta = styled.Text`
  ${checkoutTextStyle('merchantMeta')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Chip = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing[8]}px;
  padding-vertical: ${({ theme }) => theme.spacing[6]}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

export const ChipLabel = styled.Text`
  ${checkoutTextStyle('chip')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;
