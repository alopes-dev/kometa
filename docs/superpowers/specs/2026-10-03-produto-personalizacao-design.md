# Product Detail & Customization — Design

**Goal:** Rebuild the product detail screen against the Figma page `PRODUCT & CUSTOMIZATION` (node `64:2470`), which supersedes the older product board (`48:20693`) the current screen was built from. This spec covers everything the screen can render **without a network call**: the data model, pricing, validation, the collapsing hero, the five option-card states, the sticky footer, and the commercial states (unavailable, offer).

**Status:** The current screen at `app/(tabs)/(home)/product/[itemId].tsx` was built against `48:20693` — an earlier, simpler design. It is replaced, not patched. `apps/api` is an empty slot; all data is mock and synchronous.

**Source of truth:** Figma file `PAuqq5xMI0yQtx8POz4TUL`, page `64:2470`, boards:

| Board | Node | What it fixes |
|---|---|---|
| 01 · Foundations | `66:30285` | palette, type ramp, spacing, target sizes |
| 02 · Componentes e estados | `66:30432` | the UI kit — every component state |
| 03 · Fluxo A | `66:30851` | simple product, no modifiers |
| 04 · Fluxos B–C | `66:31058` | customization + validation |
| 05 · Estados comerciais D–E | `66:31597` | unavailable, offer, duplicated configs |
| 06 · Showcases | `66:31790` | pizza (long), combo (sheet), pharmacy |
| 07 · Handoff MVP | `66:32080` | a11y, motion, content, condition table |

Written in English to match the four existing specs in this folder; all UI copy is quoted verbatim in Portuguese.

## Decisions taken

These were settled in brainstorming and are not reopened by this spec:

1. **The old screen is replaced.** `48:20693` is retired as a source of truth, along with the tokens in `theme/product.ts` that transcribe it.
2. **The product image uses the restaurant's collapsing-hero idea**, not the board's static nav bar. See *Deviations*.
3. **The app's brand ramp wins over the board's `#1BAC4B`.** The Foundations board draws a brighter grass green than the app's `brand[600]` (`#0A7D53`, jade, hue ~158°). Geometry and type are transcribed from the board; **colour is mapped onto existing semantic tokens**, exactly as `theme/product.ts` and `theme/business.ts` already do. Two greens a few degrees apart read as a bug, and a frozen hex table breaks dark mode.
4. **The async add-to-cart seam is built**, but in the spec that follows this one. This spec ships the CTA states that need no network.
5. **This spec does not touch the restaurant screen.** The collapse mechanics are written fresh inside `features/product`. Extracting a shared `CollapsingHero` and migrating `RestaurantHero` onto it is deferred until both consumers exist and the real seams are visible.

## Scope

**In scope**

- A new `features/product/` module; the four product components move out of `features/home/`.
- Data model: selection limits, option availability, absolute-vs-delta pricing, item availability, max quantity, attributes, offer metadata.
- Pricing and validation as pure functions.
- Collapsing hero, nav chrome, header block, attribute row.
- Option cards in all five states: default, selected, disabled, error, max-selected.
- Observação field with `0/180` counter.
- Quantity row honouring `maxQuantity`.
- Sticky footer: breakdown line, total, CTA.
- CTA states that need no network: `ready`, `needsChoices`, `unavailable`.
- Validation that scrolls to and focuses the first incomplete group, preserving every choice.
- Unavailable product and offer presentation.
- Accessibility and motion per board 07.
- One contract change outside the module: `CartProvider.addItem` takes the unit price instead of deriving it. See *Data model*.

**Out of scope** — each becomes its own spec:

- **Async add-to-cart:** `adding` / `added` / `failed` CTA states, idempotent retry, inline cart bar, success banner. *Next spec.*
- **Resilience:** offline, price-changed reconciliation, calculation error banners.
- **Scales and categories:** bottom-sheet variant, disclosure accordions, pharmacy attribute table, health notice.
- **Cart screen:** the "2 configurações" presentation and per-line "Editar" (board `05`, flow E). `CartProvider` already keys lines by item + selections + notes, so configurations are kept separate at the data layer today; only the cart screen's presentation is missing.

## Module structure

```
features/product/
  types.ts
  mockData.ts            # moves the modifier fixtures out of features/home
  data.ts                # getProductById — the only module others import
  pricing.ts
  pricing.test.ts
  validation.ts
  validation.test.ts
  content.ts             # every Portuguese string on the screen
  components/
    ProductHero/         # rewritten: collapsing, per decision 2
    ProductHeader/       # name, price, description, attribute row
    ProductNotice/       # tinted non-interactive chip / banner
    ModifierGroupCard/   # the bordered card + its header and counter
    ModifierOptionRow/   # one option: control left, cost right
    ProductNoteField/    # Observação + counter
    ProductQuantityRow/  # label left, stepper right
    ProductFooter/       # breakdown + total + CTA
```

`features/home` keeps `MenuItem` for list rendering; `features/product/types.ts` owns the customization model and re-exports what the cart needs. `QuantityStepper` stays in the design system — the checkout's `OrderItemRow` uses it.

## Data model

`features/product/types.ts`:

```ts
export type ModifierOption = {
  id: string;
  label: string;
  /** Delta when the group prices by 'delta', absolute when it prices by 'absolute'. */
  price: number;
  /** Defaults to true. False keeps the row visible and dimmed — never removed. */
  available?: boolean;
  /** "Indisponível hoje" — shown under the label when unavailable. */
  unavailableNote?: string;
};

export type ModifierGroup = {
  id: string;
  label: string;                        // "Escolha o pão"
  minSelections: number;                // 1 = obrigatório
  maxSelections: number;
  /** 'absolute' replaces the base price (pizza size); 'delta' adds to it. */
  pricing: 'delta' | 'absolute';
  options: ModifierOption[];
};
```

`required` and `type: 'single' | 'multiple'` are **removed**. Both are derived, and the derivation covers every group the board draws with no exceptions:

| Group on the board | min | max | Control | Counter |
|---|---|---|---|---|
| "Escolha o pão" / "Escolha a bebida" / "Tamanho" | 1 | 1 | radio | hidden |
| "Extras" | 0 | 3 | checkbox | `2/3` |
| "Adicionar" (opcional) | 0 | 1 | checkbox | `1/1` |

So: **control** is radio when `min === 1 && max === 1`, checkbox otherwise; **counter** is shown for checkbox groups only. Subtitle copy follows the same rule — `"Escolha 1 · obrigatório"` when required-single, `"Escolha até {max}"` when `max > 1`, `"Opcional"` when `min === 0 && max === 1`.

The product itself:

```ts
export type ProductAttribute = {
  id: string;
  label: string;                        // "Marca" — rendered only in the table layout
  value: string;                        // "Coca-Cola"
  icon?: { name: keyof typeof Ionicons.glyphMap; sf?: SFSymbol };
  tone?: 'default' | 'positive';        // "Em stock" renders positive
};

export type Product = MenuItem & {
  availability: 'available' | 'unavailable';
  /** "Volte a consultar mais tarde" — never a promised time. */
  unavailableNote?: string;
  /** Caps the stepper; drives "Máximo disponível: 3". */
  maxQuantity?: number;
  attributes?: ProductAttribute[];
  /** 'inline' renders the chip row (flow A). 'table' is the pharmacy layout. */
  attributeLayout?: 'inline' | 'table';
  /** "−15% hoje" — the badge over the image. `previousPrice` already exists. */
  offerLabel?: string;
  modifierGroups?: ModifierGroup[];
};
```

`attributeLayout: 'table'` is defined here but rendered in the categories spec; only `'inline'` ships now.

`modifierGroups` is **removed from `MenuItem`** in `features/home/types.ts` and lives on `Product` only — otherwise the intersection collides the old and new `ModifierGroup` shapes. `features/home` renders lists and never needs the customization model.

This has one consequence worth stating, because it reaches outside the module. `CartProvider.addItem` currently calls `computeUnitPrice(menuItem, selections)` from `features/home/modifierPricing`, which reads `item.modifierGroups`. With the groups gone from `MenuItem`, the cart can no longer price a configuration itself — and it should not: pricing is `features/product`'s job.

So **`addItem` takes the already-computed unit price** instead of deriving it:

```ts
addItem(item: MenuItem, options?: { selections?: CartSelection[]; notes?: string; unitPrice?: number })
```

`unitPrice` defaults to `item.price`. There are exactly two call sites:

- `restaurant/[id].tsx:158` — quick-add, no selections, no change needed (the default is correct).
- `product/[itemId].tsx` — passes the unit price it already computes for the footer.

`features/home/modifierPricing.ts` and its test are deleted; `computeUnitPrice` moves to `features/product/pricing.ts`. `buildLineId` is untouched — it keys on `selections` and never inspects the groups, so configurations stay separate exactly as they do today.

`data.ts` exposes `getProductById(id): Product | undefined`. Nothing outside it imports `mockData.ts`. Fixtures must cover: a plain product (Coca-Cola, no groups), a customizable one (Classic Burger), one with an absolute-pricing group (Pizza Margherita), an unavailable one, and an offer.

## Pricing

`features/product/pricing.ts` — pure, no React, the most heavily tested module here.

```ts
/** The absolute group's chosen option replaces item.price; otherwise item.price. */
resolveBasePrice(product, selections): number

/** Base + every delta-group selection. */
computeUnitPrice(product, selections): number

computeTotal(unitPrice, quantity): number

/** What the header shows under the name. */
resolveHeadlinePrice(product, selections):
  | { kind: 'from'; value: number }                                  // "A partir de 5.500 Kz"
  | { kind: 'variant'; value: number; variantLabel: string }         // "Grande · 7.500 Kz"
  | { kind: 'offer'; value: number; previous: number; savings: number }
  | { kind: 'exact'; value: number }

/** The footer's left-hand line. */
formatBreakdown(product, selections, quantity): string
```

Rules the board fixes:

- `from` applies only while an **absolute** group is undecided — `"A partir de 5.500 Kz"` is the minimum option price in that group. Once chosen it becomes `variant`: `"Grande · 7.500 Kz"`. Board 02: *"'A partir de' só aparece antes da variação obrigatória estar decidida."*
- `offer` requires `previousPrice > price`; `savings = previousPrice - price`.
- Breakdown shapes, verbatim from the boards:
  - no groups: `"1 un. × 1.800 Kz"`
  - delta extras: `"1 × 4.500 Kz + extras · 1.700 Kz"`
  - absolute + extras: `"Grande 7.500 Kz + extras 2.200 Kz"`
  - offer: `"1 un. · preço com desconto"`
- Currency: `Kz` suffix, `.` as thousands separator (`9.700 Kz`), no decimals, no foreign currency. `formatKwanza` in `features/home/format.ts` already does this and is reused, not reimplemented.

## Validation

`features/product/validation.ts`:

```ts
type GroupStatus = 'incomplete' | 'satisfied' | 'full';

resolveGroupStatus(group, selection): GroupStatus
findFirstIncompleteGroup(product, selections): string | null
isOptionSelectable(group, selection, option): boolean   // false at max, or unavailable
canAdd(product, selections): boolean                    // false when unavailable
```

`full` is reached when `selectedCount === maxSelections` and `maxSelections > 1`; remaining options dim and show `"Limite atingido"`. Hitting the cap never blocks **deselection** — only new selections.

Radio groups (`max === 1`) are never `full`, which matters: a satisfied radio group must stay switchable, so `isOptionSelectable` returns `true` for every available option in it. Selecting a second radio **replaces** the first rather than being rejected. Treating `max === 1` as a cap would silently freeze the group on its first choice — the single most likely bug in this model.

**Validation is not an error.** The board draws the incomplete group with a `primary-soft` outline and the message `"Falta escolher o pão"` in green with an ⓘ icon — not red. Red (`#F75555` → `colors.status.error`) is reserved for genuine failures (calculation, add-to-cart), which are in later specs. Per board 07, *"Verde comunica acção, mas nunca é o único indicador"*: the outline never stands alone — the message always renders with it.

## Screen composition

### Chrome and hero

The photograph runs to the top edge and collapses on scroll: height interpolates from `heroHeight + topInset` down to `56 + topInset`, the media fades out, a solid background fades in, and a compact title appears once past 50% of the collapse range. Overscroll stretches by 200px. The leading `‹` is always pinned; the trailing action is **share** in detail mode and **`✕`** in customization mode.

The compact title carries the **product name**, not the board's generic `"Detalhes"` — it matches the restaurant screen and serves the board's own VoiceOver requirement (*"Nome + estado + preço"*).

The favourite heart sits over the photograph, top-right, and fades with it. It is `#F75555` → `colors.status.error.fill`, filled when active, **never green**, and never competes with the CTA (board 07).

When `availability === 'unavailable'`, an overlay chip reading `"Temporariamente indisponível"` pins to the image's bottom-left.

### Header block

Order is **name → price → description → attributes**. The current screen renders description before price; the board reverses it, and the price is the green line directly under the name.

- Name: `h1` (Poppins Bold 28), up to 2 lines before truncating.
- Price: renders per `resolveHeadlinePrice`. The `offer` kind draws the discounted value followed by the struck previous price; `from` prefixes `"A partir de"`.
- Description: secondary text.
- Attribute row (`attributeLayout: 'inline'`): non-interactive icon + value items, e.g. `Coca-Cola · 1,5 L · Disponível`. A new component — the existing `Chip` atom is an interactive filter chip with press-scale and a `selected` state, which this is not.

Unavailable products additionally render a `ProductNotice` chip, a meta row (`"Burger Lab"` · `"Volte a consultar mais tarde"`), and the explanatory line *"O produto continua visível para preservar contexto, preço e informação. Não prometemos uma hora de regresso."*

Offers render an amber notice: `"Poupa 450 Kz. O desconto já está incluído no total."`

### Option cards

A bordered card per group. Header: title left, counter right (checkbox groups only); subtitle underneath per the derivation table above.

Each option is **one row, one target**: control on the **left**, label in the middle, cost on the right (`+1.000 Kz`). The current implementation inverts this and inlines the surcharge into the label with a middot — both change.

The row owns the `Pressable`; the `Radio` and `Checkbox` atoms render their own `Pressable` internally, so they are mounted with `pointerEvents="none"` and the row supplies `accessibilityRole` and `accessibilityState`. This keeps the whole row tappable, which board 07 requires, without the atom swallowing the press or announcing itself twice.

Row height ≥ 44pt. Disabled rows stay visible and dimmed with their note underneath (`"Indisponível hoje"`, `"Limite atingido"`).

### Observação

Label `"Observação"`, helper `"Opcional · não substitui escolhas acima"`, placeholder `"Ex.: Sem cebola"`, and a visible `0/180` counter. Built on the existing `TextField` atom with `multiline`.

### Quantity

A row: `"Quantidade"` on the left, stepper on the right. When `maxQuantity` is set, a `"Máximo disponível: {n}"` subtitle renders and `+` dims at the cap.

`QuantityStepper` gains an `inline` variant — plain `−`, value, and `+` in a filled brand circle — plus `canIncrement` / `canDecrement` props. The existing `pill` and `panel` variants are untouched, so the checkout keeps working.

### Footer

Sticky, respecting the bottom safe area. Breakdown line left, total right, CTA beneath at 54pt.

| State | Label | Behaviour |
|---|---|---|
| `ready` | `"Adicionar ao carrinho · {total}"` | adds |
| `needsChoices` | `"Escolher opções"` | greyed; press scrolls to and focuses the first incomplete group |
| `unavailable` | `"Indisponível"` | inert |

`needsChoices` **never clears anything** — every selection and the note survive the press. The scroll is 300–350ms `ease-in-out`.

## Accessibility

- VoiceOver announces `"Classic Burger, 4.500 Kz, personalizável"` — name, price, state. No decoration, no repeated visual price.
- Each group is announced before its options: *"Escolha o pão, obrigatório, 0 de 1 seleccionado."* Each option announces name, cost, state, and unavailability.
- The CTA announces its total: *"Adicionar ao carrinho, total 6.200 Kz."*
- Validation moves focus to the **group title**, never to an arbitrary option; the message follows it in the rotor.
- Targets ≥ 44×44. The stepper is 40pt visually inside a 48pt touch area.
- Contrast AA: `#212121` on white for primary, `#616161` for secondary — satisfied by `text.primary` / `text.secondary`.
- Dynamic Type to 200%: titles wrap to 2 lines, the price never truncates, the CTA grows in height.
- Verified at 390×844, 393×852 and 430×932.

## Motion

| Interaction | Duration | Curve |
|---|---|---|
| Press / selection | 150ms | ease-out |
| Scroll to incomplete group | 300–350ms | ease-in-out |

Reduce Motion replaces displacement with a crossfade ≤150ms. Motion is never used to hide a price change. `useReducedMotion` already exists and is honoured. Light haptic on selection — never required for comprehension.

## Content

All strings live in `features/product/content.ts`. Portuguese of Angola: short, direct, never punitive. No invented health claims — the board's rule is *"Mostrar exactamente: 'Este produto pode exigir receita médica.' Não inventar condições ou aconselhamento."* (the health variant itself ships in the categories spec).

## Deviations from the board

Recorded so a future reader does not "fix" them back:

1. **Collapsing hero instead of a static nav bar.** The board draws a persistent white bar above the image; this screen runs the photograph to the top and collapses it into that bar, matching `RestaurantHero`. Decided deliberately.
2. **Compact title is the product name**, not `"Detalhes"` / `"Personalizar"`.
3. **Brand green stays `brand[600]`**, not the board's `#1BAC4B`. See decision 3.
4. **The status bar is hidden app-wide** (`<StatusBar hidden />` in the root layout), so the board's mocked status bar band is not reproduced — the measured 310pt sits below the notch via `topInset`, as `ProductHero` already documents.

## Testing

- `pricing.test.ts` — every `resolveHeadlinePrice` kind; absolute groups replacing rather than adding; breakdown strings for all four shapes; offer savings; formatting (`9.700 Kz`).
- `validation.test.ts` — group status transitions; `findFirstIncompleteGroup` ordering; deselection still allowed at max; unavailable products never addable.
- `ModifierOptionRow.test.tsx` — row press toggles; the atom does not swallow the press; disabled rows ignore presses but stay rendered; accessibility state is announced once.
- `ModifierGroupCard.test.tsx` — counter visibility by derivation; subtitle copy; error outline renders with its message, never alone.
- `ProductFooter.test.tsx` — the three CTA states and their labels.
- `useCart.test.tsx` — the new `unitPrice` argument; quick-add still prices at `item.price` when it is omitted; two different configurations of one product remain separate lines.
- Update `purchase-flow.test.tsx`, which exercises the current screen end to end.

A regression guard worth writing first: selecting a second option in a radio group replaces the first and leaves the group satisfied. It is the failure the model invites.

Per `AGENTS.md`, the exact versioned Expo docs at `https://docs.expo.dev/versions/v57.0.0/` are read before any implementation.

## Follow-up specs

1. **Async add-to-cart** — the seam, `adding` / `added` / `failed`, idempotent retry, inline cart bar, success banner.
2. **Resilience** — offline, price-changed reconciliation, calculation error.
3. **Scales and categories** — bottom sheet, disclosure accordions, pharmacy table, health notice.
4. **Cart presentation** — "2 configurações", per-line summary and "Editar".
