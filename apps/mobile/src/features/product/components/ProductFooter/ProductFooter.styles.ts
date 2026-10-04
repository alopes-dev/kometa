import styled from 'styled-components/native';
import { continuousCorners, productTextStyle } from '@/theme';

/**
 * `Rodapé` — boards 03, 04 and 06. Pinned, so the sum and the action stay
 * reachable however long the list of choices runs.
 *
 * It casts its shadow upward: it sits over scrolling content and has to read
 * as a surface above it, not a band painted on the page.
 */
export const Bar = styled.View<{ bottomInset: number }>`
  background-color: ${({ theme }) => theme.colors.background.primary};
  padding-horizontal: ${({ theme }) => theme.product.metrics.footerPaddingHorizontal}px;
  padding-top: ${({ theme }) => theme.product.metrics.footerPaddingTop}px;
  padding-bottom: ${({ theme, bottomInset }) =>
    theme.product.metrics.footerPaddingBottom + bottomInset}px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border.subtle};
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0px ${({ theme }) => theme.product.footerShadow.offsetY}px;
  shadow-opacity: ${({ theme }) => theme.product.footerShadow.opacity};
  shadow-radius: ${({ theme }) => theme.product.footerShadow.radius}px;
  elevation: ${({ theme }) => theme.product.footerShadow.elevation};
`;

/** The sum, spelled out: what it is made of on the left, what it comes to on the right. */
export const SummaryRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.product.metrics.optionGap}px;
  margin-bottom: ${({ theme }) => theme.product.metrics.footerRowGap}px;
`;

export const Breakdown = styled.Text`
  ${productTextStyle('breakdown')}
  flex: 1;
  color: ${({ theme }) => theme.colors.text.muted};
`;

export const Total = styled.Text`
  ${productTextStyle('footerTotal')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

/**
 * 54pt, the height board 01 fixes for the primary CTA. `needsChoices` and
 * `unavailable` share the muted fill: neither is an action yet, and drawing
 * one of them green would promise a press that does not add anything.
 */
export const Cta = styled.View<{ enabled: boolean }>`
  height: ${({ theme }) => theme.product.metrics.ctaHeight}px;
  border-radius: ${({ theme }) => theme.product.metrics.ctaRadius}px;
  ${continuousCorners}
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, enabled }) =>
    enabled ? theme.colors.brand.base : theme.colors.surface.disabled};
`;

export const CtaLabel = styled.Text<{ enabled: boolean }>`
  ${productTextStyle('actionLabel')}
  text-align: center;
  color: ${({ theme, enabled }) =>
    enabled ? theme.colors.text.onBrand : theme.colors.text.disabled};
`;

/**
 * `Carrinho` — board 03 A·03. What the cart holds now, directly above the
 * action that put it there, so the confirmation and its cause are read
 * together rather than in two corners of the screen.
 */
export const CartBar = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding-horizontal: 14px;
  border-radius: ${({ theme }) => theme.product.metrics.ctaRadius}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.brand.subtle};
  margin-bottom: ${({ theme }) => theme.product.metrics.footerRowGap}px;
`;

export const CartBarLabel = styled.Text`
  ${productTextStyle('actionLabel')}
  flex: 1;
  color: ${({ theme }) => theme.colors.text.brand};
`;
