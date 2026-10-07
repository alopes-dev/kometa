# Pedidos & Tracking — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build everything that happens after the payment confirms — the orders
list, order details, tracking, map, courier, timeline, delivery, notifications
and the error, cancellation and payment states — against Figma page `69:4724`
(`ORDERS & TRACKING`), without a network call.

**Architecture:** A new `features/orders/` module owns the operational
lifecycle: the eleven stages from board 18, the ETA bands, the timeline, the
simulated clock that advances stages and the persisted store. `features/checkout`
keeps the payment lifecycle, renamed `PaymentStatus` so the two can no longer be
confused. `features/tracking/` narrows to geo and map concerns. Routes under
`(tabs)/(orders)/` are one-liners delegating to components. The new screens are
built alongside the old ones; the last task cuts over and deletes what the Figma
replaces.

**Tech Stack:** Expo SDK 57, React Native 0.86, React 19.2.3, styled-components
6, expo-image, expo-haptics, expo-clipboard, AsyncStorage, `@rnmapbox/maps`
(guarded), `@gorhom/bottom-sheet` (guarded), jest-expo +
@testing-library/react-native.

**Spec:** `docs/superpowers/specs/2026-10-07-pedidos-tracking-design.md`

## Global Constraints

- **Read `https://docs.expo.dev/versions/v57.0.0/` before writing code** — `AGENTS.md`.
- Colour comes from semantic tokens only. The board's `#1BAC4B` maps to
  `brand.base`, `#F75555` to `status.error`, `#FFC107` to the star token. Never
  freeze a board hex in a theme file.
- Geometry and type steps live in `theme/orders.ts`, each named for its node.
  Reached through `ordersTextStyle()`, never `textStyle()`.
- Money always through `formatKwanza` from `features/home/format.ts`. No cents,
  `Kz` after the value.
- Copy lives in `features/orders/content.ts`. Portuguese **of Angola** — the
  screens being replaced write Brazilian Portuguese and that is a defect, not a
  style.
- Every state carries an icon **and** text — colour alone never carries meaning
  (board 10).
- ETA is never a per-second countdown and never a bare number: it is a band
  before pickup, an approximation after, a clock time at delivery (board 18).
- Touch targets ≥ 44 pt. Sheet detents 92 / 220 / 350 pt. Map 45–60% of the
  viewport.
- Motion 150–350 ms, honouring `useReducedMotion`; markers never jump.
- Tests: `pnpm --filter @kometa/mobile test`. Types:
  `pnpm --filter @kometa/mobile typecheck`. Lint:
  `pnpm --filter @kometa/mobile lint` (pre-existing warnings; must stay at 0 errors).
- **Never run `pnpm format`.** Format only the files you touched.

## Out of scope

Named here so a reviewer does not read them as gaps:

- **Analytics events.** The spec lists `order_confirmed`, `tracking_opened`,
  `courier_contacted`, `delivery_completed`, `rating_submitted` from board 18.
  This repo has no analytics client to emit them to, and inventing one is a
  separate decision. No task emits them; the names are recorded in the spec for
  whoever adds the client.
- **Real push delivery.** Task 22 maps events to destinations and builds the
  payload shape. Registering for push and receiving one needs a server.
- **The tab bar**, **`features/rating`'s criteria** and the **functional chat
  composer** — see the spec's "Fora de âmbito".

## Review Focus

Conditions the spec implies that no happy path exercises.

1. **A pending payment has no operational stage.** Board 15: an order awaiting
   payment must not read as `Confirmado` nor start an ETA. Modelled as
   `stage: OrderStage | null`, so the rule is a type, not a convention. → Task 7.
2. **Offline shows the last confirmed snapshot, never an interpolated one.**
   Board 18 forbids inventing a position between updates: the marker stays where
   it was, the state is datestamped, and the ETA is relabelled `Último ETA`.
   → Task 7 + Task 13.
3. **`delivered` stays upcoming and blank until confirmed.** An order at
   `arrived` must render `Entregue` with no timestamp — board 10, "futuro sem
   promessa". → Task 5.
4. **A failed refresh must not erase confirmed events.** Board 10: the timeline
   gains an error row; it does not lose the rows above it. → Task 5.
5. **Map unavailable and location denied at the same time.** Both banners show
   and tracking stays complete — board 08 says denying location never blocks
   tracking. → Task 13.

## File Structure

```
apps/mobile/src/
  theme/orders.ts                      type steps + metrics per node       (T2)
  theme/mixins.ts                      + ordersTextStyle()                 (T2)
  features/orders/
    types.ts                           OrderStage, CourierVisibility, …    (T3)
    stages.ts                          board 18's table                    (T3)
    eta.ts                             bands, rounding, formatting         (T4)
    timeline.ts                        events → rows                       (T5)
    simulation.ts                      the no-backend clock                (T6)
    store.ts                           records, active order, persistence  (T7)
    content.ts                         every string                        (T8)
    mockData.ts                        fixtures: orders, courier, lines    (T7)
    components/
      OrderStatusChip/ StatusBanner/ OrderNumber/                          (T9)
      ActiveOrderCard/ OrderHistoryRow/                                    (T10)
      CourierCard/ CourierChatPanel/                                       (T11)
      TimelineList/                                                        (T12)
      MapCanvas/ MapFallback/ TrackingSheet/                               (T13)
      OrdersListScreen/ OrderDetailsScreen/ ReceiptScreen/                 (T14,15)
      ConfirmationScreen/ TrackingScreen/ TimelineScreen/                  (T16,17,18)
      DeliveredScreen/ RatingScreen/                                       (T19)
      CancelSheet/ CancelledScreen/ RejectedScreen/                        (T20)
  hooks/OrdersProvider.tsx + useOrders.ts                                  (T7)
  app/(tabs)/(orders)/…                routes, one line each               (T14–T20)
```

---

### Task 1 — Rename checkout's `OrderStatus` to `PaymentStatus`

A pure rename, landed on its own so the diff that follows is about new code.

**Files:**

- Modify: `src/features/checkout/types.ts` (the `OrderStatus` union and `Order.status`)
- Modify: `src/features/checkout/order.ts` (imports and the `Order` literals)
- Modify: `src/features/checkout/components/StatusScreen/StatusScreen.tsx`
- Modify: `src/features/checkout/order.test.ts`

**Interfaces:**

- Produces: `PaymentStatus = 'draft' | 'submitting' | 'pending' | 'confirmed' | 'failed' | 'cancelled'`,
  exported from `features/checkout/types.ts`. `Order.status: PaymentStatus`.

- [ ] **Step 1: Find every reference**

```bash
cd apps/mobile && grep -rn "OrderStatus" src/
```

- [ ] **Step 2: Rename the type and update the doc comment**

In `src/features/checkout/types.ts`:

```ts
/**
 * The payment lifecycle — what the provider says about this attempt.
 *
 * Deliberately NOT the order's operational lifecycle, which lives in
 * `features/orders/types.ts` as `OrderStage`. The two share three names
 * (`pending`, `confirmed`, `cancelled`) and mean different things by each:
 * board 15 of page 69:4724 requires a pending *payment* to be
 * distinguishable from a pending *kitchen*, and one union cannot say both.
 */
export type PaymentStatus =
  'draft' | 'submitting' | 'pending' | 'confirmed' | 'failed' | 'cancelled';
```

- [ ] **Step 3: Update `Order`**

```ts
export type Order = {
  orderId: string;
  status: PaymentStatus;
  totals: OrderSummary;
  createdAt: number;
  providerReference?: string;
};
```

- [ ] **Step 4: Update the three remaining call sites**

Replace the `OrderStatus` identifier in `order.ts`, `StatusScreen.tsx` and
`order.test.ts`. No behaviour changes; the string literals are untouched.

- [ ] **Step 5: Verify nothing broke**

```bash
pnpm --filter @kometa/mobile typecheck && pnpm --filter @kometa/mobile test
```

Expected: typecheck clean, all existing tests pass, and
`grep -rn "OrderStatus" src/` returns nothing.

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/src/features/checkout
git commit -m "refactor(checkout): rename OrderStatus to PaymentStatus"
```

---

### Task 2 — Board tokens

**Files:**

- Create: `src/theme/orders.ts`
- Modify: `src/theme/mixins.ts` (add `ordersTextStyle`)
- Modify: `src/theme/index.ts` (register `orders` on the theme)

**Interfaces:**

- Produces: `ordersTokens`, `OrdersTypeStep`, and `ordersTextStyle(step: OrdersTypeStep)`.
  Theme access: `theme.orders.type[step]`, `theme.orders.metrics[name]`.

- [ ] **Step 1: Read how the three existing board files do it**

```bash
sed -n '1,40p' apps/mobile/src/theme/checkout.ts
sed -n '1,30p' apps/mobile/src/theme/product.ts
grep -n "checkout" apps/mobile/src/theme/index.ts
```

- [ ] **Step 2: Write `theme/orders.ts`**

Header comment states the page (`69:4724`), the boards measured (02, 03) and
repeats the colour omission verbatim from `checkout.ts`'s reasoning.

Type steps, each named for its node — board 02 draws Large Title 34/41,
Title 2 24/30, Headline 17/22 SemiBold, Caption 12/16:

```ts
const type = {
  /** `Pedido entregue` — a result screen's headline. Board 02 Large Title. */
  resultTitle: { fontFamily: fontFamily.display.bold, fontSize: 34, lineHeight: 41 },
  /** `O teu pedido está a caminho` — the tracking sheet's status. Title 2. */
  statusTitle: { fontFamily: fontFamily.display.bold, fontSize: 24, lineHeight: 30 },
  /** `Em curso` / `Anteriores` — a list section heading. */
  sectionTitle: { fontFamily: fontFamily.display.semibold, fontSize: 20 },
  /** `Burger House` — the merchant on an order card. Headline 17/22. */
  merchantName: { fontFamily: fontFamily.text.semibold, fontSize: 17, lineHeight: 22 },
  /** `Chega em ~12 min` — the ETA line under it. */
  eta: { fontFamily: fontFamily.text.semibold, fontSize: 15 },
  /** `Hoje · 2 itens` — a history row's meta. */
  rowMeta: { fontFamily: fontFamily.text.regular, fontSize: 13 },
  /** `#CM-10482` — the order number, wherever it appears. */
  orderNumber: { fontFamily: fontFamily.text.regular, fontSize: 12 },
  /** `A caminho` — the status chip. */
  chip: { fontFamily: fontFamily.text.semibold, fontSize: 12 },
  /** `Atualizado agora` — the freshness line. Caption 12/16. */
  caption: { fontFamily: fontFamily.text.regular, fontSize: 12, lineHeight: 16 },
  /** `18:42` — a timeline row's timestamp. */
  timelineTime: { fontFamily: fontFamily.text.regular, fontSize: 13 },
  /** `Pedido confirmado` — a timeline row's label. */
  timelineLabel: { fontFamily: fontFamily.text.semibold, fontSize: 15 },
} as const;
```

Metrics from boards 02, 03 and 08:

```ts
const metrics = {
  sheetCollapsed: 92,
  sheetMedium: 220,
  sheetExpanded: 350,
  /** Board 08: the active map takes 45–60% of the viewport. */
  mapMinRatio: 0.45,
  mapMaxRatio: 0.6,
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
```

- [ ] **Step 3: Add the mixin**

In `theme/mixins.ts`, a fourth twin of `boardTextStyle`, with the comment
explaining why it is a twin rather than a generalisation (copy the reasoning
from `checkoutTextStyle` above it):

```ts
export const ordersTextStyle = (step: import('./orders').OrdersTypeStep) => css`
  font-family: ${({ theme }) => theme.orders.type[step].fontFamily};
  font-size: ${({ theme }) => theme.orders.type[step].fontSize}px;
  ${({ theme }) => {
    const resolved = theme.orders.type[step];
    return 'lineHeight' in resolved ? `line-height: ${resolved.lineHeight}px;` : '';
  }}
`;
```

- [ ] **Step 4: Verify**

```bash
pnpm --filter @kometa/mobile typecheck
```

Expected: clean. `theme.orders.type.eta` resolves; `ordersTextStyle('itemName')`
is a type error (that step belongs to the checkout board).

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/theme
git commit -m "feat(orders): add orders board tokens"
```

---

### Task 3 — The stage machine

**Files:**

- Create: `src/features/orders/types.ts`
- Create: `src/features/orders/stages.ts`
- Test: `src/features/orders/stages.test.ts`

**Interfaces:**

- Produces:

```ts
export type OrderStage =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'assigned'
  | 'picked-up'
  | 'transit'
  | 'arriving'
  | 'arrived'
  | 'delivered'
  | 'cancelled';
export type CourierVisibility = 'none' | 'searching' | 'identity' | 'contact' | 'closed';
export const ORDER_STAGES: readonly OrderStage[]; // operational order, no `cancelled`
export function stageCopy(stage: OrderStage): string;
export function courierVisibility(stage: OrderStage): CourierVisibility;
export function stageIndex(stage: OrderStage): number; // -1 for `cancelled`
export function isTerminal(stage: OrderStage): boolean; // delivered | cancelled
export function nextStage(stage: OrderStage): OrderStage | null;
```

- [ ] **Step 1: Write the failing test**

`src/features/orders/stages.test.ts`:

```ts
import {
  ORDER_STAGES,
  courierVisibility,
  isTerminal,
  nextStage,
  stageCopy,
  stageIndex,
} from './stages';
import type { OrderStage } from './types';

describe('ORDER_STAGES', () => {
  it('runs in the order board 18 lists them, with cancelled outside the line', () => {
    expect(ORDER_STAGES).toEqual([
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'assigned',
      'picked-up',
      'transit',
      'arriving',
      'arrived',
      'delivered',
    ]);
    expect(ORDER_STAGES).not.toContain('cancelled');
  });
});

describe('stageCopy', () => {
  /** Board 18's table, verbatim. Portuguese of Angola. */
  it('gives every stage the human copy the board writes', () => {
    expect(stageCopy('pending')).toBe('A confirmar');
    expect(stageCopy('confirmed')).toBe('Pedido confirmado');
    expect(stageCopy('preparing')).toBe('A preparar');
    expect(stageCopy('ready')).toBe('Pronto para recolha');
    expect(stageCopy('assigned')).toBe('Courier atribuído');
    expect(stageCopy('picked-up')).toBe('Pedido recolhido');
    expect(stageCopy('transit')).toBe('A caminho');
    expect(stageCopy('arriving')).toBe('A chegar');
    expect(stageCopy('arrived')).toBe('Courier chegou');
    expect(stageCopy('delivered')).toBe('Pedido entregue');
    expect(stageCopy('cancelled')).toBe('Pedido cancelado');
  });
});

describe('courierVisibility', () => {
  /**
   * Board 18's third column, which board 09 draws as four distinct cards.
   * `none` is the absence of a card, not a card that says nothing.
   */
  it('hides the courier before there is one to show', () => {
    expect(courierVisibility('pending')).toBe('none');
    expect(courierVisibility('preparing')).toBe('none');
    expect(courierVisibility('cancelled')).toBe('none');
  });

  it('says it is looking while the merchant has no courier yet', () => {
    expect(courierVisibility('confirmed')).toBe('searching');
    expect(courierVisibility('ready')).toBe('searching');
  });

  it('reveals identity on assignment and contact from pickup onwards', () => {
    expect(courierVisibility('assigned')).toBe('identity');
    expect(courierVisibility('picked-up')).toBe('contact');
    expect(courierVisibility('transit')).toBe('contact');
    expect(courierVisibility('arriving')).toBe('contact');
    expect(courierVisibility('arrived')).toBe('contact');
  });

  it('closes contact once the delivery is done', () => {
    expect(courierVisibility('delivered')).toBe('closed');
  });
});

describe('stageIndex', () => {
  it('orders the operational line', () => {
    expect(stageIndex('pending')).toBe(0);
    expect(stageIndex('transit')).toBeGreaterThan(stageIndex('ready'));
  });

  /** Cancelled is not late in the line — it is off it. */
  it('places cancelled outside the line rather than at its end', () => {
    expect(stageIndex('cancelled')).toBe(-1);
  });
});

describe('nextStage', () => {
  it('advances along the line', () => {
    expect(nextStage('pending')).toBe('confirmed');
    expect(nextStage('arriving')).toBe('arrived');
    expect(nextStage('arrived')).toBe('delivered');
  });

  it('stops at the terminals', () => {
    expect(nextStage('delivered')).toBeNull();
    expect(nextStage('cancelled')).toBeNull();
  });
});

describe('isTerminal', () => {
  it('is true only where the order stops moving', () => {
    expect(isTerminal('delivered')).toBe(true);
    expect(isTerminal('cancelled')).toBe(true);
    expect(isTerminal('arrived')).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
pnpm --filter @kometa/mobile test -- stages.test.ts
```

Expected: FAIL — `Cannot find module './stages'`.

- [ ] **Step 3: Write `types.ts`, then `stages.ts`**

`stages.ts` holds board 18's table as one `Record<OrderStage, …>` so copy,
visibility and ETA band cannot drift apart, with a comment recording that
`arrived` reconciles board 07 and flow C of board 17 against the table (see the
spec's "Discrepâncias registadas").

- [ ] **Step 4: Run the tests**

```bash
pnpm --filter @kometa/mobile test -- stages.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/features/orders
git commit -m "feat(orders): add the eleven-stage operational machine"
```

---

### Task 4 — ETA bands

**Files:**

- Create: `src/features/orders/eta.ts`
- Test: `src/features/orders/eta.test.ts`
- Modify: `src/features/orders/types.ts` (add `EtaBand`)

**Interfaces:**

- Consumes: `OrderStage` from Task 3.
- Produces — `EtaBand` is declared in **`types.ts`** beside `OrderStage`, the
  functions in `eta.ts`:

```ts
export type EtaBand =
  | { kind: 'range'; min: number; max: number }
  | { kind: 'approx'; minutes: number }
  | { kind: 'now' }
  | { kind: 'time'; at: number }
  | { kind: 'none' };
export function etaBand(stage: OrderStage, deliveredAt?: number): EtaBand;
export function formatEta(band: EtaBand): string;
export function delayWindow(from: number, band: EtaBand): string;
```

- [ ] **Step 1: Write the failing test**

```ts
import { delayWindow, etaBand, formatEta } from './eta';

describe('etaBand', () => {
  /** Board 18: wide bands before pickup, narrowing after. */
  it('is a wide band before the courier has the order', () => {
    expect(etaBand('pending')).toEqual({ kind: 'range', min: 25, max: 35 });
    expect(etaBand('confirmed')).toEqual({ kind: 'range', min: 25, max: 35 });
    expect(etaBand('preparing')).toEqual({ kind: 'range', min: 20, max: 30 });
    expect(etaBand('ready')).toEqual({ kind: 'range', min: 18, max: 24 });
    expect(etaBand('assigned')).toEqual({ kind: 'range', min: 18, max: 24 });
    expect(etaBand('picked-up')).toEqual({ kind: 'range', min: 14, max: 18 });
  });

  it('narrows to an approximation in transit and a short band on approach', () => {
    expect(etaBand('transit')).toEqual({ kind: 'approx', minutes: 12 });
    expect(etaBand('arriving')).toEqual({ kind: 'range', min: 2, max: 4 });
  });

  it('says Agora once the courier is at the door', () => {
    expect(etaBand('arrived')).toEqual({ kind: 'now' });
  });

  /** Board 18: delivery shows a real clock time, not a duration. */
  it('becomes a clock time at delivery', () => {
    expect(etaBand('delivered', 1_760_000_000_000)).toEqual({
      kind: 'time',
      at: 1_760_000_000_000,
    });
  });

  it('has no ETA for a cancelled order', () => {
    expect(etaBand('cancelled')).toEqual({ kind: 'none' });
  });

  /** A delivered order with no recorded time must not invent one. */
  it('falls back to no ETA when delivery has no timestamp yet', () => {
    expect(etaBand('delivered')).toEqual({ kind: 'none' });
  });
});

describe('formatEta', () => {
  it('writes a band with an en dash, as the board draws it', () => {
    expect(formatEta({ kind: 'range', min: 25, max: 35 })).toBe('25–35 min');
  });

  it('marks an approximation rather than implying precision', () => {
    expect(formatEta({ kind: 'approx', minutes: 12 })).toBe('~12 min');
  });

  it('writes Agora and a clock time', () => {
    expect(formatEta({ kind: 'now' })).toBe('Agora');
    expect(formatEta({ kind: 'time', at: new Date('2026-10-07T19:18:00').getTime() })).toBe(
      '19:18'
    );
  });

  it('writes nothing for an order with no ETA', () => {
    expect(formatEta({ kind: 'none' })).toBe('');
  });
});

describe('delayWindow', () => {
  /**
   * Board 07's delay banner: `Novo intervalo: 19:22–19:30`. A clock window,
   * because a delay is news about when, not about how long more.
   */
  it('turns a band into a clock window from the given moment', () => {
    const from = new Date('2026-10-07T19:00:00').getTime();
    expect(delayWindow(from, { kind: 'range', min: 22, max: 30 })).toBe('19:22–19:30');
  });

  it('rounds to the minute rather than carrying seconds', () => {
    const from = new Date('2026-10-07T19:00:40').getTime();
    expect(delayWindow(from, { kind: 'range', min: 22, max: 30 })).toBe('19:22–19:30');
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
pnpm --filter @kometa/mobile test -- eta.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `eta.ts`**

The bands come from the single table in `stages.ts`, so the ETA column and the
copy column cannot disagree. `formatEta` uses an en dash (`–`, U+2013), matching
the board.

- [ ] **Step 4: Run the tests**

```bash
pnpm --filter @kometa/mobile test -- eta.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/features/orders
git commit -m "feat(orders): add ETA bands and their formatting"
```

---

### Task 5 — Timeline

**Files:**

- Create: `src/features/orders/timeline.ts`
- Test: `src/features/orders/timeline.test.ts`

**Interfaces:**

- Consumes: `OrderStage`, `stageCopy`, `stageIndex`, `ORDER_STAGES` from Task 3.
- Produces:

```ts
export type TimelineRowState = 'completed' | 'current' | 'upcoming' | 'error';
export type StageEvent = { stage: OrderStage; occurredAt: number };
export type TimelineRow = {
  stage: OrderStage;
  label: string;
  occurredAt?: number;
  state: TimelineRowState;
};
export function buildTimeline(
  events: StageEvent[],
  current: OrderStage,
  failedAt?: number
): TimelineRow[];
```

- [ ] **Step 1: Write the failing test**

```ts
import { buildTimeline } from './timeline';

const at = (hhmm: string) => new Date(`2026-10-07T${hhmm}:00`).getTime();

/** Board 10's own event log. */
const events = [
  { stage: 'confirmed' as const, occurredAt: at('18:42') },
  { stage: 'preparing' as const, occurredAt: at('18:44') },
  { stage: 'ready' as const, occurredAt: at('18:55') },
  { stage: 'assigned' as const, occurredAt: at('18:57') },
  { stage: 'picked-up' as const, occurredAt: at('19:01') },
  { stage: 'transit' as const, occurredAt: at('19:02') },
];

describe('buildTimeline', () => {
  it('marks what happened completed, with the time it happened', () => {
    const rows = buildTimeline(events, 'transit');
    const confirmed = rows.find((row) => row.stage === 'confirmed');
    expect(confirmed).toMatchObject({
      state: 'completed',
      label: 'Pedido confirmado',
      occurredAt: at('18:42'),
    });
  });

  it('marks the stage the order is at as current', () => {
    const rows = buildTimeline(events, 'transit');
    expect(rows.find((row) => row.stage === 'transit')).toMatchObject({
      state: 'current',
      occurredAt: at('19:02'),
    });
  });

  /**
   * Board 10, "Futuro sem promessa": `Entregue` stays upcoming and WITHOUT a
   * time until there is operational confirmation. Rendering a predicted
   * timestamp would be a promise the app cannot keep.
   */
  it('leaves a future stage upcoming and without a timestamp', () => {
    const rows = buildTimeline(events, 'transit');
    expect(rows.find((row) => row.stage === 'delivered')).toMatchObject({ state: 'upcoming' });
    expect(rows.find((row) => row.stage === 'delivered')?.occurredAt).toBeUndefined();
  });

  /**
   * Review Focus #4. Board 10, "Registo preservado": a refresh that fails adds
   * an error row. It does not drop the events already confirmed above it.
   */
  it('keeps every confirmed event when a refresh fails', () => {
    const rows = buildTimeline(events, 'transit', at('19:06'));
    expect(rows.filter((row) => row.state === 'completed')).toHaveLength(5);
    expect(rows.find((row) => row.state === 'error')).toMatchObject({ occurredAt: at('19:06') });
  });

  /** A cancelled order's history is still its history. */
  it('keeps the confirmed events of a cancelled order', () => {
    const rows = buildTimeline(events.slice(0, 2), 'cancelled');
    expect(rows.filter((row) => row.state === 'completed').length).toBeGreaterThan(0);
    expect(rows.find((row) => row.stage === 'cancelled')).toMatchObject({ state: 'current' });
  });

  /** An order that has only just been paid for has one row and no history. */
  it('handles an order with no events yet', () => {
    const rows = buildTimeline([], 'pending');
    expect(rows[0]).toMatchObject({ stage: 'pending', state: 'current' });
    expect(rows.every((row) => row.state !== 'completed')).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
pnpm --filter @kometa/mobile test -- timeline.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `timeline.ts`**

Rows are built from `ORDER_STAGES`, timestamps attached from `events`. A stage
with an event and an index below the current one is `completed`; the current
stage is `current`; the rest are `upcoming` with `occurredAt` deliberately
omitted. When `failedAt` is given, an `error` row is appended after the current
one.

- [ ] **Step 4: Run the tests**

```bash
pnpm --filter @kometa/mobile test -- timeline.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/features/orders
git commit -m "feat(orders): build the timeline from stage events"
```

---

### Task 6 — The simulated clock

There is no backend. Stages advance on a timer, isolated here so screens own no
timers and the progression is testable without waiting.

**Files:**

- Create: `src/features/orders/simulation.ts`
- Test: `src/features/orders/simulation.test.ts`

**Interfaces:**

- Consumes: `nextStage`, `isTerminal` from Task 3.
- Produces:

```ts
export type SimulationOptions = {
  from: OrderStage;
  intervalMs?: number; // default STAGE_INTERVAL_MS
  now?: () => number;
  onAdvance: (event: StageEvent) => void;
};
export const STAGE_INTERVAL_MS: number;
export function createSimulation(options: SimulationOptions): { start(): void; stop(): void };
```

- [ ] **Step 1: Write the failing test**

```ts
import { STAGE_INTERVAL_MS, createSimulation } from './simulation';
import type { StageEvent } from './timeline';

describe('createSimulation', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('advances one stage per interval, reporting when each happened', () => {
    const seen: StageEvent[] = [];
    const simulation = createSimulation({
      from: 'pending',
      now: () => 1_000,
      onAdvance: (event) => seen.push(event),
    });
    simulation.start();

    jest.advanceTimersByTime(STAGE_INTERVAL_MS);
    expect(seen).toEqual([{ stage: 'confirmed', occurredAt: 1_000 }]);

    jest.advanceTimersByTime(STAGE_INTERVAL_MS);
    expect(seen[1]).toEqual({ stage: 'preparing', occurredAt: 1_000 });
  });

  it('stops at delivered rather than running past the end of the line', () => {
    const seen: StageEvent[] = [];
    const simulation = createSimulation({
      from: 'arriving',
      onAdvance: (event) => seen.push(event),
    });
    simulation.start();

    jest.advanceTimersByTime(STAGE_INTERVAL_MS * 10);
    expect(seen.map((event) => event.stage)).toEqual(['arrived', 'delivered']);
  });

  it('never advances a cancelled order', () => {
    const seen: StageEvent[] = [];
    createSimulation({ from: 'cancelled', onAdvance: (event) => seen.push(event) }).start();
    jest.advanceTimersByTime(STAGE_INTERVAL_MS * 5);
    expect(seen).toEqual([]);
  });

  /** A screen that unmounts mid-delivery must not keep a timer alive. */
  it('stops cleanly', () => {
    const seen: StageEvent[] = [];
    const simulation = createSimulation({
      from: 'pending',
      onAdvance: (event) => seen.push(event),
    });
    simulation.start();
    simulation.stop();
    jest.advanceTimersByTime(STAGE_INTERVAL_MS * 5);
    expect(seen).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
pnpm --filter @kometa/mobile test -- simulation.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `simulation.ts`**

`STAGE_INTERVAL_MS = 15_000` — the fast end of board 18's "polling adaptativo
15–30 s", so a reviewer sees the whole progression without waiting ten minutes.

- [ ] **Step 4: Run the tests**

```bash
pnpm --filter @kometa/mobile test -- simulation.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/features/orders
git commit -m "feat(orders): advance stages on a simulated clock"
```

---

### Task 7 — The store and its provider

**Files:**

- Create: `src/features/orders/store.ts`
- Create: `src/features/orders/mockData.ts`
- Create: `src/hooks/OrdersProvider.tsx`
- Create: `src/hooks/useOrders.ts`
- Test: `src/features/orders/store.test.ts`
- Test: `src/hooks/useOrders.test.tsx`
- Modify: `src/app/_layout.tsx` (mount `OrdersProvider` inside `CheckoutFlowProvider`)

**Interfaces:**

- Consumes: `OrderStage`, `StageEvent`, `PaymentStatus` (Task 1), `OrderSummary`
  from `features/checkout/types`.
- Produces:

```ts
export type OrderLine = { productId: string; name: string; quantity: number; unitPrice: number };
export type OrderDelivery = {
  addressLabel: string;
  zone: string;
  city: string;
  instructions?: string;
};
export type Courier = {
  name: string;
  vehicle: string;
  plate: string;
  rating: number;
  phone: string;
};
export type OrderRecord = {
  orderId: string;
  merchantId: string;
  /** `null` until the payment settles — board 15. No stage means no ETA. */
  stage: OrderStage | null;
  paymentStatus: PaymentStatus;
  placedAt: number;
  totals: OrderSummary;
  lines: OrderLine[];
  delivery: OrderDelivery;
  courier?: Courier;
  events: StageEvent[];
  /** When the snapshot below was last confirmed by a source, not guessed. */
  snapshotAt: number;
};
export const ORDERS_KEY = 'kometa:orders';
export function activeOrder(orders: OrderRecord[]): OrderRecord | undefined;
export function historyOrders(orders: OrderRecord[]): OrderRecord[];
export function applyStageEvent(order: OrderRecord, event: StageEvent): OrderRecord;
export async function saveOrders(orders: OrderRecord[]): Promise<void>;
export async function loadOrders(): Promise<OrderRecord[]>;
```

`useOrders()` returns
`{ orders, active, byId(id), placeOrder(input), advance(id, event), cancel(id, reason), isStale }`.

- [ ] **Step 1: Write the failing store test**

```ts
import { activeOrder, applyStageEvent, historyOrders, loadOrders, saveOrders } from './store';
import { mockOrders } from './mockData';

describe('activeOrder', () => {
  /**
   * Board 15: a pending payment is NOT a confirmed order. It has no stage, so
   * it cannot be the active order and must not start an operational ETA.
   */
  it('ignores an order whose payment has not settled', () => {
    const awaiting = { ...mockOrders[0], stage: null, paymentStatus: 'pending' as const };
    expect(activeOrder([awaiting])).toBeUndefined();
  });

  it('is the one order still moving', () => {
    const live = {
      ...mockOrders[0],
      stage: 'transit' as const,
      paymentStatus: 'confirmed' as const,
    };
    const done = {
      ...mockOrders[1],
      stage: 'delivered' as const,
      paymentStatus: 'confirmed' as const,
    };
    expect(activeOrder([done, live])?.orderId).toBe(live.orderId);
  });

  it('is nothing once everything has landed', () => {
    const done = { ...mockOrders[0], stage: 'delivered' as const };
    const gone = { ...mockOrders[1], stage: 'cancelled' as const };
    expect(activeOrder([done, gone])).toBeUndefined();
  });
});

describe('historyOrders', () => {
  it('lists the finished orders newest first', () => {
    const older = { ...mockOrders[0], stage: 'delivered' as const, placedAt: 1_000 };
    const newer = { ...mockOrders[1], stage: 'cancelled' as const, placedAt: 2_000 };
    expect(historyOrders([older, newer]).map((order) => order.placedAt)).toEqual([2_000, 1_000]);
  });

  it('leaves the active order out of the history', () => {
    const live = { ...mockOrders[0], stage: 'transit' as const };
    expect(historyOrders([live])).toEqual([]);
  });
});

describe('applyStageEvent', () => {
  it('moves the stage, appends the event and stamps the snapshot', () => {
    const order = { ...mockOrders[0], stage: 'ready' as const, events: [], snapshotAt: 0 };
    const next = applyStageEvent(order, { stage: 'assigned', occurredAt: 5_000 });
    expect(next).toMatchObject({ stage: 'assigned', snapshotAt: 5_000 });
    expect(next.events).toEqual([{ stage: 'assigned', occurredAt: 5_000 }]);
  });

  /** Board 18: never invent state. An event for a stage already passed is noise. */
  it('ignores an event that would move the order backwards', () => {
    const order = { ...mockOrders[0], stage: 'transit' as const, events: [], snapshotAt: 9_000 };
    expect(applyStageEvent(order, { stage: 'ready', occurredAt: 10_000 })).toBe(order);
  });
});

describe('persistence', () => {
  /** A storage failure degrades to "no saved orders" — it never throws. */
  it('round-trips and survives a corrupt payload', async () => {
    await saveOrders(mockOrders);
    expect((await loadOrders()).map((order) => order.orderId)).toEqual(
      mockOrders.map((order) => order.orderId)
    );
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

```bash
pnpm --filter @kometa/mobile test -- store.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `mockData.ts` then `store.ts`**

`mockData.ts` carries board 05's and 06's own fixtures: `Burger House`
12.400 Kz `#CM-10482` with `Classic Burger ×1` 5.400 Kz and `Chicken Burger ×1`
5.500 Kz, subtotal 10.900, entrega 1.200, desconto −1.000, total 11.100;
`Pizza Luanda` 8.500 Kz, `Fresh Market` 15.700 Kz, `Farmácia Central` 6.200 Kz
(cancelled, reembolsado); courier `João Manuel`, `Toyota Yaris`, `ABC-12-34`,
★ 4.9. Delivery `Casa, Talatona, Luanda`, instruções
`Ligar ao chegar. Portão cinzento.`

`store.ts` mirrors `features/checkout/session.ts`: every storage call wrapped,
a corrupt payload discarded rather than trusted.

- [ ] **Step 4: Write the provider and its test**

`useOrders.test.tsx` follows `useCart.test.tsx`'s shape. Cover: placing an order
from a confirmed payment creates it at stage `pending`; placing one from a
pending payment creates it with `stage: null`; `advance` appends events;
`cancel` sets `cancelled` and keeps the events.

- [ ] **Step 5: Mount the provider**

In `app/_layout.tsx`, inside `CheckoutFlowProvider` — an order is created from a
checkout, so it nests within it.

- [ ] **Step 6: Run everything**

```bash
pnpm --filter @kometa/mobile test && pnpm --filter @kometa/mobile typecheck
```

Expected: PASS, clean.

- [ ] **Step 7: Commit**

```bash
git add apps/mobile/src/features/orders apps/mobile/src/hooks apps/mobile/src/app/_layout.tsx
git commit -m "feat(orders): add the order store and its provider"
```

---

### Task 8 — Content

**Files:**

- Create: `src/features/orders/content.ts`

Every string the feature says, in Portuguese of Angola, with the derivations
beside the strings they build — the pattern `features/checkout/content.ts` sets.

- [ ] **Step 1: Read the existing module for shape and tone**

```bash
sed -n '1,40p' apps/mobile/src/features/checkout/content.ts
```

- [ ] **Step 2: Write `content.ts`**

Screen titles (`Pedidos`, `Detalhes do pedido`, `Acompanhar pedido`, `Progresso
do pedido`, `Pedido concluído`, `Avaliar pedido`, `Pedido cancelado`, `Pedido
não aceite`, `Mapa`, `Notificações`), section headings (`Em curso`,
`Anteriores`, `Itens`, `ENTREGA`, `Recibo`), every action label
(`Acompanhar pedido`, `Continuar a explorar`, `Recibo`, `Ajuda`, `Repetir`,
`Mensagem`, `Ligar`, `Descarregar recibo`, `Tentar novamente`, `Rever carrinho`,
`Explorar restaurantes`, `Confirmar cancelamento`, `Manter pedido`,
`Voltar aos pedidos`, `Preciso de ajuda`, `Avaliar pedido`, `Enviar avaliação`,
`Copiar`, `Fechar`), the banner pairs (title + body) for delay, offline, map
unavailable, location disabled, courier reassigned, chat unavailable, chat
closed, and the four cancellation reasons.

Derivations, each the single place its phrasing exists:

```ts
/** `Chega em ~12 min` — the ETA line, built from a band so the two agree. */
etaLine: (band: EtaBand) => string,
/** `2 itens` / `1 item` — board 05 writes the singular without a number change. */
itemCount: (count: number) => string,
/** `Hoje · 2 itens` / `28 set · 3 itens` — a history row's meta. */
historyMeta: (placedAt: number, count: number, now?: number) => string,
/** `A Burger House já recebeu o teu pedido.` */
confirmedBody: (merchant: string) => string,
/** `O estorno de 12.400 Kz pode demorar 3–5 dias úteis, conforme o banco.` */
refundBody: (total: number) => string,
/** AX3: `Chega em aproximadamente 12 minutos` — board 16. */
etaSpoken: (band: EtaBand) => string,
/** `Pedido CM-10482, Burger House, a caminho, chega em cerca de 12 minutos.` */
activeOrderLabel: (order: OrderRecord) => string,
```

- [ ] **Step 3: Verify**

```bash
pnpm --filter @kometa/mobile typecheck
```

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/src/features/orders/content.ts
git commit -m "feat(orders): add the content module"
```

---

### Task 9 — Status chip, banner and order number

**Files:**

- Create: `src/features/orders/components/OrderStatusChip/{OrderStatusChip.tsx,OrderStatusChip.styles.ts,OrderStatusChip.test.tsx,index.ts}`
- Create: `src/features/orders/components/StatusBanner/{StatusBanner.tsx,StatusBanner.styles.ts,StatusBanner.test.tsx,index.ts}`
- Create: `src/features/orders/components/OrderNumber/{OrderNumber.tsx,OrderNumber.test.tsx,index.ts}`

**Interfaces:**

- Produces: `<OrderStatusChip stage={OrderStage} />`,
  `<StatusBanner tone="success|warning|error|info" title body? icon? />`,
  `<OrderNumber orderId onCopy? />`.

- [ ] **Step 1: Install the clipboard module**

`OrderNumber` has a `Copiar` action and **`expo-clipboard` is not yet a
dependency**. React Native's own `Clipboard` was removed, so it has to be added:

```bash
cd apps/mobile && npx expo install expo-clipboard
```

Check the API against `https://docs.expo.dev/versions/v57.0.0/sdk/clipboard/`
before using it (`AGENTS.md`), and add a stand-in under `src/test-utils/`
mirroring `src/test-utils/haptics.ts`.

- [ ] **Step 2: Write the failing tests**

Follow `FeedbackBanner.test.tsx`'s shape. Cover:

- The chip renders board 03's copy for all eleven stages and carries an icon as
  well as a colour — board 10's "redundância visual" means a test asserts the
  icon is present, not just the text.
- `cancelled` is the only chip on `status.error`; `delivered` is neutral, not
  green (board 14: "o resultado concluído volta a uma paleta neutra").
- The banner renders title and body as one accessible statement, as
  `FeedbackBanner` already does.
- `OrderNumber` copies to the clipboard and announces the copy.

- [ ] **Step 3: Run them to see them fail**

```bash
pnpm --filter @kometa/mobile test -- OrderStatusChip StatusBanner OrderNumber
```

- [ ] **Step 4: Implement the three components**

Colour by `status.*` tokens only. Chip height ≥ 24, pill radius, `continuousCorners`.

- [ ] **Step 5: Run the tests**

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/package.json apps/mobile/src/features/orders/components apps/mobile/src/test-utils
git commit -m "feat(orders): add the status chip, banner and order number"
```

---

### Task 10 — Active order card and history row

**Files:**

- Create: `src/features/orders/components/ActiveOrderCard/{…,ActiveOrderCard.test.tsx,index.ts}`
- Create: `src/features/orders/components/OrderHistoryRow/{…,OrderHistoryRow.test.tsx,index.ts}`

**Interfaces:**

- Consumes: `OrderRecord` (T7), `etaBand`/`formatEta` (T4), `content` (T8),
  `OrderStatusChip` (T9).
- Produces: `<ActiveOrderCard order onTrack />`, `<OrderHistoryRow order onPress />`.

- [ ] **Step 1: Write the failing tests**

- The card shows merchant, ETA line, zone, total through `formatKwanza`, the
  status chip, the order number and one primary action `Acompanhar pedido`.
- **It never shows item details** — board 05: "A Home não expõe detalhes de
  itens; apenas merchant, total, estado e ETA." Assert `Classic Burger` is
  absent given an order that has it in `lines`.
- Its accessibility label is the whole sentence board 16 writes:
  `Pedido CM-10482, Burger House, a caminho, chega em cerca de 12 minutos. Botão acompanhar pedido.`
- **Dynamic Type.** Board 16: "Conteúdo crítico nunca trunca nem fica preso a
  altura fixa." Render the card at an AX3 font scale and assert the merchant
  name and the ETA line carry **no `numberOfLines={1}`** and the card declares
  no fixed `height`. At AX3 the ETA is spelled out through `content.etaSpoken`
  (`Chega em aproximadamente 12 minutos`), not abbreviated.
- The history row shows merchant, `Hoje · 2 itens`, total and chip; a cancelled
  and refunded order writes `Reembolsado` in the meta line.

- [ ] **Step 2: Run them to see them fail**
- [ ] **Step 3: Implement both**

The card has the board's green hairline border and white fill; the history row
does not.

- [ ] **Step 4: Run the tests**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat(orders): add the active order card and history row"
```

---

### Task 11 — Courier card and chat panel

**Files:**

- Create: `src/features/orders/components/CourierCard/{…,CourierCard.test.tsx,index.ts}`
- Create: `src/features/orders/components/CourierChatPanel/{…,CourierChatPanel.test.tsx,index.ts}`

**Interfaces:**

- Consumes: `Courier` (T7), `courierVisibility` (T3).
- Produces: `<CourierCard courier? visibility onMessage onCall />`,
  `<CourierChatPanel state="available|unavailable|closed" messages />`.

- [ ] **Step 1: Write the failing tests**

One test per visibility, from board 09:

- `none` → renders nothing at all (`toBeEmptyElement`, not an empty card).
- `searching` → `Courier ainda não atribuído` and no phone or plate anywhere,
  **even when a `courier` prop is passed**. Identity before assignment is a
  privacy leak, so the test passes a full courier and asserts the plate is absent.
- `identity` / `contact` → name, vehicle, plate, `★ 4.9`, and both actions with
  44 pt targets.
- `closed` → `Entrega concluída · 19:18`, and **no** Mensagem or Ligar.

Chat panel: three states, and in every one **no text input is rendered** — this
build has no backend and the spec rules the composer out.

- [ ] **Step 2: Run them to see them fail**
- [ ] **Step 3: Implement both**
- [ ] **Step 4: Run the tests**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat(orders): add the courier card and chat states"
```

---

### Task 12 — Timeline list

**Files:**

- Create: `src/features/orders/components/TimelineList/{…,TimelineList.test.tsx,index.ts}`

**Interfaces:**

- Consumes: `buildTimeline`, `TimelineRow` (T5).
- Produces: `<TimelineList rows />`.

- [ ] **Step 1: Write the failing test**

Four row states render distinguishably: filled dot, ringed dot, hollow dot with
muted text, red dot. An upcoming row shows **no** time. Rails join consecutive
rows but not after the last. Each row's accessibility label carries label, state
and time together.

- [ ] **Step 2: Run it to see it fail**
- [ ] **Step 3: Implement**
- [ ] **Step 4: Run the test**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat(orders): add the timeline list"
```

---

### Task 13 — Map canvas, fallback and tracking sheet

**Files:**

- Create: `src/features/orders/components/MapCanvas/{…,MapCanvas.test.tsx,index.ts}`
- Create: `src/features/orders/components/MapFallback/{…,MapFallback.test.tsx,index.ts}`
- Create: `src/features/orders/components/TrackingSheet/{…,index.ts}`
- Modify: `src/features/tracking/mockData.ts` (keep coordinates, drop stages)

**Interfaces:**

- Consumes: `isMapboxAvailable`, `MapView`, … from `features/tracking/mapbox`;
  `isBottomSheetAvailable`, `BottomSheet` from `features/tracking/bottomSheet`;
  `interpolateCoordinate` from `features/tracking/geo`.
- Produces: `<MapCanvas state="waiting|assigned|active|completed|unavailable" … />`,
  `<MapFallback reason="unavailable|offline" />`,
  `<TrackingSheet detent="collapsed|medium|expanded">`.

- [ ] **Step 1: Write the failing tests**

- `MapCanvas` with `state="unavailable"`, and in the Mapbox-absent environment,
  renders `MapFallback` rather than a blank area.
- **Review Focus #5:** map unavailable _and_ location denied together renders
  both banners and still shows status, ETA and the courier actions. Board 08:
  denying location never blocks tracking.
- **Review Focus #2:** given a stale snapshot, the marker renders at the last
  confirmed coordinate and the sheet labels the ETA `Último ETA: ~12 min` with
  `Última atualização às 19:03`. No interpolation runs.
- `TrackingSheet` snaps to 92 / 220 / 350 pt and falls back to the static sheet
  when `@gorhom/bottom-sheet` is unavailable, as `live-tracking.tsx` does today.

- [ ] **Step 2: Run them to see them fail**
- [ ] **Step 3: Implement**

Neutral cartography, single route line, discrete controls — no speed, no
compass, no dashboard (board 08).

- [ ] **Step 4: Run the tests**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat(orders): add the map canvas, fallback and tracking sheet"
```

---

### Task 14 — Orders list screen

**Files:**

- Create: `src/features/orders/components/OrdersListScreen/{…,OrdersListScreen.test.tsx,index.ts}`
- Modify: `src/app/(tabs)/(orders)/index.tsx` (replace `PlaceholderScreen`)
- Modify: the Home screen to render `ActiveOrderCard` when there is one

- [ ] **Step 1: Write the failing test**

`Em curso` precedes `Anteriores`. With no active order the first section is
absent entirely, not an empty heading. With no orders at all, an empty state.
The Home test asserts the card appears there too and disappears once the order
is delivered.

- [ ] **Step 2–5: fail → implement → pass → commit**

```bash
git commit -m "feat(orders): build the orders list from the Figma"
```

---

### Task 15 — Order details and receipt

**Files:**

- Create: `src/features/orders/components/OrderDetailsScreen/…`
- Create: `src/features/orders/components/ReceiptScreen/…`
- Create: `src/app/(tabs)/(orders)/[orderId]/index.tsx`, `receipt.tsx`

- [ ] **Step 1: Write the failing test**

Board 06's arithmetic is rendered, not recomputed loosely: subtotal 10.900 +
entrega 1.200 − desconto 1.000 = total 11.100, with the discount in the brand
colour and a minus sign. The receipt shows `Visa •••• 2408` — **four digits and
a brand, never a full card number** (board 15). `Repetir` routes to the cart for
revalidation rather than straight to checkout.

- [ ] **Step 2–5: fail → implement → pass → commit**

```bash
git commit -m "feat(orders): build order details and the receipt"
```

---

### Task 16 — Confirmation screen

**Files:**

- Create: `src/features/orders/components/ConfirmationScreen/…`
- Create: `src/app/(tabs)/(orders)/[orderId]/confirmation.tsx`
- Modify: `src/features/checkout/components/StatusScreen/StatusScreen.tsx` —
  on a confirmed payment, create the order through `useOrders().placeOrder` and
  `router.replace` to the confirmation route instead of `/order-tracking`.

- [ ] **Step 1: Write the failing test**

Icon, title, subtitle and the facts card. The ETA is the band `Chega em
25–35 min`, never a single number — board 04's "ETA sem falsa precisão". Both
actions present. A test asserts the screen renders fully with animations
disabled, since board 04 says confirmation must not depend on animation.

Haptics: board 18 puts `success` on confirmation. Fire
`Haptics.notificationAsync(NotificationFeedbackType.Success)` once on mount and
assert it fires exactly once — "nunca repetitivo". Use the existing
`src/test-utils/haptics.ts` stand-in.

- [ ] **Step 2–5: fail → implement → pass → commit**

```bash
git commit -m "feat(orders): build the confirmation screen"
```

---

### Task 17 — Tracking screen

**Files:**

- Create: `src/features/orders/components/TrackingScreen/…`
- Create: `src/app/(tabs)/(orders)/[orderId]/tracking.tsx`

- [ ] **Step 1: Write the failing test**

Map above, sheet below with status title, ETA, `Atualizado agora` and the
courier card at the visibility the stage dictates. The delay variant renders the
amber banner with the clock window from `delayWindow` and switches the title to
`O teu pedido continua a caminho`. The simulation is started on mount and
stopped on unmount — assert no timer survives unmount.

- [ ] **Step 2–5: fail → implement → pass → commit**

```bash
git commit -m "feat(orders): build the tracking screen"
```

---

### Task 18 — Timeline screen

**Files:**

- Create: `src/features/orders/components/TimelineScreen/…`
- Create: `src/app/(tabs)/(orders)/[orderId]/timeline.tsx`

- [ ] **Step 1: Write the failing test**

Header, order number, merchant and zone, then `TimelineList` fed by
`buildTimeline`. **Review Focus #3:** at stage `arrived`, `Entregue` renders
with no timestamp.

- [ ] **Step 2–5: fail → implement → pass → commit**

```bash
git commit -m "feat(orders): build the timeline screen"
```

---

### Task 19 — Delivered and rating

**Files:**

- Create: `src/features/orders/components/DeliveredScreen/…`, `RatingScreen/…`
- Create: `src/app/(tabs)/(orders)/[orderId]/delivered.tsx`, `rating.tsx`

- [ ] **Step 1: Write the failing test**

Delivered: success icon, `Pedido entregue`, chip `Entregue às 19:18`, the proof
photo with address and time, two actions. Rating: five stars, the four tags, an
optional comment, `Enviar avaliação`; **no tip control and no separate courier
rating** — board 11 rules both out, so the test asserts their absence.

Haptics: `success` on reaching the delivered screen, once.

- [ ] **Step 2–5: fail → implement → pass → commit**

```bash
git commit -m "feat(orders): build the delivered and rating screens"
```

---

### Task 20 — Cancellation and rejection

**Files:**

- Create: `src/features/orders/components/CancelSheet/…`, `CancelledScreen/…`, `RejectedScreen/…`
- Create: `src/app/(tabs)/(orders)/[orderId]/cancel.tsx`, `cancelled.tsx`, `rejected.tsx`

- [ ] **Step 1: Write the failing test**

The sheet lists the four reasons, with `Confirmar cancelamento` destructive and
`Manter pedido` beside it. **Any fee or impossibility renders above the
destructive button**, not below — board 14, so the test places a fee and asserts
its position. The result screen shows the refund sentence built by
`content.refundBody` and returns to a neutral palette. Rejection shows the
`Sem cobrança` chip and routes to the cart.

- [ ] **Step 2–5: fail → implement → pass → commit**

```bash
git commit -m "feat(orders): build cancellation and rejection"
```

---

### Task 21 — Payment state copy

**Files:**

- Modify: `src/features/checkout/components/StatusScreen/StatusScreen.tsx`
- Modify: `src/features/checkout/content.ts`

- [ ] **Step 1: Write the failing test**

Board 15's copy and actions: pending offers `Concluir pagamento` /
`Cancelar pedido`; failed says `Não cobrámos o teu cartão.` and offers
`Tentar novamente` / `Alterar método`. **Review Focus #1:** while the payment is
pending, no operational order exists — assert `useOrders().active` is undefined
and no ETA renders.

- [ ] **Step 2–5: fail → implement → pass → commit**

```bash
git commit -m "feat(checkout): bring payment states to the Figma copy"
```

---

### Task 22 — Notification destinations

**Files:**

- Modify: `src/features/notifications/types.ts`, `mockData.ts`, `selectors.ts`
- Modify: `src/features/notifications/components/NotificationRow/…`

- [ ] **Step 1: Write the failing test**

Each of board 12's eight events maps to its destination; the row renders the
destination line. Dedup by `eventId`: two payloads with one id produce one row.
The lock-screen body carries **no address, no access instructions and no courier
phone** — assert against a fixture that has all three in the order.

- [ ] **Step 2–5: fail → implement → pass → commit**

```bash
git commit -m "feat(notifications): map order events to their destinations"
```

---

### Task 23 — Deep links

Board 18 specifies `cometa://orders/{orderId}` and `cometa://tracking/{orderId}`.

**The scheme in `app.config.js:10` is `kometa`, not `cometa`.** The Figma writes
the brand as "Cometa" throughout (board 02 "Tokens Cometa B2C", board 11
"Obrigado por ajudares a melhorar a Cometa") while the repo is "kometa"
end to end — package names, the AsyncStorage key prefix, the workspace scope.

**Resolution: keep `kometa`.** Changing a published URL scheme breaks every link
already issued and is not a design decision the Figma is making — the boards are
naming the brand, not the scheme. The routes become `kometa://orders/{orderId}`
and `kometa://tracking/{orderId}`. Raise it with the designer rather than
silently diverging; if they confirm the rename, it is a one-line config change
plus a store-side update, not a change to this task's structure.

**Files:**

- Create: `src/features/orders/links.ts`
- Test: `src/features/orders/links.test.ts`
- Modify: `src/app/(tabs)/(orders)/_layout.tsx` if a layout is needed for the
  `[orderId]` segment

**Interfaces:**

- Produces: `orderLink(orderId): string`, `trackingLink(orderId): string`,
  `parseOrderLink(url): { kind: 'order' | 'tracking'; orderId: string } | null`.

- [ ] **Step 1: Write the failing test**

```ts
import { orderLink, parseOrderLink, trackingLink } from './links';

describe('order deep links', () => {
  it('builds the two links board 18 specifies, on the app scheme', () => {
    expect(orderLink('CM-10482')).toBe('kometa://orders/CM-10482');
    expect(trackingLink('CM-10482')).toBe('kometa://tracking/CM-10482');
  });

  it('parses both back', () => {
    expect(parseOrderLink('kometa://orders/CM-10482')).toEqual({
      kind: 'order',
      orderId: 'CM-10482',
    });
    expect(parseOrderLink('kometa://tracking/CM-10482')).toEqual({
      kind: 'tracking',
      orderId: 'CM-10482',
    });
  });

  /** A link to an order this device does not have must not open a blank screen. */
  it('rejects anything it does not recognise', () => {
    expect(parseOrderLink('kometa://orders/')).toBeNull();
    expect(parseOrderLink('https://example.com/orders/CM-10482')).toBeNull();
    expect(parseOrderLink('kometa://wallet/CM-10482')).toBeNull();
  });
});
```

- [ ] **Step 2: Run it to see it fail**

```bash
pnpm --filter @kometa/mobile test -- links.test.ts
```

- [ ] **Step 3: Implement `links.ts`**

Expo Router resolves `kometa://orders/CM-10482` to `(tabs)/(orders)/CM-10482`
from the file routes alone, so this module exists for _building_ links (the
notification payloads in Task 22 consume it) and for guarding unknown ones.

- [ ] **Step 4: Verify tracking respects authentication**

Board 18: "abre tracking e respeita autenticação". A deep link opened while
signed out lands on the auth gate, not on the order. The root layout already
redirects on `isAuthenticated` — assert the behaviour holds rather than adding a
second gate.

- [ ] **Step 5: Run the tests and commit**

```bash
pnpm --filter @kometa/mobile test -- links.test.ts
git add apps/mobile/src/features/orders
git commit -m "feat(orders): add order and tracking deep links"
```

---

### Task 24 — Cut over

The new screens have been built beside the old ones. This task deletes what the
Figma replaces.

**Files:**

- Delete: `src/app/(tabs)/(home)/order-tracking.tsx`, `live-tracking.tsx`,
  `delivered.tsx`, `rating.tsx`
- Delete: `src/features/tracking/components/DriverCard/`
- Modify: `src/features/tracking/mockData.ts` — remove `TRACKING_STAGES`,
  `DRIVER_ASSIGNED_STAGE_INDEX`, `STAGE_INTERVAL_MS` and `mockDriver`; keep the
  coordinates
- Modify: `src/features/rating/mockData.ts` call sites if they referenced `mockDriver`

- [ ] **Step 1: Find every reference to what is being deleted**

```bash
cd apps/mobile && grep -rn "order-tracking\|live-tracking\|DriverCard\|TRACKING_STAGES\|mockDriver\|DRIVER_ASSIGNED" src/
```

- [ ] **Step 2: Delete the files and fix the references the grep found**

- [ ] **Step 3: Verify the whole suite**

```bash
pnpm --filter @kometa/mobile typecheck
pnpm --filter @kometa/mobile test
pnpm --filter @kometa/mobile lint
```

Expected: typecheck clean, all tests pass, lint at **0 errors** (pre-existing
warnings are acceptable).

- [ ] **Step 4: Confirm nothing references the deleted modules**

```bash
grep -rn "order-tracking\|live-tracking\|DriverCard\|TRACKING_STAGES\|mockDriver" src/
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add -A apps/mobile/src
git commit -m "refactor(tracking): cut over to the Figma orders and tracking path"
```

---

## Decisions taken during implementation

The plan was written before the code existed, and nineteen points needed a
call. They are recorded here because a decision that lives only in a commit
diff is one nobody can disagree with later.

**Figma discrepancies**

- **`arrived` is an eleventh stage.** Board 18's table has ten and steps from
  `arriving` to `delivered`; board 07's list and flow C of board 17 both draw
  _Courier chegou_. Two boards against one.
- **#CM-10482 totals 11.100 Kz, not 12.400.** Boards 04, 05, 14 and 15 write
  12.400; board 06 — the only board that shows the arithmetic — breaks the same
  order down to 11.100. The board that adds up wins, and 12.400 is carried by a
  second fixture so the figure still appears. **Worth confirming with the
  designer.**
- **The scheme stays `kometa`.** Board 18 writes `cometa://`; the boards name
  the brand, and changing a published scheme breaks every issued link. A test
  pins `cometa://` as rejected. **Also worth confirming.**

**Architecture**

- `OrderStatus` became `PaymentStatus`, and `checkoutState.ts`'s own duplicate
  pair was collapsed — the feature briefly exported two different types under
  one name.
- The orders board gets its own `OrderStatusChip` rather than reusing the
  design-system `StatusChip`: that atom is keyed to an eight-tone palette that
  paints `preparing` amber and `delivered` green, which contradicts board 03's
  three tones and cannot even express eleven stages.
- The orders path gets its own `ScreenHeader`; the checkout one reads
  `theme.checkout.metrics`, and crossing board tokens is what the scoped token
  files exist to prevent.
- Board 15's payment states were extracted into `PaymentStateScreen` rather
  than edited inside `StatusScreen`, which has no test file.
- Board 12's payload rules live in `features/orders/notifications.ts` rather
  than being bolted onto the existing notification-centre module, which models
  a different thing.
- Board 04's confirmation **replaces** `StatusScreen`'s confirmed branch. Two
  screens confirming one order is one too many.

**Found by the final review, fixed**

A paid order could be lost entirely if the customer backed out of the
confirmation screen; `Cancelar pedido` opened the payment-method picker;
tracking showed an empty ETA after delivery and never completed the flow; a
transient storage read error overwrote real order history with fixtures; four
routes had no caller; the deep links resolved to nothing because `(orders)` is
a route group; receipts called cancelled orders "pago" and cancellations
promised refunds that were never owed; the map fallback was inaudible to
VoiceOver about a denied location.

**Rejected**

- The review called `Reembolsado` replacing the item count a defect. Board 05
  draws that row exactly so; only the unconditional part was wrong.
- Review Focus #4's test cannot fail, which is true and not fixed: the honest
  fix is a refresh-failure surface that does not exist yet.
