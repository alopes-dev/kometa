import { css } from 'styled-components/native';
import type { ShadowLevel } from './shadows';

/**
 * Applies an elevation level from the theme.
 *
 * Reads both the geometry and the shadow color from the active scheme, so a
 * component never names a shadow color itself and dark mode can soften or
 * strengthen depth centrally.
 *
 *   const Card = styled.View`
 *     ${elevate('sm')}
 *   `;
 */
export const elevate = (level: ShadowLevel) => css`
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0px ${({ theme }) => theme.shadows[level].offsetY}px;
  shadow-opacity: ${({ theme }) => theme.shadows[level].opacity};
  shadow-radius: ${({ theme }) => theme.shadows[level].radius}px;
  elevation: ${({ theme }) => theme.shadows[level].elevation};
`;

/**
 * Applies a typography variant from the theme.
 *
 * Keeps every text style anchored to the ramp — the alternative is the
 * `font-size: 13px` literals that had accumulated across feature components.
 */
export const textStyle = (variant: keyof import('./typography').Typography) => css`
  font-family: ${({ theme }) => theme.typography[variant].fontFamily};
  font-size: ${({ theme }) => theme.typography[variant].fontSize}px;
  line-height: ${({ theme }) => theme.typography[variant].lineHeight}px;
  letter-spacing: ${({ theme }) => theme.typography[variant].letterSpacing}px;
`;

/**
 * Applies a step from a board-scoped type scale — see `theme/business.ts`.
 *
 * Separate from `textStyle` because those steps are the shared ramp, which a
 * component should reach for first; this one is for the sizes a single Figma
 * board sets that the ramp deliberately has no step for.
 */
export const boardTextStyle = (step: import('./business').BusinessTypeStep) => css`
  font-family: ${({ theme }) => theme.business.type[step].fontFamily};
  font-size: ${({ theme }) => theme.business.type[step].fontSize}px;
  ${({ theme }) => {
    const resolved = theme.business.type[step];
    return 'lineHeight' in resolved ? `line-height: ${resolved.lineHeight}px;` : '';
  }}
`;

/**
 * Applies a step from the product board's type scale — see `theme/product.ts`.
 *
 * A twin of `boardTextStyle` rather than a generalisation of it: each board
 * file transcribes its own board, and keeping the two accessors separate is
 * what makes `productTextStyle('price')` fail to compile against a business
 * step, so a value can never be read off the wrong board.
 */
export const productTextStyle = (step: import('./product').ProductTypeStep) => css`
  font-family: ${({ theme }) => theme.product.type[step].fontFamily};
  font-size: ${({ theme }) => theme.product.type[step].fontSize}px;
  ${({ theme }) => {
    const resolved = theme.product.type[step];
    return 'lineHeight' in resolved ? `line-height: ${resolved.lineHeight}px;` : '';
  }}
`;

/**
 * iOS squircle corners. Pair with any non-capsule radius; `continuous` is a
 * no-op on Android, so it is safe to apply unconditionally.
 */
export const continuousCorners = css`
  border-curve: continuous;
`;

/**
 * Applies a step from the checkout board's type scale — see `theme/checkout.ts`.
 *
 * A third twin of `boardTextStyle`, for the reason the second one gives: each
 * accessor is bound to one board's scale, so `checkoutTextStyle('itemName')`
 * cannot resolve against the product board by accident.
 */
export const checkoutTextStyle = (step: import('./checkout').CheckoutTypeStep) => css`
  font-family: ${({ theme }) => theme.checkout.type[step].fontFamily};
  font-size: ${({ theme }) => theme.checkout.type[step].fontSize}px;
  ${({ theme }) => {
    const resolved = theme.checkout.type[step];
    return 'lineHeight' in resolved ? `line-height: ${resolved.lineHeight}px;` : '';
  }}
`;

/**
 * Applies a step from the orders board's type scale — see `theme/orders.ts`.
 *
 * A fourth twin of `boardTextStyle`, for the reason the second and third give:
 * each accessor is bound to one board's scale, so `ordersTextStyle('eta')`
 * cannot resolve against the checkout board by accident.
 */
export const ordersTextStyle = (step: import('./orders').OrdersTypeStep) => css`
  font-family: ${({ theme }) => theme.orders.type[step].fontFamily};
  font-size: ${({ theme }) => theme.orders.type[step].fontSize}px;
  ${({ theme }) => {
    const resolved = theme.orders.type[step];
    return 'lineHeight' in resolved ? `line-height: ${resolved.lineHeight}px;` : '';
  }}
`;
