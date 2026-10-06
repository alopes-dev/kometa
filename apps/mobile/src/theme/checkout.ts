import { fontFamily } from './typography';

/**
 * Checkout-board tokens — measured on Figma page 67:4561
 * (`CART & CHECKOUT`), boards 02 Foundations, 03 Cart Components and the
 * screen boards 04–17.
 *
 * Scoped here for the reason `product.ts` is scoped: the page sets type at
 * sizes the shared ramp has no step for — Inter SemiBold at 13, Inter Regular
 * at 11 — and bending the ramp to fit the checkout would re-set type on every
 * screen that reads it. The steps the ramp *does* carry stay on the ramp: a
 * screen title is Poppins SemiBold 18, which is `h6`, and the merchant name is
 * Poppins Bold 16.
 *
 * COLOUR IS NOT HERE, the same deliberate omission `product.ts` makes. Board
 * 02 draws Primary as #1BAC4B, a brighter grass green than the app's
 * `brand.base` (#0A7D53); it is mapped onto the ramp rather than frozen — two
 * greens a few degrees apart read as a bug, not a system. Every other colour
 * the page draws already has a semantic token: #212121 is `text.primary`,
 * #616161 `text.secondary`, #9E9E9E `text.muted`, #FAFAFA
 * `background.secondary`, #EEEEEE `border.subtle`, #D92D20 `status.error`,
 * #B25E09 on #FFF5E8 `text.warning` on `status.warning.bg`, #EAF8EE
 * `status.success.bg`.
 */

/** Type steps, transcribed per node. */
const type = {
  /** `O teu carrinho` — the screen title in the navigation bar. */
  screenTitle: { fontFamily: fontFamily.display.semibold, fontSize: 18 },
  /** `3 itens · Burger House` — the caption under it. */
  screenCaption: { fontFamily: fontFamily.text.regular, fontSize: 11 },
  /** `Editar` / `Concluir` — the navigation bar's trailing action. */
  navAction: { fontFamily: fontFamily.text.semibold, fontSize: 13 },

  /** `Burger House` — the merchant name in the context card. */
  merchantName: { fontFamily: fontFamily.display.bold, fontSize: 16 },
  /** `Talatona, Luanda · 25–35 min`. */
  merchantMeta: { fontFamily: fontFamily.text.regular, fontSize: 12 },
  /** `1 loja` — the pill on the right of the context card. */
  chip: { fontFamily: fontFamily.text.semibold, fontSize: 11 },

  /** `Classic Burger` — a cart line's name. */
  itemName: { fontFamily: fontFamily.text.semibold, fontSize: 14 },
  /** `5.700 Kz` — the same line's price. */
  itemPrice: { fontFamily: fontFamily.text.semibold, fontSize: 13 },
  /** `Carne · queijo · molho da casa` — what it was configured as. */
  itemOptions: { fontFamily: fontFamily.text.regular, fontSize: 11, lineHeight: 15 },
  /** `Editar` / `A editar opções` / `A atualizar…` under a line. */
  itemAction: { fontFamily: fontFamily.text.semibold, fontSize: 11 },
  /** The quantity between the stepper's signs. */
  stepperValue: { fontFamily: fontFamily.text.semibold, fontSize: 12 },

  /** `Casa` / `Pagamento na entrega` — a selection row's title. */
  rowTitle: { fontFamily: fontFamily.text.semibold, fontSize: 13 },
  /** `Talatona, Luanda` — its subtitle. */
  rowSubtitle: { fontFamily: fontFamily.text.regular, fontSize: 11 },

  /** `Subtotal` / `Entrega` — a summary line's label. */
  summaryLabel: { fontFamily: fontFamily.text.regular, fontSize: 12 },
  /** `12.700 Kz` — its value. */
  summaryValue: { fontFamily: fontFamily.text.semibold, fontSize: 12 },
  /** `Total` — the word, on the ramp's display face. */
  totalLabel: { fontFamily: fontFamily.display.semibold, fontSize: 15 },
  /** `12.400 Kz` — the figure beside it, the largest number on the screen. */
  totalValue: { fontFamily: fontFamily.text.bold, fontSize: 18 },

  /** `CÓDIGO PROMOCIONAL` — a form field's label. */
  fieldLabel: { fontFamily: fontFamily.text.semibold, fontSize: 11 },
  /** What the customer typed into it. */
  fieldValue: { fontFamily: fontFamily.text.regular, fontSize: 13 },
  /** `Este código não é válido.` — the line under a failed field. */
  fieldError: { fontFamily: fontFamily.text.regular, fontSize: 10 },
  /** `43/120 caracteres` — the counter under the instructions field. */
  fieldCounter: { fontFamily: fontFamily.text.regular, fontSize: 10 },

  /** `Código inválido` — a feedback banner's title. */
  bannerTitle: { fontFamily: fontFamily.text.semibold, fontSize: 12 },
  /** `Confirma a escrita ou tenta outro código.` — its body. */
  bannerBody: { fontFamily: fontFamily.text.regular, fontSize: 11, lineHeight: 15 },

  /** `Pedido mínimo` — the progress card's heading. */
  progressTitle: { fontFamily: fontFamily.text.bold, fontSize: 13 },
  /** `3.800 / 5.000 Kz` — the figure beside it. */
  progressValue: { fontFamily: fontFamily.text.semibold, fontSize: 12 },
  /** `A Burger House aceita pedidos a partir de 5.000 Kz.` */
  progressNote: { fontFamily: fontFamily.text.regular, fontSize: 11, lineHeight: 15 },

  /** `Pagar 12.400 Kz` — the bottom action's label. */
  actionLabel: { fontFamily: fontFamily.text.bold, fontSize: 14 },
  /** `Remover` / `Ver substitutos` — a secondary action beside it. */
  secondaryActionLabel: { fontFamily: fontFamily.text.semibold, fontSize: 13 },

  /** `1× Classic Burger` — a review line. */
  reviewLine: { fontFamily: fontFamily.text.regular, fontSize: 12 },
  /** Its price. */
  reviewPrice: { fontFamily: fontFamily.text.semibold, fontSize: 12 },

  /** `Estamos a confirmar o pagamento` — a full-screen state's title. */
  stateTitle: { fontFamily: fontFamily.display.semibold, fontSize: 22, lineHeight: 29 },
  /** The paragraph under it. */
  stateBody: { fontFamily: fontFamily.text.regular, fontSize: 12, lineHeight: 18 },
} as const;

/** Measured geometry, named for the board element that carries each value. */
const metrics = {
  /** `Navigation` — the bar under the status bar. */
  navMinHeight: 56,
  navPaddingH: 16,
  navPaddingV: 8,
  navGap: 12,
  /** The circular back button, and the invisible spacer that balances it. */
  backSize: 40,
  backIcon: 20,

  /** `Screen body` — the scrolling region. */
  bodyPaddingH: 16,
  bodyPaddingTop: 8,
  bodyPaddingBottom: 12,
  bodyGap: 12,

  /** `Merchant context`. */
  merchantPadding: 12,
  merchantRadius: 18,
  merchantImage: 52,
  merchantImageRadius: 14,

  /** `Cart item`. */
  itemPaddingV: 10,
  itemGap: 12,
  itemImage: 64,
  itemImageRadius: 14,
  itemDetailsGap: 4,
  /** `Quantity control` — the pill holding trash/qty/plus. */
  stepperPadding: 4,
  stepperGap: 10,
  stepperIcon: 14,

  /** `Selection row` — address, payment, contact, instructions. */
  rowMinHeight: 58,
  rowPadding: 12,
  rowRadius: 12,
  rowGap: 12,
  rowIcon: 20,
  rowTrailing: 18,

  /** `Order summary`. */
  summaryPadding: 14,
  summaryRadius: 18,
  summaryGap: 9,

  /** `Form field`. */
  fieldGap: 5,
  fieldMinHeight: 48,
  fieldPaddingH: 14,
  fieldPaddingV: 12,
  fieldRadius: 12,

  /** `Feedback banner`. */
  bannerPadding: 12,
  bannerRadius: 12,
  bannerGap: 10,
  bannerIcon: 18,

  /** `Minimum progress`. */
  progressPadding: 16,
  progressRadius: 18,
  progressGap: 10,
  progressTrackHeight: 8,
  progressTrackRadius: 4,

  /** `Suggested add-on`. */
  suggestionPadding: 12,
  suggestionRadius: 16,
  suggestionImage: 50,
  suggestionImageRadius: 12,
  suggestionAddSize: 40,

  /** `Bottom action` — the band pinned above the home indicator. */
  actionPaddingH: 16,
  actionPaddingTop: 12,
  /** Board 04 draws 30; the safe-area inset replaces it on a device that has one. */
  actionPaddingBottom: 30,
  actionGap: 8,
  ctaHeight: 54,
  ctaRadius: 18,

  /** The badge a full-screen state (processing, confirmed, failed) centres on. */
  stateBadge: 88,
  stateBadgeIcon: 36,
  stateGap: 16,

  /** `Loading` — board 16 draws skeletons at the final geometry. */
  skeletonRadius: 8,
  skeletonLineHeight: 10,
} as const;

/**
 * Board 19 · 07, `Motion & haptics`. The four durations the page names, as
 * annotations rather than layers — the components apply them.
 */
const motion = {
  /** Press feedback. */
  tap: 150,
  /** A state change inside a screen: a banner arriving, a total recalculating. */
  state: 220,
  /** A sheet or a dialog. */
  sheet: 300,
  /** A screen transition. */
  screen: 350,
  /** With Reduce Motion, displacement becomes a crossfade no longer than this. */
  reducedCrossfade: 150,
  pressScale: 0.98,
} as const;

export const checkout = {
  type,
  metrics,
  motion,
} as const;

export type CheckoutTokens = typeof checkout;
export type CheckoutTypeStep = keyof typeof type;
