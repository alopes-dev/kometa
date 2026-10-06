import styled from 'styled-components/native';
import { checkoutTextStyle, continuousCorners } from '@/theme';

/** The navigation bar every board in the path draws, at `min-height 56`. */
export const Bar = styled.View<{ topInset: number }>`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.checkout.metrics.navGap}px;
  min-height: ${({ theme }) => theme.checkout.metrics.navMinHeight}px;
  padding-horizontal: ${({ theme }) => theme.checkout.metrics.navPaddingH}px;
  padding-top: ${({ theme, topInset }) => topInset + theme.checkout.metrics.navPaddingV}px;
  padding-bottom: ${({ theme }) => theme.checkout.metrics.navPaddingV}px;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

export const Back = styled.View`
  width: ${({ theme }) => theme.checkout.metrics.backSize}px;
  height: ${({ theme }) => theme.checkout.metrics.backSize}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.backSize / 2}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

/**
 * Balances the back button so the title stays optically centred on a screen
 * with no trailing action — board 08 draws it as an invisible 40pt spacer.
 */
export const ActionSpacer = styled.View`
  width: ${({ theme }) => theme.checkout.metrics.backSize}px;
`;

export const Titles = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing[2]}px;
`;

export const Title = styled.Text`
  ${checkoutTextStyle('screenTitle')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Caption = styled.Text`
  ${checkoutTextStyle('screenCaption')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Action = styled.Text`
  ${checkoutTextStyle('navAction')}
  color: ${({ theme }) => theme.colors.text.brand};
`;

export const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.subtle};
`;

export { continuousCorners };
