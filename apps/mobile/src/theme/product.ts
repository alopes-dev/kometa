import { fontFamily } from './typography';

/**
 * Product-board tokens — measured on Figma page 64:2470
 * (`PRODUCT & CUSTOMIZATION`), boards 01 Foundations, 02 Componentes,
 * 03 Fluxo A, 04 Fluxos B–C and 06 Showcases.
 *
 * This page supersedes the earlier product board (48:20693) these tokens
 * used to transcribe. The screen it describes is a different one: a
 * bordered card per modifier group, the control on the left, a sticky
 * footer carrying the sum, and a hero that collapses into its own header.
 *
 * Scoped here for the reason `business.ts` is scoped: the board sets type at
 * sizes the shared ramp has no step for — Inter Regular at 14, Inter SemiBold
 * at 22 — and bending the ramp to fit one screen would re-set type on every
 * screen that uses it. The steps the ramp *does* carry are deliberately
 * absent: the product name is Poppins Bold 28, which is `h1`, and a group
 * title is Poppins SemiBold 16, which is `h5`. Those read the ramp directly.
 *
 * COLOUR IS NOT HERE, the same deliberate omission `business.ts` makes.
 * Board 01 draws Primary as #1BAC4B, a brighter grass green than the app's
 * `brand.base` (#0A7D53). It is mapped onto the ramp rather than frozen —
 * two greens a few degrees apart read as a bug, not a system — and every
 * other colour the board draws already has a semantic token: #212121 is
 * `text.primary`, #616161 `text.secondary`, #9E9E9E `text.muted`, #FAFAFA
 * `background.secondary`, #EEEEEE `border.subtle`, #F75555 `status.error`.
 */

/**
 * Type steps, transcribed per node. Unitless Figma multipliers are resolved
 * against the font size and rounded to the nearest pixel (14 x 1.5 = 21).
 */
const type = {
  /** `Descrição` — the body under the name. 14 x 1.5. */
  description: { fontFamily: fontFamily.text.regular, fontSize: 14, lineHeight: 21 },
  /** `Preço` — the green line directly under the name. */
  price: { fontFamily: fontFamily.text.semibold, fontSize: 22 },
  /** The struck previous price beside an offer. */
  previousPrice: { fontFamily: fontFamily.text.regular, fontSize: 14 },
  /** `Nome` — an option's label inside a group card. */
  optionLabel: { fontFamily: fontFamily.text.regular, fontSize: 14 },
  /** `Indisponível hoje` / `Limite atingido` — the reason under a blocked option. */
  optionNote: { fontFamily: fontFamily.text.regular, fontSize: 12 },
  /** `+1.000 Kz` — an option's cost, right-aligned. */
  optionCost: { fontFamily: fontFamily.text.regular, fontSize: 14 },
  /** `Escolha 1 · obrigatório` — the subtitle under a group title. */
  groupSubtitle: { fontFamily: fontFamily.text.regular, fontSize: 12 },
  /** `2/3` — the counter in a group header. */
  groupCounter: { fontFamily: fontFamily.text.semibold, fontSize: 12 },
  /** `Falta escolher o pão.` — the validation line inside a card. */
  groupError: { fontFamily: fontFamily.text.semibold, fontSize: 12 },
  /** `Menos` / `Mais` — the stepper's signs. */
  stepperSign: { fontFamily: fontFamily.text.regular, fontSize: 20 },
  /** `Valor` — the quantity between them. */
  stepperValue: { fontFamily: fontFamily.text.semibold, fontSize: 16 },
  /** `1 × 4.500 Kz + extras · 1.700 Kz` — the footer's left-hand line. */
  breakdown: { fontFamily: fontFamily.text.regular, fontSize: 12 },
  /** `6.200 Kz` — the footer's total, right-aligned. */
  footerTotal: { fontFamily: fontFamily.text.semibold, fontSize: 16 },
  /** `Adicionar ao carrinho · 6.200 Kz` — the CTA label. */
  actionLabel: { fontFamily: fontFamily.text.semibold, fontSize: 15 },
  /** An attribute's value in the inline row — `Coca-Cola`, `1,5 L`. */
  attribute: { fontFamily: fontFamily.text.regular, fontSize: 13 },
  /** The copy inside a notice banner. */
  notice: { fontFamily: fontFamily.text.regular, fontSize: 13, lineHeight: 19 },

} as const;

/** Measured geometry, named for the board element that carries each value. */
const metrics = {
  /** `Imagem do produto` — the hero at rest, before it collapses. */
  heroHeight: 310,
  /** What the hero collapses into: a header bar carrying the product name. */
  heroCompact: 56,
  /** The scrim over the top of the photograph, so the buttons stay legible. */
  scrimHeight: 96,

  /** `Ações` — the row of circular buttons pinned over the hero. */
  actionsInset: 18,
  actionsTop: 12,
  actionSize: 40,
  actionIconSize: 19,
  actionGap: 10,

  /** `Detalhe` — the content column under the hero. */
  detailPaddingHorizontal: 20,
  detailPaddingVertical: 24,
  detailGap: 20,

  /** `Título e preço` — the header block. */
  titleGap: 8,
  attributeGap: 12,

  /** `Grupo` — one bordered modifier card. */
  cardRadius: 16,
  cardPadding: 16,
  cardHeaderGap: 2,
  cardGap: 12,
  /** `Opção` — one row inside the card. 48 clears the 44pt minimum target. */
  optionHeight: 48,
  optionGap: 12,
  /** `Seleção` — the radio or checkbox on the left. */
  controlSize: 20,

  /** `Quantidade` — the label-and-stepper row. */
  quantityHeight: 44,
  stepperGap: 14,
  stepperButtonSize: 32,

  /** `Observação` — the note field and its counter. */
  noteMaxLength: 180,

  /** `Rodapé` — the sticky footer and its CTA. */
  footerPaddingHorizontal: 20,
  footerPaddingTop: 12,
  footerPaddingBottom: 12,
  footerRowGap: 10,
  ctaHeight: 54,
  ctaRadius: 16,

} as const;

/**
 * The lift under the hero's circular buttons — `0 3px 12px rgba(9,16,29,0.07)`.
 * Its own value rather than a `shadows` level, for the reason `business.ts`
 * gives: `sm` is flatter and `md` wider than what the board draws, and these
 * buttons have to lift off a photograph.
 */
const actionShadow = { offsetY: 3, radius: 12, opacity: 0.07, elevation: 3 } as const;

/**
 * The sticky footer's lift — it sits over scrolling content and has to read
 * as a surface above it, not a band painted on it.
 */
const footerShadow = { offsetY: -4, radius: 16, opacity: 0.08, elevation: 12 } as const;

/**
 * Board 07, `Motion pretendido · 150–350 ms`. Annotations, not layers, so
 * they are specified here and applied by the components.
 */
const motion = {
  /** Press and selection. */
  selection: 150,
  /** Cart bar and toast. */
  feedback: 200,
  /** Scrolling to the first incomplete group. */
  scrollToError: 320,
  /** With Reduce Motion, displacement becomes a crossfade no longer than this. */
  reducedCrossfade: 150,
  pressScale: 0.98,
} as const;

/** The gradient over the top of the hero photograph. */
const heroScrim = {
  colors: ['rgba(9,16,29,0.35)', 'rgba(9,16,29,0)'] as const,
} as const;

export const product = {
  type,
  metrics,
  actionShadow,
  footerShadow,
  motion,
  heroScrim,
} as const;

export type ProductTokens = typeof product;
export type ProductTypeStep = keyof typeof type;
