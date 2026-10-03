import styled from 'styled-components/native';
import { continuousCorners, productTextStyle } from '@/theme';

/** `Ações` — pinned to the top of the hero, above the photograph and its scrim. */
export const Actions = styled.View<{ topInset: number }>`
  position: absolute;
  top: ${({ theme, topInset }) => topInset + theme.product.metrics.actionsTop}px;
  left: ${({ theme }) => theme.product.metrics.actionsInset}px;
  right: ${({ theme }) => theme.product.metrics.actionsInset}px;
  height: ${({ theme }) => theme.product.metrics.actionSize}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const ActionGroup = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.product.metrics.actionGap}px;
`;

/**
 * Casts the button's lift. Separate from the button itself because the
 * favourite control is the shared atom, which draws its own circle; this
 * wrapper gives all three the same lift without reaching inside any of them.
 */
export const ActionShadow = styled.View`
  width: ${({ theme }) => theme.product.metrics.actionSize}px;
  height: ${({ theme }) => theme.product.metrics.actionSize}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.background.primary};
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0px ${({ theme }) => theme.product.actionShadow.offsetY}px;
  shadow-opacity: ${({ theme }) => theme.product.actionShadow.opacity};
  shadow-radius: ${({ theme }) => theme.product.actionShadow.radius}px;
  elevation: ${({ theme }) => theme.product.actionShadow.elevation};
`;

/**
 * Opaque with a hairline, so the same button reads over the photograph and
 * over the solid header it collapses into, with no cross-fade between two
 * icon colours.
 */
export const ActionButton = styled.View`
  width: ${({ theme }) => theme.product.metrics.actionSize}px;
  height: ${({ theme }) => theme.product.metrics.actionSize}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border.subtle};
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

/**
 * The name, once the photograph has collapsed away. Inset past the buttons on
 * both sides so a long name truncates instead of running under them.
 */
export const CompactTitleWrapper = styled.View<{ topInset: number }>`
  position: absolute;
  top: ${({ theme, topInset }) => topInset + theme.product.metrics.actionsTop}px;
  left: 70px;
  right: 110px;
  height: ${({ theme }) => theme.product.metrics.actionSize}px;
  align-items: center;
  justify-content: center;
`;

/**
 * `Temporariamente indisponível` over the photograph — board 05. Bottom-left
 * so it sits on the image without covering the product, and opaque enough to
 * read over any photograph.
 */
export const UnavailableOverlay = styled.View`
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 6px 12px;
  border-top-right-radius: ${({ theme }) => theme.radius.md}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.overlay.scrimTo};
`;

export const UnavailableLabel = styled.Text`
  ${productTextStyle('optionNote')}
  color: ${({ theme }) => theme.colors.text.onMedia};
`;
