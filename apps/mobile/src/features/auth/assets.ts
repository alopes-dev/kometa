/**
 * Every static asset the authentication screens render, exported from Figma
 * file PAuqq5xMI0yQtx8POz4TUL (page "AUTHENTICATION") and committed under
 * `assets/auth/`.
 *
 * Same arrangement as `features/onboarding/assets.ts`: the requires live in
 * one module so the relative hop out of `src/` is written once, and a missing
 * export fails at build time rather than at the callsite that needed it.
 *
 * `arrowLeft` is deliberately re-exported from the onboarding set rather than
 * downloaded again — both boards draw the same Lucide glyph at the same size,
 * and a second copy of the file would be a second thing to keep in step.
 */
import { icon as onboardingIcon } from '@/features/onboarding/assets';

export const brand = {
  /**
   * The Kometa mark in white, for the plate in the welcome lockup.
   *
   * The board drew a stand-in sparkles glyph at node 74:27013 because the
   * logo did not exist yet; this is the real mark, derived from the same
   * source as the app icon so the two read as one lockup.
   */
  kometaMark: require('../../../assets/auth/brand/kometa-mark.png'),
  /** 180 x 180 — the upper-right ambient circle (node 74:24629). */
  ambientCircleLarge: require('../../../assets/auth/brand/ambient-circle-lg.svg'),
  /** 150 x 150 — the lower-left ambient circle (node 74:24630). */
  ambientCircleSmall: require('../../../assets/auth/brand/ambient-circle-sm.svg'),
} as const;

/**
 * Lucide icons at their design sizes. Sizes are intrinsic to each file and
 * match the slot it fills, so they render at natural dimensions rather than
 * being stretched.
 */
export const icon = {
  /** 28 x 28 — the food tile (node 74:27016). */
  utensils: require('../../../assets/auth/icons/utensils.svg'),
  /** 28 x 28 — the goods tile (node 74:27019). */
  shoppingBag: require('../../../assets/auth/icons/shopping-bag.svg'),
  /** 28 x 28 — the parcels tile (node 74:27022). */
  package: require('../../../assets/auth/icons/package.svg'),
  /** 14 x 14 — the country selector's disclosure (node 74:27037). */
  chevronDown: require('../../../assets/auth/icons/chevron-down.svg'),
  /** 20 x 20 — the back target (node 74:27034), shared with the onboarding. */
  arrowLeft: onboardingIcon.arrowLeft,
} as const;
