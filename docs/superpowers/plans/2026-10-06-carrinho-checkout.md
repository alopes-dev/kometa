# Carrinho & Checkout — Implementation Plan

**Goal:** Rebuild the cart and checkout path against Figma page `67:4561`
(`CART & CHECKOUT`), covering every state the 19 boards draw without a network
call.

**Spec:** `docs/superpowers/specs/2026-10-06-carrinho-checkout-design.md`

**Architecture:** `features/checkout/` grows from a handful of helpers into the
module that owns the domain: pricing, the minimum-order rule, promotions,
revalidation and the state machine, all as pure functions with the screens'
components beside them. `CartProvider` gains availability and a merchant
conflict; `CheckoutFlowProvider` is rewritten around the Figma's delivery /
payment / order model and loses the tip, the schedule and the delivery-type
split that no board draws. The new screens are built alongside the old ones; the
last task cuts over and deletes what the Figma replaced.

**Tech Stack:** Expo SDK 57, React Native 0.86, React 19.2.3, Reanimated 4.5.1,
styled-components 6, expo-image, expo-haptics, AsyncStorage, jest-expo +
@testing-library/react-native.

## Global Constraints

- **Read `https://docs.expo.dev/versions/v57.0.0/` before writing code** — `AGENTS.md`.
- Colour comes from semantic tokens only. The board's `#1BAC4B` maps to
  `brand.base`; never freeze a board hex.
- Geometry and type steps live in `theme/checkout.ts`, each named for its node.
- Money always through `formatKwanza`. No cents, `Kz` after the value.
- Copy lives in `features/checkout/content.ts`. Portuguese of Angola: short,
  direct, never punitive.
- Every state carries an icon **and** text — colour alone never carries meaning.
- Touch targets ≥ 44 pt. The CTA is 54 pt tall and sits above the safe area.
- Motion 150/220/300/350ms, honouring `useReducedMotion`.
- Tests: `pnpm --filter @kometa/mobile test`. Types: `pnpm --filter @kometa/mobile typecheck`.

## Review Focus

Conditions the spec implies that no happy path exercises.

1. **A payment timeout is not a failure.** `processing` that exceeds the limit
   moves to `pending`, never to `failed`. → Task 5.
2. **Retry must not duplicate.** Two taps on `Tentar novamente` reuse one
   idempotency key, so one order exists. → Task 6.
3. **An unavailable item changes the total and the promo.** Removing it from the
   count can push the subtotal under the promo minimum — the discount falls away
   and the total goes _up_. → Task 2 + Task 4.
4. **Below-minimum and missing-payment at once.** The CTA has one slot; the
   blocking reason closest to the cart wins. → Task 5.
5. **Restoring a session whose prices moved.** The resumed cart renders the
   change for acceptance before the checkout unlocks. → Task 4 + Task 6.
6. **One merchant per cart.** Adding from another merchant asks before it
   replaces, and declining leaves the first cart untouched. → Task 7.

---

### Task 1 — Tokens and copy

`theme/checkout.ts` (type steps + metrics measured per node) and
`features/checkout/content.ts` (every string, plus the derivations: progress
label, remaining-to-minimum, CTA label per state).

### Task 2 — Pricing and the minimum rule

Rewrite `pricing.ts` to the board's four lines. `DeliveryMode = 'normal' | 'free'
| 'dynamic'` with its explanation. Delete VAT and tip. Add `minimum.ts`:
remaining, ratio, met.

### Task 3 — Promotions

`promotions.ts`: `PromoState = 'idle' | 'validating' | 'applied' | 'invalid' |
'expired' | 'minimum-not-met'`. Fixtures: `COMETA1500` (−1.500 Kz, min 10.000),
`EXPIRADO`, and the unknown code. The code stays in the field on failure.

### Task 4 — Availability and revalidation

`availability.ts`: item availability, price changes, merchant closed, delivery
area. `revalidateCart` returns the list of changes to accept, and the cart stays
`invalid` until they are accepted.

### Task 5 — The state machine

`checkoutState.ts`: the four state sets from board 19, `deriveCheckoutStatus`,
and `deriveCtaContract` (label, tone, enabled, icon) — the single place the
button's seven states are decided.

### Task 6 — Order submission and session persistence

`order.ts`: idempotent `submitOrder` keyed per attempt, `pending` on timeout,
`orderId` persisted before confirmation. `session.ts`: save/restore through
AsyncStorage with the resume prompt.

### Task 7 — Cart and checkout providers

`CartProvider` gains `availability`, `setQuantity`, `removeItem` and the merchant
conflict. `CheckoutFlowProvider` is rewritten around delivery/payment/order.

### Task 8 — Shared components

`FeedbackBanner`, `SelectionRow`, `CheckoutAction`, `OrderSummaryCard`,
`MerchantContext`, `FormField`.

### Task 9 — Cart components

`CartItemRow` (default/editing/unavailable/updating), `MinimumProgress`,
`SuggestedAddOn`, `PromoRow`, `CartSkeleton`, `EmptyCart`, `ConfirmDialog`.

### Task 10 — Cart screen

Boards 04–08, 15, 16 assembled: loading, ready, below-minimum, invalid,
updating, empty.

### Task 11 — Promotion screen

Board 09, every state.

### Task 12 — Address and instructions

Boards 10 and 11: selected address with area check, list, manual form,
instructions with counter, chips and `+244` contact.

### Task 13 — Payment screen

Board 12: selected, unselected, unavailable with retry.

### Task 14 — Review and processing

Boards 13, 14: review rows and the CTA contract wired to the machine.

### Task 15 — Confirmation

Board 17: pending, failed, confirmed.

### Task 16 — Cut over

Route the new screens, delete `delivery-type`, `schedule`, the old `address`,
`payment-method/*` and the old `checkout.tsx`, and remove the tip and VAT from
every call site.
