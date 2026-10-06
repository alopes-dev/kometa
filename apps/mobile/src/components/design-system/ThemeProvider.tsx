import type { ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import {
  semanticColors,
  shadows,
  typography,
  spacing,
  layout,
  radius,
  motion,
  opacity,
  pressed,
  foregroundRoles,
  fillRoles,
  onboarding,
  auth,
  business,
  product,
  checkout,
  type SemanticColors,
  type ShadowGeometry,
  type ShadowLevel,
  type ForegroundRole,
  type FillRole,
  type OnboardingTokens,
  type AuthTokens,
  type BusinessTokens,
  type ProductTokens,
  type CheckoutTokens,
} from '@/theme';

/**
 * The shape every styled component sees as `theme`.
 *
 * `colors` and `shadows` are typed as the scheme-independent token
 * vocabulary, not as the light map. That is the fix for a real defect in the
 * previous theme: it typed `colors` as `Record<keyof typeof colors, string>`
 * derived from the *light* palette, so `surfaceElevated` — which only the
 * dark palette defined — was unreachable from a component and the elevated
 * dark surface was effectively dead code. Both schemes now satisfy one type,
 * so a token missing from either side fails to compile.
 */
export interface Theme {
  scheme: 'light' | 'dark';
  colors: SemanticColors;
  shadows: Record<ShadowLevel, ShadowGeometry>;
  /** Foreground roles for `Text` and `Icon`. */
  fg: Record<ForegroundRole, string>;
  /** Fill roles for badges, dots and indicators. */
  fill: Record<FillRole, string>;
  typography: typeof typography;
  spacing: typeof spacing;
  layout: typeof layout;
  radius: typeof radius;
  motion: typeof motion;
  opacity: typeof opacity;
  pressed: typeof pressed;
  /**
   * Figma onboarding tokens. Scheme-independent: both boards are drawn
   * light-only, so they resolve identically in dark mode rather than
   * inventing a dark variant the design does not specify.
   */
  onboarding: OnboardingTokens;
  /**
   * Figma authentication tokens. Scheme-independent for the same reason as
   * `onboarding`: the sign-in boards are drawn light-only.
   */
  auth: AuthTokens;
  /**
   * Figma business-board tokens — the restaurant detail. Scheme-independent
   * for the same reason as the two above; its colours are not frozen here,
   * they come from `colors`, so the screen still follows the active scheme.
   */
  business: BusinessTokens;
  /**
   * Figma product-board tokens — the product detail. Scheme-independent for
   * the same reason as `business`, and its colours likewise come from
   * `colors` rather than being frozen here.
   */
  product: ProductTokens;
  /**
   * Figma checkout-board tokens — the cart and the checkout path.
   * Scheme-independent for the same reason as `product`, and its colours
   * likewise come from `colors` rather than being frozen here.
   */
  checkout: CheckoutTokens;
}

const shared = {
  typography,
  onboarding,
  auth,
  business,
  product,
  checkout,
  spacing,
  layout,
  radius,
  motion,
  opacity,
  pressed,
} as const;

export const lightTheme: Theme = {
  scheme: 'light',
  colors: semanticColors.light,
  shadows: shadows.light,
  fg: foregroundRoles(semanticColors.light),
  fill: fillRoles(semanticColors.light),
  ...shared,
};

export const darkTheme: Theme = {
  scheme: 'dark',
  colors: semanticColors.dark,
  shadows: shadows.dark,
  fg: foregroundRoles(semanticColors.dark),
  fill: fillRoles(semanticColors.dark),
  ...shared,
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  return <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>;
}
