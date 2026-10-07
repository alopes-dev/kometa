import { brand, neutral, red, amber, blue, violet, withAlpha } from './palette';

/**
 * Semantic color tokens — what components are allowed to consume.
 *
 * Every token names a *role*, not a value, so that light and dark are two
 * mappings of one vocabulary rather than two palettes. Both schemes expose
 * exactly the same keys; `SemanticColors` is derived from the light map and
 * the dark map is checked against it, so a key can never exist in one scheme
 * and silently go missing in the other.
 */

const lightColors = {
  /** Page-level fills, from furthest back to furthest forward. */
  background: {
    primary: neutral[0],
    secondary: neutral[50],
    tertiary: neutral[100],
    elevated: neutral[0],
    grouped: neutral[100],
    inverse: neutral[900],
  },

  /** Component-level fills. `interactive` is the resting state of a tappable row. */
  surface: {
    primary: neutral[0],
    secondary: neutral[100],
    elevated: neutral[0],
    sunken: neutral[100],
    interactive: neutral[0],
    interactivePressed: neutral[100],
    selected: brand[50],
    disabled: neutral[200],
    inverse: neutral[900],
  },

  /**
   * Text and icon colors.
   *
   * `tertiary` is cleared for metadata at 15px and above only (3.45:1).
   * Anything that must read as body copy uses `secondary` (5.81:1 on
   * background.primary, 5.33:1 on surface.secondary).
   */
  text: {
    primary: neutral[900],
    secondary: neutral[600],
    tertiary: neutral[500],
    muted: neutral[500],
    disabled: neutral[400],
    /** For use on dark fills and photographic scrims. */
    inverse: neutral[0],
    /** For use on a brand fill. */
    onBrand: neutral[0],
    /**
     * For use on photography and on the scrims over it. Fixed white in both
     * schemes: a scrim over an image is dark regardless of the color scheme,
     * so this must NOT flip the way `inverse` does.
     */
    onMedia: neutral[0],
    brand: brand[700],
    success: brand[700],
    error: red[600],
    warning: amber[700],
    info: blue[600],
    link: brand[700],
  },

  border: {
    subtle: neutral[100],
    default: neutral[200],
    strong: neutral[300],
    focus: brand[600],
    selected: brand[600],
    error: red[500],
    disabled: neutral[200],
  },

  /** Brand accent roles, for CTAs, active state, progress and price emphasis. */
  brand: {
    subtle: brand[50],
    tint: brand[100],
    /** Primary CTA fill. Hosts `text.onBrand` at 5.16:1. */
    base: brand[600],
    pressed: brand[700],
    bold: brand[700],
    /** Graphic-only accent: icons ≥24px, map routes. Never behind text. */
    graphic: brand[500],
  },

  /**
   * Status roles. `fill` is a background that hosts `onFill`; `fg` is a text
   * color for use on `bg`. Success maps onto the brand ramp deliberately —
   * two greens 15° apart read as a bug, not a system.
   */
  status: {
    success: { bg: brand[50], fg: brand[700], fill: brand[600], onFill: neutral[0] },
    error: { bg: red[50], fg: red[600], fill: red[600], onFill: neutral[0] },
    warning: { bg: amber[50], fg: amber[700], fill: amber[500], onFill: neutral[900] },
    info: { bg: blue[50], fg: blue[600], fill: blue[600], onFill: neutral[0] },
  },

  /**
   * Delivery lifecycle, for the design system's `StatusChip`. The orders
   * path keys its own chip off `OrderStage` in the orders
   * feature exactly, so a stage can be looked up directly without a mapping
   * table that can fall out of sync.
   *
   * Kept deliberately quiet — these are chip tints, not fills. `StatusChip`
   * always renders an icon and a label alongside the color, because color
   * alone must never carry the state (§44).
   */
  delivery: {
    confirmed: { bg: blue[50], fg: blue[600] },
    preparing: { bg: amber[50], fg: amber[700] },
    ready: { bg: brand[50], fg: brand[700] },
    'on-the-way': { bg: blue[50], fg: blue[600] },
    'picked-up': { bg: blue[50], fg: blue[700] },
    arriving: { bg: brand[50], fg: brand[700] },
    delivered: { bg: brand[50], fg: brand[700] },
    cancelled: { bg: red[50], fg: red[600] },
  },

  /** Exactly three promotional accents, each with one semantic job. */
  promo: {
    offer: { bg: brand[50], fg: brand[700], fill: brand[600], onFill: neutral[0] },
    featured: { bg: violet[50], fg: violet[600], fill: violet[600], onFill: neutral[0] },
    limited: { bg: amber[50], fg: amber[700], fill: amber[500], onFill: neutral[900] },
  },

  /** Scrims, backdrops and the shadow source color. */
  overlay: {
    backdrop: withAlpha(neutral[950], 0.4),
    scrimFrom: withAlpha(neutral[950], 0),
    scrimTo: withAlpha(neutral[950], 0.75),
    /** Translucent chip over photography, e.g. a rating badge. */
    floating: withAlpha(neutral[0], 0.92),
  },

  /** Media placeholders, so an unloaded image is never a bare white box. */
  media: {
    placeholder: neutral[200],
  },

  /** Rating stars. Bright gold — distinct from `status.warning`, whose text
   * step is a dark amber that reads brown on a star. */
  rating: { filled: amber[400], empty: neutral[300] },

  shadow: neutral[950],
} as const;

/** The token vocabulary. Dark must satisfy this exactly — no missing keys. */
export type SemanticColors = {
  readonly [K in keyof typeof lightColors]: (typeof lightColors)[K] extends string
    ? string
    : {
        readonly [P in keyof (typeof lightColors)[K]]: (typeof lightColors)[K][P] extends string
          ? string
          : { readonly [Q in keyof (typeof lightColors)[K][P]]: string };
      };
};

/**
 * Dark scheme.
 *
 * Not an inversion. The base is #0E1013 rather than #000 so that elevated
 * surfaces have headroom, brand duties move *up* the ramp (300/400 instead
 * of 600/700) because light text on dark needs the lighter steps, and the
 * brand CTA flips to a dark label on a light-green fill — white on brand
 * only reaches 3.55:1 here, a near-black label reaches 7.51:1.
 */
const darkColors = {
  background: {
    primary: neutral[950],
    secondary: '#16191D',
    tertiary: '#1E2228',
    elevated: '#1E2228',
    grouped: '#16191D',
    inverse: neutral[50],
  },

  surface: {
    primary: '#16191D',
    secondary: '#1E2228',
    elevated: '#1E2228',
    sunken: neutral[950],
    interactive: '#16191D',
    interactivePressed: '#242931',
    selected: '#0E2A20',
    disabled: '#242931',
    inverse: neutral[50],
  },

  text: {
    primary: '#F7F8F8',
    secondary: '#A9B0B7',
    tertiary: '#7D858D',
    muted: '#7D858D',
    disabled: '#5F666E',
    inverse: neutral[950],
    /** Dark-mode brand fills are light, so their label is near-black. */
    onBrand: neutral[950],
    onMedia: neutral[0],
    brand: brand[300],
    success: brand[300],
    error: red[300],
    warning: amber[300],
    info: blue[300],
    link: brand[300],
  },

  border: {
    subtle: '#1E2228',
    default: neutral[800],
    strong: '#3A4047',
    focus: brand[400],
    selected: brand[400],
    error: red[400],
    disabled: neutral[800],
  },

  brand: {
    subtle: '#0E2A20',
    tint: '#114033',
    base: brand[400],
    pressed: brand[300],
    bold: brand[300],
    graphic: brand[400],
  },

  status: {
    success: { bg: '#0E2A20', fg: brand[300], fill: brand[400], onFill: neutral[950] },
    error: { bg: '#2E1412', fg: red[300], fill: red[400], onFill: neutral[950] },
    warning: { bg: '#2B1F08', fg: amber[300], fill: amber[400], onFill: neutral[950] },
    info: { bg: '#12213C', fg: blue[300], fill: blue[400], onFill: neutral[950] },
  },

  delivery: {
    confirmed: { bg: '#12213C', fg: blue[300] },
    preparing: { bg: '#2B1F08', fg: amber[300] },
    ready: { bg: '#0E2A20', fg: brand[300] },
    'on-the-way': { bg: '#12213C', fg: blue[300] },
    'picked-up': { bg: '#12213C', fg: blue[200] },
    arriving: { bg: '#0E2A20', fg: brand[300] },
    delivered: { bg: '#0E2A20', fg: brand[300] },
    cancelled: { bg: '#2E1412', fg: red[300] },
  },

  promo: {
    offer: { bg: '#0E2A20', fg: brand[300], fill: brand[400], onFill: neutral[950] },
    featured: { bg: '#231A4A', fg: violet[300], fill: violet[400], onFill: neutral[950] },
    limited: { bg: '#2B1F08', fg: amber[300], fill: amber[400], onFill: neutral[950] },
  },

  overlay: {
    backdrop: withAlpha('#000000', 0.6),
    scrimFrom: withAlpha('#000000', 0),
    scrimTo: withAlpha('#000000', 0.8),
    /** Dark equivalent of the translucent floating chip. */
    floating: withAlpha('#1E2228', 0.92),
  },

  media: {
    placeholder: '#242931',
  },

  rating: { filled: amber[300], empty: neutral[700] },

  shadow: '#000000',
} as const satisfies SemanticColors;

export const semanticColors = {
  light: lightColors,
  dark: darkColors,
} as const;
