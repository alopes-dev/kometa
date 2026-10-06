import { onboarding } from './onboarding';

/**
 * Authentication tokens — a verbatim mirror of the measured values on page
 * "AUTHENTICATION" of Figma file PAuqq5xMI0yQtx8POz4TUL.
 *
 * Scoped here for the same reason `onboarding.ts` is scoped (see its header):
 * the pre-app boards are drawn against `offer/green` #1BAC4B rather than the
 * app's `brand.600` #0A7D53, and re-pointing the semantic tokens at them would
 * re-skin every screen behind the sign-in wall.
 *
 * The palette is literally the onboarding one — same hexes, same roles — so it
 * is aliased rather than copied, and a change there moves both boards
 * together. What differs is the type ramp: these boards set their titles in
 * Poppins Bold, where board "10 — Onboarding" sets them in Inter Bold.
 *
 * CONTRAST NOTE: white-on-`offerGreen` measures 2.98:1, below the WCAG AA
 * thresholds. That is a property of the design as drawn, not of this
 * translation — the same note `onboarding.ts` carries.
 */

/** Identical to the onboarding palette; see the note above. */
const color = {
  ...onboarding.color,

  /**
   * The three `Marketplace tile` fills behind the welcome motif — nodes
   * 74:24632, 74:24634, 74:24636. One per category the marketplace spans
   * (food, goods, parcels), which is why they are three fixed values rather
   * than one repeated tint.
   */
  tileFood: '#FFF3E8',
  tileGoods: '#E8F7ED',
  tileParcels: '#F1EEFF',
} as const;

const font = onboarding.font;

/**
 * Type steps, transcribed per node. Unitless Figma multipliers are resolved
 * against the font size and rounded to the nearest pixel (28 x 1.18 = 33.04
 * -> 33); where Figma says `leading-[normal]` the step carries no
 * `lineHeight` and the platform default applies.
 */
const type = {
  /** Wordmark beside the comet mark — node 74:24627. */
  wordmark: { fontFamily: 'Poppins_700Bold', fontSize: 20, letterSpacing: -0.8 },
  /** Screen title — nodes 74:24639, 74:24716, 74:24953. 28 x 1.18. */
  title: { fontFamily: 'Poppins_700Bold', fontSize: 28, lineHeight: 33 },
  /** Screen subtitle — nodes 74:24640, 74:24717, 74:24954. 15 x 1.5. */
  body: { fontFamily: font.text.regular, fontSize: 15, lineHeight: 23 },
  /** Field label — node 74:24719. */
  fieldLabel: { fontFamily: font.text.medium, fontSize: 13 },
  /** Phone number value and placeholder — node 74:24725. */
  fieldValue: { fontFamily: font.text.regular, fontSize: 16 },
  /** Dialling code beside the flag — node 74:24723. */
  countryCode: { fontFamily: font.text.semibold, fontSize: 15 },
  /** The flag glyph — node 74:24722. */
  countryFlag: { fontFamily: font.text.regular, fontSize: 19 },
  /** One OTP digit — node 74:24957. */
  digit: { fontFamily: font.text.semibold, fontSize: 21 },
  /** Action-button label — nodes 74:24643, 74:24729. */
  action: { fontFamily: font.text.semibold, fontSize: 16 },
  /** Resend countdown — node 74:24969. */
  resend: { fontFamily: font.text.regular, fontSize: 13 },
  /** Field footnote — node 74:24726. 12 x 1.45. */
  hint: { fontFamily: font.text.regular, fontSize: 12, lineHeight: 17 },
  /** Terms line under the welcome actions — node 74:24646. 11 x 1.5. */
  legal: { fontFamily: font.text.regular, fontSize: 11, lineHeight: 17 },
} as const;

/**
 * Measured geometry, named per the Figma layer that carries each value.
 *
 * Note these differ from the onboarding board's: the action button is 56 high
 * at radius 16 here, where board 10 draws 54 at radius 14.
 */
const metrics = {
  /** `Screen body` — node 74:24621. */
  screenPadding: 24,
  screenPaddingTop: 8,
  screenPaddingBottom: 12,
  /** Gap between the blocks of `Main content` — node 74:24622. */
  contentGap: 24,

  /** `Navigation` — node 74:24623. */
  navHeight: 44,
  /** `Back button` — node 74:24713. */
  backSize: 44,
  backIconSize: 20,

  /** `Cometa logo` — node 74:24624. */
  markSize: 34,
  markRadius: 11,
  /**
   * The mark's slot inside the plate. The board drew a square 18px glyph;
   * the real mark is 1.69:1, so this is 74% of `markSize` — the same share
   * of the plate the mark takes in the app icon, which keeps the header
   * lockup and the launcher icon reading as the same thing.
   */
  markLogoWidth: 25,
  logoGap: 10,

  /** `Welcome visual` — node 74:24628. */
  visualHeight: 250,
  visualRadius: 24,
  /** `Marketplace tile` — nodes 74:24632/34/36, drawn at three sizes. */
  tileRadius: 22,
  tileIconSize: 28,
  tileSizeSmall: 70,
  tileSizeLarge: 92,
  tileSizeMedium: 74,
  tileGap: 12,
  /** `Ambient circle` — nodes 74:24629, 74:24630. */
  ambientLargeSize: 180,
  ambientSmallSize: 150,

  /** `Welcome copy` — node 74:24638. */
  copyGap: 10,
  /** `Header` — node 74:24715. */
  headerGap: 8,

  /** `Phone field` — node 74:24720. */
  fieldHeight: 58,
  fieldRadius: 16,
  fieldPaddingHorizontal: 14,
  fieldBorderWidth: 1,
  /** `Phone input` — the gap between the label and the field (node 74:24718). */
  fieldStackGap: 7,
  /** `Country selector` internal gap — node 74:24721. */
  countryGap: 7,
  countryChevronSize: 14,

  /** `Digit cell` — node 74:24956. The focused cell is drawn at 2px. */
  otpCellHeight: 58,
  otpCellRadius: 12,
  otpGap: 8,
  otpFocusBorderWidth: 2,
  otpLength: 6,

  /** `Button` and `Bottom action` — nodes 74:24642, 74:24641. */
  actionHeight: 56,
  actionRadius: 16,
  actionGap: 12,
} as const;

export const auth = { color, font, type, metrics } as const;

export type AuthTokens = typeof auth;
