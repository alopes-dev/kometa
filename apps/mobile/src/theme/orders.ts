import { fontFamily } from './typography';

/**
 * Orders-board tokens — measured on Figma page 69:4724
 * (`ORDERS & TRACKING`), boards 02 Foundations and 03 Order Components, with
 * the sheet and map geometry from board 08 Map.
 *
 * Scoped here for the reason `checkout.ts` is scoped: the page sets type at
 * sizes the shared ramp has no step for — Inter SemiBold at 15 and 17, Inter
 * Regular at 13 — and bending the ramp to fit this page would re-set type on
 * every screen that reads it. The steps the ramp *does* carry stay on the
 * ramp.
 *
 * COLOUR IS NOT HERE, the same deliberate omission `product.ts` and
 * `checkout.ts` make. Board 02 draws Primary as #1BAC4B, a brighter grass
 * green than the app's `brand.base` (#0A7D53); it is mapped onto the ramp
 * rather than frozen — two greens a few degrees apart read as a bug, not a
 * system. Every other colour the page draws already has a semantic token:
 * #212121 is `text.primary`, #616161 `text.secondary`, #9E9E9E `text.muted`,
 * #FFFFFF `background.primary`, #FAFAFA `background.secondary`, #EEEEEE
 * `border.subtle`, #F75555 `status.error`, #E8F7ED `status.success.bg`,
 * #FFC107 the star token, and #F3F4F5 (the map's land) `background.secondary`.
 */

/** Type steps, transcribed per node. */
const type = {
  /** `Pedido entregue` — a result screen's headline. Board 02 Large Title. */
  resultTitle: { fontFamily: fontFamily.display.bold, fontSize: 34, lineHeight: 41 },
  /** `O teu pedido está a caminho` — the tracking sheet's status. Board 02 Title 2. */
  statusTitle: { fontFamily: fontFamily.display.bold, fontSize: 24, lineHeight: 30 },
  /** `Em curso` / `Anteriores` — a list section heading. */
  sectionTitle: { fontFamily: fontFamily.display.semibold, fontSize: 20 },
  /** `Burger House` — the merchant on an order card. Board 02 Headline 17/22. */
  merchantName: { fontFamily: fontFamily.text.semibold, fontSize: 17, lineHeight: 22 },
  /** `Chega em ~12 min` — the ETA line under it. */
  eta: { fontFamily: fontFamily.text.semibold, fontSize: 15 },
  /** `Hoje · 2 itens` — a history row's meta. */
  rowMeta: { fontFamily: fontFamily.text.regular, fontSize: 13 },
  /** `#CM-10482` — the order number, wherever it appears. */
  orderNumber: { fontFamily: fontFamily.text.regular, fontSize: 12 },
  /** `A caminho` — the status chip. */
  chip: { fontFamily: fontFamily.text.semibold, fontSize: 12 },
  /** `Atualizado agora` — the freshness line. Board 02 Caption 12/16. */
  caption: { fontFamily: fontFamily.text.regular, fontSize: 12, lineHeight: 16 },
  /** `18:42` — a timeline row's timestamp. */
  timelineTime: { fontFamily: fontFamily.text.regular, fontSize: 13 },
  /** `Pedido confirmado` — a timeline row's label. */
  timelineLabel: { fontFamily: fontFamily.text.semibold, fontSize: 15 },
} as const;

/** Geometry, measured per node. */
const metrics = {
  /** Board 03 draws the tracking sheet at three detents, labelled in points. */
  sheetCollapsed: 92,
  sheetMedium: 220,
  sheetExpanded: 350,

  /** Board 08: the active map takes 45–60% of the viewport, never more. */
  mapMinRatio: 0.45,
  mapMaxRatio: 0.6,

  /** Board 16: the minimum touch target, which the glyph may be smaller than. */
  touchTarget: 44,

  cardRadius: 16,
  cardPadding: 16,
  bodyGap: 24,
  bodyPaddingH: 16,

  /** The timeline's dot and the rail that joins two of them. */
  timelineDot: 12,
  timelineRail: 2,
  timelineRowGap: 24,
} as const;

/**
 * Board 18, `Motion`. "150–350 ms, curvas iOS, sheet físico e markers sem
 * saltos. Reduce Motion usa cross-fade." Named here rather than read off the
 * checkout board so a component cannot drift onto another page's timings.
 */
const motion = {
  /** Press feedback. */
  tap: 150,
  /** A state change inside a screen: a stage advancing, an ETA recalculating. */
  state: 220,
  /** A sheet moving between detents. */
  sheet: 300,
  /** A screen transition. */
  screen: 350,
  /** With Reduce Motion, displacement becomes a crossfade no longer than this. */
  reducedCrossfade: 150,
  pressScale: 0.98,
} as const;

export const orders = {
  type,
  metrics,
  motion,
} as const;

export type OrdersTokens = typeof orders;
export type OrdersTypeStep = keyof typeof type;
