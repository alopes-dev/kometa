# Product Detail & Customization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the product detail screen against Figma page `64:2470`, covering everything it renders without a network call.

**Architecture:** A new `features/product/` module owns the customization model, pricing and validation as pure functions, and the screen's components. It is built alongside the existing screen so nothing breaks mid-flight; the final task cuts over and deletes the old code. `CartProvider` stops deriving prices and takes the unit price from its caller.

**Tech Stack:** Expo SDK 57, React Native 0.86, React 19.2.3, Reanimated 4.5.1, styled-components 6, expo-image, expo-haptics, jest-expo + @testing-library/react-native.

**Spec:** `docs/superpowers/specs/2026-10-03-produto-personalizacao-design.md`

## Global Constraints

- **Read `https://docs.expo.dev/versions/v57.0.0/` before writing code** — required by `AGENTS.md`.
- Colour comes from semantic tokens only. Never freeze a board hex. Brand stays `brand[600]` (`#0A7D53`), **not** the board's `#1BAC4B`.
- Geometry and type steps are transcribed from the board into `features/product/tokens.ts`, each named for the node it came from — the pattern `theme/business.ts` and `theme/product.ts` already use.
- Currency always via `formatKwanza` from `features/home/format.ts`: `9.700 Kz`, dot separator, no decimals, no foreign currency.
- All UI copy lives in `features/product/content.ts`. Portuguese of Angola: short, direct, never punitive.
- Touch targets ≥ 44×44pt. The CTA is 54pt tall.
- Motion: 150ms selection (ease-out), 300–350ms scroll-to-error (ease-in-out). Honour `useReducedMotion` — replace displacement with a crossfade ≤150ms.
- Validation renders in the **brand** ramp with its message, never red and never colour alone. Red is reserved for failures, which are out of scope here.
- Tests: `pnpm --filter @kometa/mobile test`. Types: `pnpm --filter @kometa/mobile typecheck`.

## Review Focus

Five conditions the spec implies that no task's happy path exercises. Each has a test pinned to the task that owns the code.

1. **A satisfied radio group must stay switchable.** Selecting a second option replaces the first; treating `max === 1` as a cap freezes the group on its first choice. → Task 3.
2. **Stale selections after a data change.** Persisted `groupId`/`optionId` values that no longer exist must be ignored, never produce `NaN` in the total. → Task 2.
3. **An undecided absolute group with extras already ticked.** The headline stays `"A partir de"` and must not add extras onto a base price that is not yet decided. → Task 2.
4. **`maxQuantity` absent, or equal to 1.** The stepper must not cap when the field is missing, and must dim `+` immediately when the cap is already met at mount. → Task 6.
5. **A long product name and a long option label.** The name wraps to two lines without truncating the price; an option label truncates before it pushes its cost off-screen. → Tasks 4 and 5.

---

### Task 1: Product model, fixtures and data access

Creates `features/product/` with the new model. `Product` is declared as `Omit<MenuItem, 'modifierGroups'> & {…}` so `features/home` is untouched and the repo keeps typechecking; Task 10 removes `modifierGroups` from `MenuItem` and drops the `Omit`.

**Files:**
- Create: `apps/mobile/src/features/product/types.ts`
- Create: `apps/mobile/src/features/product/mockData.ts`
- Create: `apps/mobile/src/features/product/data.ts`
- Test: `apps/mobile/src/features/product/data.test.ts`

**Interfaces:**
- Consumes: `MenuItem`, `ImageRef` from `features/home/types`.
- Produces: `Product`, `ModifierGroup`, `ModifierOption`, `ProductAttribute`, `getProductById(id: string): Product | undefined`, and the fixture ids `'r4-1'` (burger), `'r4-5'` (cola, no groups), `'r4-6'` (pizza, absolute group), `'r4-7'` (unavailable), `'r4-8'` (offer).

- [ ] **Step 1: Write the failing test**

```ts
// apps/mobile/src/features/product/data.test.ts
import { getProductById } from './data';

describe('getProductById', () => {
  it('returns undefined for an unknown id', () => {
    expect(getProductById('nope')).toBeUndefined();
  });

  it('returns a customizable product with min/max selection limits', () => {
    const burger = getProductById('r4-1');
    expect(burger?.name).toBe('Classic Burger');
    const bread = burger?.modifierGroups?.find((group) => group.id === 'pao');
    expect(bread).toMatchObject({ minSelections: 1, maxSelections: 1, pricing: 'delta' });
    const extras = burger?.modifierGroups?.find((group) => group.id === 'extras');
    expect(extras).toMatchObject({ minSelections: 0, maxSelections: 3, pricing: 'delta' });
  });

  it('returns a plain product with no modifier groups', () => {
    const cola = getProductById('r4-5');
    expect(cola?.modifierGroups).toBeUndefined();
    expect(cola?.attributes?.map((attribute) => attribute.value)).toEqual([
      'Coca-Cola',
      '1,5 L',
      'Disponível',
    ]);
  });

  it('prices the pizza size group absolutely, not as a delta', () => {
    const pizza = getProductById('r4-6');
    const size = pizza?.modifierGroups?.find((group) => group.id === 'tamanho');
    expect(size?.pricing).toBe('absolute');
    expect(size?.options.map((option) => option.price)).toEqual([5500, 7500]);
  });

  it('marks the unavailable product without removing its price or description', () => {
    const product = getProductById('r4-7');
    expect(product?.availability).toBe('unavailable');
    expect(product?.price).toBeGreaterThan(0);
    expect(product?.description).toBeTruthy();
  });

  it('carries offer metadata on the discounted product', () => {
    const sundae = getProductById('r4-8');
    expect(sundae?.price).toBe(2550);
    expect(sundae?.previousPrice).toBe(3000);
    expect(sundae?.offerLabel).toBe('−15% hoje');
  });

  it('keeps an unavailable option visible with its note', () => {
    const burger = getProductById('r4-1');
    const extras = burger?.modifierGroups?.find((group) => group.id === 'extras');
    const avocado = extras?.options.find((option) => option.id === 'extra-abacate');
    expect(avocado).toMatchObject({ available: false, unavailableNote: 'Indisponível hoje' });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @kometa/mobile test -- data.test`
Expected: FAIL — cannot resolve `./data`.

- [ ] **Step 3: Write the types**

```ts
// apps/mobile/src/features/product/types.ts
import type { Ionicons } from '@expo/vector-icons';
import type { SFSymbol } from 'expo-symbols';
import type { MenuItem } from '../home/types';

export type ModifierOption = {
  id: string;
  label: string;
  /** A delta when the group prices by 'delta', the whole base when 'absolute'. */
  price: number;
  /** Defaults to true. False keeps the row visible and dimmed — never removed. */
  available?: boolean;
  /** "Indisponível hoje" — rendered under the label when unavailable. */
  unavailableNote?: string;
};

/**
 * `required` and `type` are deliberately absent: both are derived from the
 * limits, and the derivation covers every group the board draws.
 *
 *   min 1 / max 1  → radio,    no counter   ("Escolha o pão")
 *   min 0 / max n  → checkbox, counter n/m  ("Extras", "Adicionar")
 */
export type ModifierGroup = {
  id: string;
  label: string;
  minSelections: number;
  maxSelections: number;
  /** 'absolute' replaces the base price (pizza size); 'delta' adds to it. */
  pricing: 'delta' | 'absolute';
  /**
   * The noun the validation message borrows: "o pão" → "Falta escolher o
   * pão." Carried rather than cut out of `label`, because "Escolha o pão"
   * and "Tamanho" do not yield it by the same rule.
   */
  errorNoun: string;
  options: ModifierOption[];
};

export type ProductAttribute = {
  id: string;
  /** Rendered only by the 'table' layout; the chip row shows values alone. */
  label: string;
  value: string;
  icon?: { name: keyof typeof Ionicons.glyphMap; sf?: SFSymbol };
  tone?: 'default' | 'positive';
};

/**
 * `Omit` is scaffolding: `MenuItem` still carries the retired `ModifierGroup`
 * shape, and intersecting the two would collide. Task 10 removes the field
 * from `MenuItem` and this becomes a plain intersection.
 */
export type Product = Omit<MenuItem, 'modifierGroups'> & {
  availability: 'available' | 'unavailable';
  /** "Volte a consultar mais tarde" — never a promised time. */
  unavailableNote?: string;
  maxQuantity?: number;
  attributes?: ProductAttribute[];
  /** 'table' is the pharmacy layout; it ships in the categories spec. */
  attributeLayout?: 'inline' | 'table';
  /** "−15% hoje". `previousPrice` is inherited from MenuItem. */
  offerLabel?: string;
  modifierGroups?: ModifierGroup[];
};
```

- [ ] **Step 4: Write the fixtures and data accessor**

`mockData.ts` exports `mockProducts: Product[]` covering the five cases the test names. Reuse the existing dish photos from `features/home/assets.ts`. The burger carries `pao` (min 1 / max 1, Brioche 0, Sesame 0) and `extras` (min 0 / max 3: Bacon 1000, Extra queijo 700, Cogumelos 500, Abacate 900 with `available: false` and `unavailableNote: 'Indisponível hoje'`). The pizza carries `tamanho` (absolute, Média 5500, Grande 7500) and the same extras. The unavailable product sets `availability: 'unavailable'` and `unavailableNote: 'Volte a consultar mais tarde'`. The cola sets `attributes` with `attributeLayout: 'inline'` and `maxQuantity: 6`.

```ts
// apps/mobile/src/features/product/data.ts
import { mockProducts } from './mockData';
import type { Product } from './types';

/** The only module anything outside this feature imports product data from. */
export function getProductById(id: string): Product | undefined {
  return mockProducts.find((product) => product.id === id);
}
```

- [ ] **Step 5: Run the tests and typecheck**

Run: `pnpm --filter @kometa/mobile test -- data.test && pnpm --filter @kometa/mobile typecheck`
Expected: PASS, no type errors.

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/src/features/product
git commit -m "feat(product): add customization model, fixtures and data access"
```

---

### Task 2: Pricing

**Files:**
- Create: `apps/mobile/src/features/product/pricing.ts`
- Test: `apps/mobile/src/features/product/pricing.test.ts`

**Interfaces:**
- Consumes: `Product`, `ModifierGroup` from Task 1; `CartSelection` from `hooks/CartProvider`; `formatKwanza` from `features/home/format`.
- Produces: `resolveBasePrice(product, selections): number`, `computeUnitPrice(product, selections): number`, `computeTotal(unitPrice, quantity): number`, `resolveHeadlinePrice(product, selections): HeadlinePrice`, `formatBreakdown(product, selections, quantity): string`.

```ts
export type HeadlinePrice =
  | { kind: 'from'; value: number }
  | { kind: 'variant'; value: number; variantLabel: string }
  | { kind: 'offer'; value: number; previous: number; savings: number }
  | { kind: 'exact'; value: number };
```

- [ ] **Step 1: Write the failing test**

```ts
// apps/mobile/src/features/product/pricing.test.ts
import {
  computeTotal,
  computeUnitPrice,
  formatBreakdown,
  resolveBasePrice,
  resolveHeadlinePrice,
} from './pricing';
import { getProductById } from './data';

const burger = getProductById('r4-1')!;
const cola = getProductById('r4-5')!;
const pizza = getProductById('r4-6')!;
const sundae = getProductById('r4-8')!;

const sesame = [{ groupId: 'pao', optionIds: ['pao-sesame'] }];
const twoExtras = [{ groupId: 'extras', optionIds: ['extra-bacon', 'extra-queijo'] }];
const large = [{ groupId: 'tamanho', optionIds: ['tamanho-grande'] }];

describe('resolveBasePrice', () => {
  it('uses the item price when no absolute group exists', () => {
    expect(resolveBasePrice(burger, sesame)).toBe(4500);
  });

  it('is replaced by the chosen option of an absolute group, not added to', () => {
    expect(resolveBasePrice(pizza, large)).toBe(7500);
  });

  it('falls back to the item price while the absolute group is undecided', () => {
    expect(resolveBasePrice(pizza, [])).toBe(pizza.price);
  });
});

describe('computeUnitPrice', () => {
  it('sums delta selections onto the base', () => {
    expect(computeUnitPrice(burger, [...sesame, ...twoExtras])).toBe(6200);
  });

  it('combines an absolute base with deltas', () => {
    expect(computeUnitPrice(pizza, [...large, ...twoExtras])).toBe(9200);
  });

  // Review Focus 2 — a stale configuration must not poison the total.
  it('ignores group and option ids that no longer exist', () => {
    const stale = [
      { groupId: 'does-not-exist', optionIds: ['x'] },
      { groupId: 'extras', optionIds: ['extra-ghost'] },
    ];
    expect(computeUnitPrice(burger, stale)).toBe(4500);
    expect(Number.isNaN(computeUnitPrice(burger, stale))).toBe(false);
  });
});

describe('computeTotal', () => {
  it('multiplies the unit price by the quantity', () => {
    expect(computeTotal(6200, 3)).toBe(18600);
  });
});

describe('resolveHeadlinePrice', () => {
  it('is exact for a plain product', () => {
    expect(resolveHeadlinePrice(cola, [])).toEqual({ kind: 'exact', value: 1800 });
  });

  it('is "from" the cheapest option while an absolute group is undecided', () => {
    expect(resolveHeadlinePrice(pizza, [])).toEqual({ kind: 'from', value: 5500 });
  });

  // Review Focus 3 — extras must not be added onto an undecided base.
  it('stays "from" the cheapest option even when extras are already ticked', () => {
    expect(resolveHeadlinePrice(pizza, twoExtras)).toEqual({ kind: 'from', value: 5500 });
  });

  it('becomes the chosen variant once the absolute group is decided', () => {
    expect(resolveHeadlinePrice(pizza, large)).toEqual({
      kind: 'variant',
      value: 7500,
      variantLabel: 'Grande',
    });
  });

  it('is an offer when a previous price is higher', () => {
    expect(resolveHeadlinePrice(sundae, [])).toEqual({
      kind: 'offer',
      value: 2550,
      previous: 3000,
      savings: 450,
    });
  });
});

describe('formatBreakdown', () => {
  it('counts units for a product with no groups', () => {
    expect(formatBreakdown(cola, [], 1)).toBe('1 un. × 1.800 Kz');
  });

  it('names the discount instead of a sum for an offer', () => {
    expect(formatBreakdown(sundae, [], 1)).toBe('1 un. · preço com desconto');
  });

  it('separates the base from the extras', () => {
    expect(formatBreakdown(burger, [...sesame, ...twoExtras], 1)).toBe(
      '1 × 4.500 Kz + extras · 1.700 Kz'
    );
  });

  it('names the variant when the base came from an absolute group', () => {
    expect(formatBreakdown(pizza, [...large, ...twoExtras], 1)).toBe(
      'Grande 7.500 Kz + extras 1.700 Kz'
    );
  });

  it('omits the extras clause when nothing was added', () => {
    expect(formatBreakdown(burger, sesame, 2)).toBe('2 × 4.500 Kz');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @kometa/mobile test -- pricing.test`
Expected: FAIL — cannot resolve `./pricing`.

- [ ] **Step 3: Write the implementation**

```ts
// apps/mobile/src/features/product/pricing.ts
import type { CartSelection } from '@/hooks/CartProvider';
import { formatKwanza } from '../home/format';
import type { ModifierGroup, Product } from './types';

export type HeadlinePrice =
  | { kind: 'from'; value: number }
  | { kind: 'variant'; value: number; variantLabel: string }
  | { kind: 'offer'; value: number; previous: number; savings: number }
  | { kind: 'exact'; value: number };

function groupsOf(product: Product): ModifierGroup[] {
  return product.modifierGroups ?? [];
}

function absoluteGroup(product: Product): ModifierGroup | undefined {
  return groupsOf(product).find((group) => group.pricing === 'absolute');
}

/** The chosen option of a group, or undefined — unknown ids resolve to nothing. */
function chosenOption(group: ModifierGroup, selections: CartSelection[]) {
  const selection = selections.find((candidate) => candidate.groupId === group.id);
  const optionId = selection?.optionIds[0];
  return group.options.find((option) => option.id === optionId);
}

export function resolveBasePrice(product: Product, selections: CartSelection[]): number {
  const group = absoluteGroup(product);
  if (!group) return product.price;
  return chosenOption(group, selections)?.price ?? product.price;
}

/** Only delta groups contribute here; the absolute group sets the base instead. */
function sumDeltas(product: Product, selections: CartSelection[]): number {
  return groupsOf(product)
    .filter((group) => group.pricing === 'delta')
    .reduce((total, group) => {
      const selection = selections.find((candidate) => candidate.groupId === group.id);
      if (!selection) return total;
      return (
        total +
        selection.optionIds.reduce((sum, optionId) => {
          const option = group.options.find((candidate) => candidate.id === optionId);
          return sum + (option?.price ?? 0);
        }, 0)
      );
    }, 0);
}

export function computeUnitPrice(product: Product, selections: CartSelection[]): number {
  return resolveBasePrice(product, selections) + sumDeltas(product, selections);
}

export function computeTotal(unitPrice: number, quantity: number): number {
  return unitPrice * quantity;
}

export function resolveHeadlinePrice(product: Product, selections: CartSelection[]): HeadlinePrice {
  if (product.previousPrice && product.previousPrice > product.price) {
    return {
      kind: 'offer',
      value: product.price,
      previous: product.previousPrice,
      savings: product.previousPrice - product.price,
    };
  }

  const group = absoluteGroup(product);
  if (group) {
    const chosen = chosenOption(group, selections);
    // "A partir de" survives until the variation is decided — extras never
    // move it, because there is no base yet for them to sit on top of.
    if (!chosen) {
      return { kind: 'from', value: Math.min(...group.options.map((option) => option.price)) };
    }
    return { kind: 'variant', value: chosen.price, variantLabel: chosen.label };
  }

  return { kind: 'exact', value: product.price };
}

export function formatBreakdown(
  product: Product,
  selections: CartSelection[],
  quantity: number
): string {
  if (product.previousPrice && product.previousPrice > product.price) {
    return `${quantity} un. · preço com desconto`;
  }

  const group = absoluteGroup(product);
  const extras = sumDeltas(product, selections);
  const base = resolveBasePrice(product, selections);

  if (!product.modifierGroups?.length) {
    return `${quantity} un. × ${formatKwanza(base)}`;
  }

  const chosen = group ? chosenOption(group, selections) : undefined;
  const head = chosen
    ? `${chosen.label} ${formatKwanza(base)}`
    : `${quantity} × ${formatKwanza(base)}`;

  // The middot only appears on the delta form, exactly as the board writes it.
  if (extras === 0) return head;
  return chosen
    ? `${head} + extras ${formatKwanza(extras)}`
    : `${head} + extras · ${formatKwanza(extras)}`;
}
```

- [ ] **Step 4: Run the tests**

Run: `pnpm --filter @kometa/mobile test -- pricing.test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/features/product/pricing.ts apps/mobile/src/features/product/pricing.test.ts
git commit -m "feat(product): add pricing with absolute variations and offers"
```

---

### Task 3: Validation

**Files:**
- Create: `apps/mobile/src/features/product/validation.ts`
- Test: `apps/mobile/src/features/product/validation.test.ts`

**Interfaces:**
- Consumes: `Product`, `ModifierGroup`, `ModifierOption` from Task 1; `CartSelection`.
- Produces: `resolveGroupStatus(group, selection): GroupStatus`, `findFirstIncompleteGroup(product, selections): string | null`, `isOptionSelectable(group, selection, option): boolean`, `canAdd(product, selections): boolean`, `selectedCount(selection): number`.

```ts
export type GroupStatus = 'incomplete' | 'satisfied' | 'full';
```

- [ ] **Step 1: Write the failing test**

```ts
// apps/mobile/src/features/product/validation.test.ts
import {
  canAdd,
  findFirstIncompleteGroup,
  isOptionSelectable,
  resolveGroupStatus,
} from './validation';
import { getProductById } from './data';
import type { ModifierGroup } from './types';

const burger = getProductById('r4-1')!;
const cola = getProductById('r4-5')!;
const unavailable = getProductById('r4-7')!;

const bread = burger.modifierGroups!.find((group) => group.id === 'pao')!;
const extras = burger.modifierGroups!.find((group) => group.id === 'extras')!;

describe('resolveGroupStatus', () => {
  it('is incomplete when a required group has nothing selected', () => {
    expect(resolveGroupStatus(bread, undefined)).toBe('incomplete');
  });

  it('is satisfied once the required group has its one option', () => {
    expect(resolveGroupStatus(bread, { groupId: 'pao', optionIds: ['pao-sesame'] })).toBe('satisfied');
  });

  it('is satisfied when an optional group is empty', () => {
    expect(resolveGroupStatus(extras, undefined)).toBe('satisfied');
  });

  it('is full once a multi-select group reaches its cap', () => {
    const selection = { groupId: 'extras', optionIds: ['extra-bacon', 'extra-queijo', 'extra-cogumelos'] };
    expect(resolveGroupStatus(extras, selection)).toBe('full');
  });

  // Review Focus 1 — a radio group is never "full".
  it('never reports a radio group as full', () => {
    expect(resolveGroupStatus(bread, { groupId: 'pao', optionIds: ['pao-sesame'] })).not.toBe('full');
  });
});

describe('isOptionSelectable', () => {
  // Review Focus 1 — the regression this model invites.
  it('keeps every option of a satisfied radio group selectable, so it can be switched', () => {
    const selection = { groupId: 'pao', optionIds: ['pao-sesame'] };
    const brioche = bread.options.find((option) => option.id === 'pao-brioche')!;
    expect(isOptionSelectable(bread, selection, brioche)).toBe(true);
  });

  it('blocks a new option once a multi-select group is full', () => {
    const selection = { groupId: 'extras', optionIds: ['extra-bacon', 'extra-queijo', 'extra-cogumelos'] };
    const avocadoSlot = extras.options.find((option) => option.id === 'extra-abacate')!;
    expect(isOptionSelectable(extras, selection, avocadoSlot)).toBe(false);
  });

  it('still allows deselecting an option that is already chosen in a full group', () => {
    const selection = { groupId: 'extras', optionIds: ['extra-bacon', 'extra-queijo', 'extra-cogumelos'] };
    const bacon = extras.options.find((option) => option.id === 'extra-bacon')!;
    expect(isOptionSelectable(extras, selection, bacon)).toBe(true);
  });

  it('blocks an unavailable option regardless of the group state', () => {
    const avocado = extras.options.find((option) => option.id === 'extra-abacate')!;
    expect(isOptionSelectable(extras, undefined, avocado)).toBe(false);
  });
});

describe('findFirstIncompleteGroup', () => {
  it('returns the first group in board order that is not satisfied', () => {
    expect(findFirstIncompleteGroup(burger, [])).toBe('pao');
  });

  it('returns null once every required group is answered', () => {
    expect(findFirstIncompleteGroup(burger, [{ groupId: 'pao', optionIds: ['pao-sesame'] }])).toBeNull();
  });

  it('returns null for a product with no groups', () => {
    expect(findFirstIncompleteGroup(cola, [])).toBeNull();
  });
});

describe('canAdd', () => {
  it('is true for a plain available product', () => {
    expect(canAdd(cola, [])).toBe(true);
  });

  it('is false while a required group is unanswered', () => {
    expect(canAdd(burger, [])).toBe(false);
  });

  it('is false for an unavailable product even when fully configured', () => {
    expect(canAdd(unavailable, [])).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @kometa/mobile test -- validation.test`
Expected: FAIL — cannot resolve `./validation`.

- [ ] **Step 3: Write the implementation**

```ts
// apps/mobile/src/features/product/validation.ts
import type { CartSelection } from '@/hooks/CartProvider';
import type { ModifierGroup, ModifierOption, Product } from './types';

export type GroupStatus = 'incomplete' | 'satisfied' | 'full';

export function selectedCount(selection: CartSelection | undefined): number {
  return selection?.optionIds.length ?? 0;
}

/** A radio group — exactly one, required — is the board's "Escolha 1 · obrigatório". */
export function isRadioGroup(group: ModifierGroup): boolean {
  return group.minSelections === 1 && group.maxSelections === 1;
}

export function resolveGroupStatus(
  group: ModifierGroup,
  selection: CartSelection | undefined
): GroupStatus {
  const count = selectedCount(selection);
  if (count < group.minSelections) return 'incomplete';
  // Radio groups are never full: a satisfied one must stay switchable, and
  // reporting 'full' would dim the very options the user needs to change to.
  if (!isRadioGroup(group) && group.maxSelections > 1 && count >= group.maxSelections) {
    return 'full';
  }
  return 'satisfied';
}

export function isOptionSelectable(
  group: ModifierGroup,
  selection: CartSelection | undefined,
  option: ModifierOption
): boolean {
  if (option.available === false) return false;
  // Already chosen: the press deselects, which a cap must never block.
  if (selection?.optionIds.includes(option.id)) return true;
  if (isRadioGroup(group)) return true;
  return selectedCount(selection) < group.maxSelections;
}

export function findFirstIncompleteGroup(
  product: Product,
  selections: CartSelection[]
): string | null {
  const group = (product.modifierGroups ?? []).find((candidate) => {
    const selection = selections.find((entry) => entry.groupId === candidate.id);
    return resolveGroupStatus(candidate, selection) === 'incomplete';
  });
  return group?.id ?? null;
}

export function canAdd(product: Product, selections: CartSelection[]): boolean {
  if (product.availability === 'unavailable') return false;
  return findFirstIncompleteGroup(product, selections) === null;
}
```

- [ ] **Step 4: Run the tests**

Run: `pnpm --filter @kometa/mobile test -- validation.test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/features/product/validation.ts apps/mobile/src/features/product/validation.test.ts
git commit -m "feat(product): add selection validation with switchable radio groups"
```

---

### Task 4: Option row and group card

The heart of the screen: five states, control on the left, cost on the right, whole row tappable.

**Files:**
- Create: `apps/mobile/src/features/product/tokens.ts`
- Create: `apps/mobile/src/features/product/content.ts`
- Create: `apps/mobile/src/features/product/components/ModifierOptionRow/{ModifierOptionRow.tsx,ModifierOptionRow.styles.ts,index.ts}`
- Create: `apps/mobile/src/features/product/components/ModifierGroupCard/{ModifierGroupCard.tsx,ModifierGroupCard.styles.ts,index.ts}`
- Test: `apps/mobile/src/features/product/components/ModifierOptionRow/ModifierOptionRow.test.tsx`
- Test: `apps/mobile/src/features/product/components/ModifierGroupCard/ModifierGroupCard.test.tsx`

**Interfaces:**
- Consumes: Task 1 types, Task 3 `resolveGroupStatus` / `isOptionSelectable` / `isRadioGroup` / `selectedCount`; `Radio`, `Checkbox`, `Text`, `Icon` atoms; `formatKwanza`.
- Produces: `<ModifierOptionRow option group selection onToggle />`, `<ModifierGroupCard group selection onToggle showError />`, and `content.groupSubtitle(group)`, `content.optionCost(price)`.

`content.ts` holds the screen's strings and the three derivations the board fixes:

```ts
// apps/mobile/src/features/product/content.ts
import { formatKwanza } from '../home/format';
import type { ModifierGroup, ModifierOption } from './types';

export const content = {
  limitReached: 'Limite atingido',
  notePlaceholder: 'Ex.: Sem cebola',
  noteLabel: 'Observação',
  noteHelper: 'Opcional · não substitui escolhas acima',
  quantityLabel: 'Quantidade',
  notFound: 'Produto não encontrado',

  /** "Escolha 1 · obrigatório" / "Escolha até 3" / "Opcional". */
  groupSubtitle(group: ModifierGroup): string {
    if (group.minSelections === 1 && group.maxSelections === 1) return 'Escolha 1 · obrigatório';
    if (group.maxSelections > 1) return `Escolha até ${group.maxSelections}`;
    return 'Opcional';
  },

  /** Deltas wear a plus; an absolute variation is just its price. */
  optionCost(price: number, pricing: ModifierGroup['pricing']): string {
    return pricing === 'absolute' ? formatKwanza(price) : `+${formatKwanza(price)}`;
  },

  missingChoice(group: ModifierGroup): string {
    return `Falta escolher ${group.errorNoun}.`;
  },

  maxAvailable(max: number): string {
    return `Máximo disponível: ${max}`;
  },

  optionAnnouncement(option: ModifierOption, pricing: ModifierGroup['pricing'], note?: string): string {
    const cost = option.price > 0 ? `, ${content.optionCost(option.price, pricing)}` : '';
    return `${option.label}${cost}${note ? `, ${note}` : ''}`;
  },

  addToCart(total: number): string {
    return `Adicionar ao carrinho · ${formatKwanza(total)}`;
  },

  addToCartAnnouncement(total: number): string {
    return `Adicionar ao carrinho, total ${formatKwanza(total)}`;
  },
} as const;
```

`groupSubtitle` is the derivation table from the spec, in code: it is the single place the radio-vs-checkbox wording is decided.

- [ ] **Step 1: Write the failing tests**

```tsx
// apps/mobile/src/features/product/components/ModifierOptionRow/ModifierOptionRow.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { ModifierOptionRow } from './ModifierOptionRow';
import { getProductById } from '../../data';

const burger = getProductById('r4-1')!;
const extras = burger.modifierGroups!.find((group) => group.id === 'extras')!;
const bacon = extras.options.find((option) => option.id === 'extra-bacon')!;
const avocado = extras.options.find((option) => option.id === 'extra-abacate')!;

const renderRow = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ModifierOptionRow', () => {
  it('shows the label and its cost in separate elements', () => {
    const { getByText } = renderRow(
      <ModifierOptionRow group={extras} option={bacon} selection={undefined} onToggle={jest.fn()} />
    );
    expect(getByText('Bacon')).toBeTruthy();
    expect(getByText('+1.000 Kz')).toBeTruthy();
  });

  it('toggles when the row itself is pressed, not just the control', () => {
    const onToggle = jest.fn();
    const { getByRole } = renderRow(
      <ModifierOptionRow group={extras} option={bacon} selection={undefined} onToggle={onToggle} />
    );
    fireEvent.press(getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('extra-bacon');
  });

  it('announces its checked state exactly once', () => {
    const selection = { groupId: 'extras', optionIds: ['extra-bacon'] };
    const { getAllByRole } = renderRow(
      <ModifierOptionRow group={extras} option={bacon} selection={selection} onToggle={jest.fn()} />
    );
    const rows = getAllByRole('checkbox');
    expect(rows).toHaveLength(1);
    expect(rows[0].props.accessibilityState.checked).toBe(true);
  });

  it('keeps an unavailable option visible, shows its note, and ignores presses', () => {
    const onToggle = jest.fn();
    const { getByText, getByRole } = renderRow(
      <ModifierOptionRow group={extras} option={avocado} selection={undefined} onToggle={onToggle} />
    );
    expect(getByText('Abacate')).toBeTruthy();
    expect(getByText('Indisponível hoje')).toBeTruthy();
    fireEvent.press(getByRole('checkbox'));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('shows "Limite atingido" on an unselected option once the group is full', () => {
    const full = { groupId: 'extras', optionIds: ['extra-bacon', 'extra-queijo', 'extra-cogumelos'] };
    const spare = extras.options.find((option) => option.id === 'extra-abacate')!;
    const { getByText } = renderRow(
      <ModifierOptionRow
        group={extras}
        option={{ ...spare, available: true, unavailableNote: undefined }}
        selection={full}
        onToggle={jest.fn()}
      />
    );
    expect(getByText('Limite atingido')).toBeTruthy();
  });

  // Review Focus 5 — a long label must not push its cost off-screen.
  it('truncates a long label to one line and keeps the cost rendered', () => {
    const long = { ...bacon, label: 'Bacon artesanal fumado em lenha de carvalho com ervas' };
    const { getByText } = renderRow(
      <ModifierOptionRow group={extras} option={long} selection={undefined} onToggle={jest.fn()} />
    );
    expect(getByText(long.label).props.numberOfLines).toBe(1);
    expect(getByText('+1.000 Kz')).toBeTruthy();
  });
});
```

```tsx
// apps/mobile/src/features/product/components/ModifierGroupCard/ModifierGroupCard.test.tsx
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { ModifierGroupCard } from './ModifierGroupCard';
import { getProductById } from '../../data';

const burger = getProductById('r4-1')!;
const bread = burger.modifierGroups!.find((group) => group.id === 'pao')!;
const extras = burger.modifierGroups!.find((group) => group.id === 'extras')!;

const renderCard = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ModifierGroupCard', () => {
  it('renders a radio group with its required subtitle and no counter', () => {
    const { getByText, queryByText, getAllByRole } = renderCard(
      <ModifierGroupCard group={bread} selection={undefined} onToggle={jest.fn()} />
    );
    expect(getByText('Escolha o pão')).toBeTruthy();
    expect(getByText('Escolha 1 · obrigatório')).toBeTruthy();
    expect(queryByText('0/1')).toBeNull();
    expect(getAllByRole('radio')).toHaveLength(2);
  });

  it('renders a checkbox group with its cap subtitle and a live counter', () => {
    const selection = { groupId: 'extras', optionIds: ['extra-bacon', 'extra-queijo'] };
    const { getByText, getAllByRole } = renderCard(
      <ModifierGroupCard group={extras} selection={selection} onToggle={jest.fn()} />
    );
    expect(getByText('Escolha até 3')).toBeTruthy();
    expect(getByText('2/3')).toBeTruthy();
    expect(getAllByRole('checkbox')).toHaveLength(4);
  });

  it('shows the validation message when asked, never the outline alone', () => {
    const { getByText } = renderCard(
      <ModifierGroupCard group={bread} selection={undefined} onToggle={jest.fn()} showError />
    );
    expect(getByText('Falta escolher o pão.')).toBeTruthy();
  });

  it('shows no validation message when not asked', () => {
    const { queryByText } = renderCard(
      <ModifierGroupCard group={bread} selection={undefined} onToggle={jest.fn()} />
    );
    expect(queryByText('Falta escolher o pão.')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @kometa/mobile test -- ModifierOptionRow ModifierGroupCard`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write the tokens, content and components**

`tokens.ts` transcribes geometry from the board: card radius 16, card padding 16, row height 48, row gap 12, control size 20, group gap 12, section gap 20, footer CTA height 54, hero height 310, hero compact height 56, hero bounce 200.

The row renders one `Pressable` that owns the accessibility contract; the `Radio`/`Checkbox` atom is mounted inside a `View` with `pointerEvents="none"` so it draws the control without stealing the press or announcing a second time:

```tsx
// apps/mobile/src/features/product/components/ModifierOptionRow/ModifierOptionRow.tsx
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Checkbox, Radio, Text } from '@/components/design-system/atoms';
import { formatKwanza } from '../../../home/format';
import { isOptionSelectable, isRadioGroup, resolveGroupStatus } from '../../validation';
import { content } from '../../content';
import type { ModifierGroup, ModifierOption } from '../../types';
import type { CartSelection } from '@/hooks/CartProvider';
import { Cost, Labels, Row, Note, Control } from './ModifierOptionRow.styles';

export type ModifierOptionRowProps = {
  group: ModifierGroup;
  option: ModifierOption;
  selection: CartSelection | undefined;
  onToggle: (optionId: string) => void;
};

export function ModifierOptionRow({ group, option, selection, onToggle }: ModifierOptionRowProps) {
  const selected = selection?.optionIds.includes(option.id) ?? false;
  const selectable = isOptionSelectable(group, selection, option);
  const radio = isRadioGroup(group);

  // Two different reasons a row is dimmed, and the board words them apart:
  // the option itself is off today, or the group has no room left.
  const note = option.available === false
    ? option.unavailableNote
    : !selectable && resolveGroupStatus(group, selection) === 'full'
      ? content.limitReached
      : undefined;

  const handlePress = () => {
    if (!selectable) return;
    Haptics.selectionAsync().catch(() => {});
    onToggle(option.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!selectable}
      accessibilityRole={radio ? 'radio' : 'checkbox'}
      accessibilityState={{ checked: selected, disabled: !selectable }}
      accessibilityLabel={content.optionAnnouncement(option, group.pricing, note)}
    >
      <Row dimmed={!selectable && !selected}>
        {/* The atom draws the control; the row above owns the press and the
            announcement, so the whole 48pt line is one target and VoiceOver
            hears it once. */}
        <Control pointerEvents="none">
          {radio ? <Radio selected={selected} /> : <Checkbox checked={selected} />}
        </Control>
        <Labels>
          <Text numberOfLines={1}>{option.label}</Text>
          {note ? <Note>{note}</Note> : null}
        </Labels>
        {option.price > 0 ? <Cost>{content.optionCost(option.price, group.pricing)}</Cost> : null}
      </Row>
    </Pressable>
  );
}
```

`content.optionCost(price)` returns `` `+${formatKwanza(price)}` `` for delta groups and `formatKwanza(price)` for absolute ones — pass the group's `pricing` through. `ModifierGroupCard` renders the header (label, subtitle, counter when not a radio group), maps the options, and renders the validation message beneath when `showError` is set.

- [ ] **Step 4: Run the tests**

Run: `pnpm --filter @kometa/mobile test -- ModifierOptionRow ModifierGroupCard`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/features/product
git commit -m "feat(product): add option row and group card with five states"
```

---

### Task 5: Header, notices and attribute row

**Files:**
- Create: `apps/mobile/src/features/product/components/ProductNotice/{ProductNotice.tsx,ProductNotice.styles.ts,index.ts}`
- Create: `apps/mobile/src/features/product/components/ProductHeader/{ProductHeader.tsx,ProductHeader.styles.ts,index.ts}`
- Test: `apps/mobile/src/features/product/components/ProductHeader/ProductHeader.test.tsx`

**Interfaces:**
- Consumes: Task 2 `resolveHeadlinePrice`; Task 1 `Product`, `ProductAttribute`.
- Produces: `<ProductHeader product selections />`, `<ProductNotice tone icon>{children}</ProductNotice>` with `tone: 'neutral' | 'positive' | 'warning' | 'unavailable'`.

- [ ] **Step 1: Write the failing test**

```tsx
// apps/mobile/src/features/product/components/ProductHeader/ProductHeader.test.tsx
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { ProductHeader } from './ProductHeader';
import { getProductById } from '../../data';

const burger = getProductById('r4-1')!;
const cola = getProductById('r4-5')!;
const pizza = getProductById('r4-6')!;
const sundae = getProductById('r4-8')!;
const unavailable = getProductById('r4-7')!;

const renderHeader = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ProductHeader', () => {
  it('renders name, price and description in board order', () => {
    const { getByText } = renderHeader(<ProductHeader product={burger} selections={[]} />);
    expect(getByText('Classic Burger')).toBeTruthy();
    expect(getByText('4.500 Kz')).toBeTruthy();
    expect(getByText(burger.description)).toBeTruthy();
  });

  it('renders the inline attribute row as values only', () => {
    const { getByText } = renderHeader(<ProductHeader product={cola} selections={[]} />);
    expect(getByText('Coca-Cola')).toBeTruthy();
    expect(getByText('1,5 L')).toBeTruthy();
    expect(getByText('Disponível')).toBeTruthy();
  });

  it('prefixes the price while a variation is undecided', () => {
    const { getByText } = renderHeader(<ProductHeader product={pizza} selections={[]} />);
    expect(getByText('A partir de 5.500 Kz')).toBeTruthy();
  });

  it('names the variation once chosen', () => {
    const selections = [{ groupId: 'tamanho', optionIds: ['tamanho-grande'] }];
    const { getByText } = renderHeader(<ProductHeader product={pizza} selections={selections} />);
    expect(getByText('Grande · 7.500 Kz')).toBeTruthy();
  });

  it('strikes the previous price and states the saving on an offer', () => {
    const { getByText } = renderHeader(<ProductHeader product={sundae} selections={[]} />);
    expect(getByText('2.550 Kz')).toBeTruthy();
    expect(getByText('3.000 Kz')).toHaveStyle({ textDecorationLine: 'line-through' });
    expect(getByText('Poupa 450 Kz. O desconto já está incluído no total.')).toBeTruthy();
  });

  it('keeps an unavailable product fully readable and promises no return time', () => {
    const { getByText } = renderHeader(<ProductHeader product={unavailable} selections={[]} />);
    expect(getByText('Temporariamente indisponível')).toBeTruthy();
    expect(getByText('Volte a consultar mais tarde')).toBeTruthy();
    expect(getByText(unavailable.description)).toBeTruthy();
  });

  // Review Focus 5 — Dynamic Type and long names.
  it('wraps a long name to two lines without truncating the price', () => {
    const long = { ...burger, name: 'Classic Burger Duplo com Bacon Artesanal e Cheddar Maturado' };
    const { getByText } = renderHeader(<ProductHeader product={long} selections={[]} />);
    expect(getByText(long.name).props.numberOfLines).toBe(2);
    expect(getByText('4.500 Kz').props.numberOfLines).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @kometa/mobile test -- ProductHeader`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the components**

`ProductHeader` renders, in order: name (`variant="h1"`, `numberOfLines={2}`), the headline price switched on `resolveHeadlinePrice`'s `kind`, the description, the inline attribute row, and then any notice — the unavailable chip plus meta row and explanatory line, or the offer's amber savings notice. `ProductNotice` is a non-interactive tinted container; the existing `Chip` atom is not reused because it is an interactive filter chip with press-scale and a `selected` state.

- [ ] **Step 4: Run the tests**

Run: `pnpm --filter @kometa/mobile test -- ProductHeader`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/features/product/components/ProductHeader apps/mobile/src/features/product/components/ProductNotice
git commit -m "feat(product): add header with headline price, attributes and notices"
```

---

### Task 6: Quantity row and note field

**Files:**
- Modify: `apps/mobile/src/components/design-system/atoms/QuantityStepper/QuantityStepper.tsx`
- Modify: `apps/mobile/src/components/design-system/atoms/QuantityStepper/QuantityStepper.styles.ts`
- Modify: `apps/mobile/src/components/design-system/atoms/QuantityStepper/QuantityStepper.test.tsx`
- Create: `apps/mobile/src/features/product/components/ProductQuantityRow/{ProductQuantityRow.tsx,ProductQuantityRow.styles.ts,index.ts}`
- Create: `apps/mobile/src/features/product/components/ProductNoteField/{ProductNoteField.tsx,index.ts}`
- Test: `apps/mobile/src/features/product/components/ProductQuantityRow/ProductQuantityRow.test.tsx`
- Test: `apps/mobile/src/features/product/components/ProductNoteField/ProductNoteField.test.tsx`

**Interfaces:**
- Produces: `QuantityStepperProps` gains `variant: 'inline'`, `canIncrement?: boolean`, `canDecrement?: boolean`. `<ProductQuantityRow quantity maxQuantity onIncrement onDecrement />`, `<ProductNoteField value onChangeText />` with a 180-character limit.

The existing `pill` and `panel` variants must keep their current rendering — the checkout's `OrderItemRow` depends on `pill`.

- [ ] **Step 1: Write the failing tests**

```tsx
// apps/mobile/src/features/product/components/ProductQuantityRow/ProductQuantityRow.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { ProductQuantityRow } from './ProductQuantityRow';

const renderRow = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ProductQuantityRow', () => {
  it('shows the label and the current quantity', () => {
    const { getByText } = renderRow(
      <ProductQuantityRow quantity={1} onIncrement={jest.fn()} onDecrement={jest.fn()} />
    );
    expect(getByText('Quantidade')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
  });

  // Review Focus 4 — no cap when the field is absent.
  it('increments without limit when maxQuantity is not set', () => {
    const onIncrement = jest.fn();
    const { getByLabelText, queryByText } = renderRow(
      <ProductQuantityRow quantity={99} onIncrement={onIncrement} onDecrement={jest.fn()} />
    );
    expect(queryByText(/Máximo disponível/)).toBeNull();
    fireEvent.press(getByLabelText('Aumentar quantidade'));
    expect(onIncrement).toHaveBeenCalledTimes(1);
  });

  it('announces the cap and blocks increment once it is reached', () => {
    const onIncrement = jest.fn();
    const { getByText, getByLabelText } = renderRow(
      <ProductQuantityRow quantity={3} maxQuantity={3} onIncrement={onIncrement} onDecrement={jest.fn()} />
    );
    expect(getByText('Máximo disponível: 3')).toBeTruthy();
    fireEvent.press(getByLabelText('Aumentar quantidade'));
    expect(onIncrement).not.toHaveBeenCalled();
  });

  // Review Focus 4 — the cap is already met at mount.
  it('blocks increment when maxQuantity is 1 and the quantity starts at 1', () => {
    const onIncrement = jest.fn();
    const { getByLabelText } = renderRow(
      <ProductQuantityRow quantity={1} maxQuantity={1} onIncrement={onIncrement} onDecrement={jest.fn()} />
    );
    fireEvent.press(getByLabelText('Aumentar quantidade'));
    expect(onIncrement).not.toHaveBeenCalled();
  });

  it('never decrements below one', () => {
    const onDecrement = jest.fn();
    const { getByLabelText } = renderRow(
      <ProductQuantityRow quantity={1} onIncrement={jest.fn()} onDecrement={onDecrement} />
    );
    fireEvent.press(getByLabelText('Diminuir quantidade'));
    expect(onDecrement).not.toHaveBeenCalled();
  });
});
```

```tsx
// apps/mobile/src/features/product/components/ProductNoteField/ProductNoteField.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { ProductNoteField } from './ProductNoteField';

const renderField = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ProductNoteField', () => {
  it('renders the label, helper and counter', () => {
    const { getByText } = renderField(<ProductNoteField value="" onChangeText={jest.fn()} />);
    expect(getByText('Observação')).toBeTruthy();
    expect(getByText('Opcional · não substitui escolhas acima')).toBeTruthy();
    expect(getByText('0/180')).toBeTruthy();
  });

  it('counts the characters typed', () => {
    const { getByText } = renderField(<ProductNoteField value="Sem cebola" onChangeText={jest.fn()} />);
    expect(getByText('10/180')).toBeTruthy();
  });

  it('stops accepting input at the limit', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = renderField(
      <ProductNoteField value={'a'.repeat(180)} onChangeText={onChangeText} />
    );
    expect(getByPlaceholderText('Ex.: Sem cebola').props.maxLength).toBe(180);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @kometa/mobile test -- ProductQuantityRow ProductNoteField`
Expected: FAIL — modules not found.

- [ ] **Step 3: Extend the stepper and write the components**

Add the `inline` variant — plain `−`, value, `+` in a filled brand circle — and honour `canIncrement` / `canDecrement` by dimming the sign and skipping the callback. `ProductQuantityRow` computes `canIncrement` as `maxQuantity === undefined || quantity < maxQuantity` and `canDecrement` as `quantity > 1`, and renders the `Máximo disponível: n` subtitle only when `maxQuantity` is set.

- [ ] **Step 4: Run the full suite, so the checkout's use of `pill` is proven untouched**

Run: `pnpm --filter @kometa/mobile test`
Expected: PASS, including `OrderItemRow` and `QuantityStepper`.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/components/design-system/atoms/QuantityStepper apps/mobile/src/features/product/components/ProductQuantityRow apps/mobile/src/features/product/components/ProductNoteField
git commit -m "feat(product): add quantity row with cap and note field with counter"
```

---

### Task 7: Footer

**Files:**
- Create: `apps/mobile/src/features/product/components/ProductFooter/{ProductFooter.tsx,ProductFooter.styles.ts,index.ts}`
- Test: `apps/mobile/src/features/product/components/ProductFooter/ProductFooter.test.tsx`

**Interfaces:**
- Consumes: Task 2 `formatBreakdown`, `computeTotal`; Task 3 `canAdd`.
- Produces: `<ProductFooter product selections quantity bottomInset onAdd onNeedsChoices />` and the exported `resolveCtaState(product, selections): CtaState` where

```ts
export type CtaState = 'ready' | 'needsChoices' | 'unavailable';
```

- [ ] **Step 1: Write the failing test**

```tsx
// apps/mobile/src/features/product/components/ProductFooter/ProductFooter.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { ProductFooter, resolveCtaState } from './ProductFooter';
import { getProductById } from '../../data';

const burger = getProductById('r4-1')!;
const cola = getProductById('r4-5')!;
const unavailable = getProductById('r4-7')!;
const configured = [
  { groupId: 'pao', optionIds: ['pao-sesame'] },
  { groupId: 'extras', optionIds: ['extra-bacon', 'extra-queijo'] },
];

const renderFooter = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('resolveCtaState', () => {
  it('is ready for a plain available product', () => {
    expect(resolveCtaState(cola, [])).toBe('ready');
  });

  it('needs choices while a required group is unanswered', () => {
    expect(resolveCtaState(burger, [])).toBe('needsChoices');
  });

  it('is unavailable regardless of configuration', () => {
    expect(resolveCtaState(unavailable, [])).toBe('unavailable');
  });
});

describe('ProductFooter', () => {
  it('shows the breakdown, the total and the add label', () => {
    const { getByText } = renderFooter(
      <ProductFooter
        product={burger}
        selections={configured}
        quantity={1}
        bottomInset={0}
        onAdd={jest.fn()}
        onNeedsChoices={jest.fn()}
      />
    );
    expect(getByText('1 × 4.500 Kz + extras · 1.700 Kz')).toBeTruthy();
    expect(getByText('6.200 Kz')).toBeTruthy();
    expect(getByText('Adicionar ao carrinho · 6.200 Kz')).toBeTruthy();
  });

  it('multiplies the total by the quantity', () => {
    const { getByText } = renderFooter(
      <ProductFooter
        product={burger}
        selections={configured}
        quantity={2}
        bottomInset={0}
        onAdd={jest.fn()}
        onNeedsChoices={jest.fn()}
      />
    );
    expect(getByText('Adicionar ao carrinho · 12.400 Kz')).toBeTruthy();
  });

  it('calls onNeedsChoices, never onAdd, while choices are missing', () => {
    const onAdd = jest.fn();
    const onNeedsChoices = jest.fn();
    const { getByText } = renderFooter(
      <ProductFooter
        product={burger}
        selections={[]}
        quantity={1}
        bottomInset={0}
        onAdd={onAdd}
        onNeedsChoices={onNeedsChoices}
      />
    );
    fireEvent.press(getByText('Escolher opções'));
    expect(onNeedsChoices).toHaveBeenCalledTimes(1);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('renders an inert unavailable CTA', () => {
    const onAdd = jest.fn();
    const { getByText } = renderFooter(
      <ProductFooter
        product={unavailable}
        selections={[]}
        quantity={1}
        bottomInset={0}
        onAdd={onAdd}
        onNeedsChoices={jest.fn()}
      />
    );
    fireEvent.press(getByText('Indisponível'));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('announces the total on the CTA for VoiceOver', () => {
    const { getByLabelText } = renderFooter(
      <ProductFooter
        product={burger}
        selections={configured}
        quantity={1}
        bottomInset={0}
        onAdd={jest.fn()}
        onNeedsChoices={jest.fn()}
      />
    );
    expect(getByLabelText('Adicionar ao carrinho, total 6.200 Kz')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @kometa/mobile test -- ProductFooter`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the component**

Sticky container padded by `bottomInset`, breakdown left and total right on one row, then the CTA at 54pt. `resolveCtaState` returns `'unavailable'` first, then `'needsChoices'` when `canAdd` is false, else `'ready'`.

- [ ] **Step 4: Run the tests**

Run: `pnpm --filter @kometa/mobile test -- ProductFooter`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/features/product/components/ProductFooter
git commit -m "feat(product): add sticky footer with breakdown and CTA states"
```

---

### Task 8: Collapsing hero

**Files:**
- Create: `apps/mobile/src/features/product/components/ProductHero/{ProductHero.tsx,ProductHero.styles.ts,index.ts}`
- Test: `apps/mobile/src/features/product/components/ProductHero/ProductHero.test.tsx`

**Interfaces:**
- Consumes: Task 1 `Product`; `FavoriteButton`, `Icon`, `Text` atoms; Reanimated `SharedValue`.
- Produces: `<ProductHero product topInset scrollY mode onBack onShare onClose isFavorite onToggleFavorite />` with `mode: 'detail' | 'customize'`, plus exported `HERO_MAX_HEIGHT`, `HEADER_COMPACT_HEIGHT`, `COLLAPSE_RANGE`.

The mechanics mirror `RestaurantHero` — height interpolation over `[-200, 0, COLLAPSE_RANGE]`, media fading out, a solid background fading in, and the compact title gated to the back half of the collapse. They are written fresh here rather than extracted; the spec records why.

- [ ] **Step 1: Write the failing test**

```tsx
// apps/mobile/src/features/product/components/ProductHero/ProductHero.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { makeMutable } from 'react-native-reanimated';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { ProductHero } from './ProductHero';
import { getProductById } from '../../data';

const burger = getProductById('r4-1')!;
const unavailable = getProductById('r4-7')!;

const renderHero = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);
const scrollY = () => makeMutable(0);

describe('ProductHero', () => {
  it('offers back and share in detail mode', () => {
    const onBack = jest.fn();
    const { getByLabelText, queryByLabelText } = renderHero(
      <ProductHero product={burger} topInset={0} scrollY={scrollY()} mode="detail" onBack={onBack} onShare={jest.fn()} />
    );
    fireEvent.press(getByLabelText('Voltar'));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(getByLabelText('Partilhar')).toBeTruthy();
    expect(queryByLabelText('Fechar')).toBeNull();
  });

  it('offers back and close in customize mode', () => {
    const onClose = jest.fn();
    const { getByLabelText, queryByLabelText } = renderHero(
      <ProductHero product={burger} topInset={0} scrollY={scrollY()} mode="customize" onBack={jest.fn()} onClose={onClose} />
    );
    fireEvent.press(getByLabelText('Fechar'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(queryByLabelText('Partilhar')).toBeNull();
  });

  it('carries the product name as the compact title', () => {
    const { getByText } = renderHero(
      <ProductHero product={burger} topInset={0} scrollY={scrollY()} mode="detail" onBack={jest.fn()} />
    );
    expect(getByText('Classic Burger')).toBeTruthy();
  });

  it('renders the favourite control when a handler is given', () => {
    const onToggleFavorite = jest.fn();
    const { getByLabelText } = renderHero(
      <ProductHero
        product={burger}
        topInset={0}
        scrollY={scrollY()}
        mode="detail"
        onBack={jest.fn()}
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
      />
    );
    fireEvent.press(getByLabelText('Adicionar aos favoritos'));
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it('overlays the unavailable label on the photograph', () => {
    const { getByText } = renderHero(
      <ProductHero product={unavailable} topInset={0} scrollY={scrollY()} mode="detail" onBack={jest.fn()} />
    );
    expect(getByText('Temporariamente indisponível')).toBeTruthy();
  });
});
```

Check the `FavoriteButton` atom's accessibility label before running, and match the test to whatever it already announces.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @kometa/mobile test -- ProductHero`
Expected: FAIL — module not found (the old `features/home` hero is a different path).

- [ ] **Step 3: Write the component**

```tsx
// apps/mobile/src/features/product/components/ProductHero/ProductHero.tsx
import { Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from 'styled-components/native';
import { FavoriteButton, Icon, Text } from '@/components/design-system/atoms';
import { productTokens } from '../../tokens';
import type { Product } from '../../types';
import {
  ActionButton,
  ActionGroup,
  ActionShadow,
  Actions,
  CompactTitleWrapper,
  UnavailableOverlay,
} from './ProductHero.styles';

export const HERO_MAX_HEIGHT = productTokens.metrics.heroHeight;        // 310
export const HEADER_COMPACT_HEIGHT = productTokens.metrics.heroCompact; // 56
export const COLLAPSE_RANGE = HERO_MAX_HEIGHT - HEADER_COMPACT_HEIGHT;

const BOUNCE_STRETCH = 200;

export type ProductHeroProps = {
  product: Product;
  topInset: number;
  scrollY: SharedValue<number>;
  mode: 'detail' | 'customize';
  onBack: () => void;
  onShare?: () => void;
  onClose?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

const heroPositionStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  overflow: 'hidden' as const,
};

export function ProductHero({
  product,
  topInset,
  scrollY,
  mode,
  onBack,
  onShare,
  onClose,
  isFavorite = false,
  onToggleFavorite,
}: ProductHeroProps) {
  const theme = useTheme();
  const maxHeight = HERO_MAX_HEIGHT + topInset;
  const compactHeight = HEADER_COMPACT_HEIGHT + topInset;

  const containerStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [-BOUNCE_STRETCH, 0, COLLAPSE_RANGE],
      [maxHeight + BOUNCE_STRETCH, maxHeight, compactHeight],
      Extrapolation.CLAMP
    ),
  }));

  const mediaStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE_RANGE], [1, 0], Extrapolation.CLAMP),
  }));

  const solidStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE_RANGE], [0, 1], Extrapolation.CLAMP),
  }));

  // Held back until the photograph is half gone, so the name never reads as
  // one title sliding over another.
  const compactTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [COLLAPSE_RANGE * 0.5, COLLAPSE_RANGE],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <Animated.View
      style={[heroPositionStyle, { backgroundColor: theme.colors.background.primary }, containerStyle]}
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background.primary }, solidStyle]}
      />
      <Animated.View style={[StyleSheet.absoluteFill, mediaStyle]}>
        <Image source={product.imageUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={productTokens.heroScrim.colors}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: productTokens.metrics.scrimHeight + topInset,
          }}
        />
        {product.availability === 'unavailable' ? (
          <UnavailableOverlay>
            <Text variant="caption" color="onBrand">
              Temporariamente indisponível
            </Text>
          </UnavailableOverlay>
        ) : null}
      </Animated.View>

      <Animated.View style={compactTitleStyle}>
        <CompactTitleWrapper topInset={topInset}>
          <Text variant="title" numberOfLines={1}>
            {product.name}
          </Text>
        </CompactTitleWrapper>
      </Animated.View>

      <Actions topInset={topInset}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={8}>
          <ActionShadow>
            <ActionButton>
              <Icon name="chevron-back" sf="chevron.left" size={19} color="primary" />
            </ActionButton>
          </ActionShadow>
        </Pressable>
        <ActionGroup>
          {mode === 'detail' && onShare ? (
            <Pressable onPress={onShare} accessibilityRole="button" accessibilityLabel="Partilhar" hitSlop={8}>
              <ActionShadow>
                <ActionButton>
                  <Icon name="share-outline" sf="square.and.arrow.up" size={19} color="primary" />
                </ActionButton>
              </ActionShadow>
            </Pressable>
          ) : null}
          {mode === 'customize' && onClose ? (
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={8}>
              <ActionShadow>
                <ActionButton>
                  <Icon name="close" sf="xmark" size={19} color="primary" />
                </ActionButton>
              </ActionShadow>
            </Pressable>
          ) : null}
          {onToggleFavorite ? (
            <ActionShadow>
              <FavoriteButton size={40} isFavorite={isFavorite} onToggle={onToggleFavorite} />
            </ActionShadow>
          ) : null}
        </ActionGroup>
      </Actions>
    </Animated.View>
  );
}
```

The favourite control keeps the `FavoriteButton` atom, which already draws the heart in `status.error` and never in brand green — the board's rule that favouriting must not compete with the CTA.

- [ ] **Step 4: Run the tests**

Run: `pnpm --filter @kometa/mobile test -- ProductHero`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/features/product/components/ProductHero
git commit -m "feat(product): add collapsing product hero"
```

---

### Task 9: Screen assembly

**Files:**
- Modify: `apps/mobile/src/app/(tabs)/(home)/product/[itemId].tsx` (replaced wholesale)
- Create: `apps/mobile/src/features/product/components/ProductScreen/{ProductScreen.tsx,ProductScreen.styles.ts,index.ts}`
- Test: `apps/mobile/src/features/product/components/ProductScreen/ProductScreen.test.tsx`

**Interfaces:**
- Consumes: every component from Tasks 4–8, `getProductById`, `computeUnitPrice`, `findFirstIncompleteGroup`, `useCart`, `useTabBarVisibility`, `useReducedMotion`.
- Produces: `<ProductScreen productId />`; the route renders it and passes `useLocalSearchParams`.

The screen owns `selections`, `quantity`, `notes`, `isFavorite` and `errorGroupId`. Required radio groups are pre-selected at mount only when `minSelections === 1 && maxSelections === 1` and a first option exists — matching today's behaviour. Pressing the CTA while incomplete sets `errorGroupId` from `findFirstIncompleteGroup`, scrolls to the measured offset of that card over 300ms, and clears nothing.

- [ ] **Step 1: Write the failing test**

```tsx
// apps/mobile/src/features/product/components/ProductScreen/ProductScreen.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { CartProvider } from '@/hooks/CartProvider';
import { TabBarVisibilityProvider } from '@/hooks/TabBarVisibilityProvider';
import { ProductScreen } from './ProductScreen';

function renderScreen(productId: string) {
  return render(
    <ThemeProvider>
      <TabBarVisibilityProvider>
        <CartProvider>
          <ProductScreen productId={productId} />
        </CartProvider>
      </TabBarVisibilityProvider>
    </ThemeProvider>
  );
}

describe('ProductScreen', () => {
  it('tells the customer when the product does not exist', () => {
    const { getByText } = renderScreen('nope');
    expect(getByText('Produto não encontrado')).toBeTruthy();
  });

  it('pre-selects the required radio group so the CTA starts ready', () => {
    const { getByText } = renderScreen('r4-1');
    expect(getByText('Adicionar ao carrinho · 4.500 Kz')).toBeTruthy();
  });

  it('adds an extra to the total as soon as it is ticked', () => {
    const { getByText } = renderScreen('r4-1');
    fireEvent.press(getByText('Bacon'));
    expect(getByText('Adicionar ao carrinho · 5.500 Kz')).toBeTruthy();
  });

  // Review Focus 1, end to end: the group must stay switchable on the screen.
  it('switches the chosen bread instead of freezing on the first option', () => {
    const { getByText } = renderScreen('r4-1');
    fireEvent.press(getByText('Brioche'));
    fireEvent.press(getByText('Sesame'));
    expect(getByText('Adicionar ao carrinho · 4.500 Kz')).toBeTruthy();
  });

  it('keeps every choice when the CTA is pressed with a group still empty', () => {
    const { getByText } = renderScreen('r4-6');
    fireEvent.press(getByText('Queijo extra'));
    fireEvent.press(getByText('Escolher opções'));
    expect(getByText('Falta escolher o tamanho.')).toBeTruthy();
    expect(getByText('Queijo extra')).toBeTruthy();
  });

  it('raises the quantity and the total together', () => {
    const { getByText, getByLabelText } = renderScreen('r4-5');
    fireEvent.press(getByLabelText('Aumentar quantidade'));
    expect(getByText('Adicionar ao carrinho · 3.600 Kz')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @kometa/mobile test -- ProductScreen`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the screen and point the route at it**

The route file becomes a thin shell:

```tsx
// apps/mobile/src/app/(tabs)/(home)/product/[itemId].tsx
import { useLocalSearchParams } from 'expo-router';
import { ProductScreen } from '@/features/product/components/ProductScreen';

export default function ProductDetail() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  return <ProductScreen productId={itemId} />;
}
```

- [ ] **Step 4: Run the tests and typecheck**

Run: `pnpm --filter @kometa/mobile test -- ProductScreen && pnpm --filter @kometa/mobile typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/features/product/components/ProductScreen "apps/mobile/src/app/(tabs)/(home)/product/[itemId].tsx"
git commit -m "feat(product): assemble the rebuilt product detail screen"
```

---

### Task 10: Cut over and delete the old screen

**Files:**
- Modify: `apps/mobile/src/features/home/types.ts` (remove `modifierGroups`, `ModifierGroup`, `ModifierOption`)
- Modify: `apps/mobile/src/features/product/types.ts` (drop the `Omit`)
- Modify: `apps/mobile/src/hooks/CartProvider.tsx`
- Modify: `apps/mobile/src/hooks/useCart.test.tsx`
- Modify: `apps/mobile/src/features/home/mockData.ts` (drop `BURGER_MODIFIER_GROUPS`)
- Modify: `apps/mobile/src/theme/product.ts` → delete; `apps/mobile/src/theme/index.ts` stops exporting it
- Modify: `apps/mobile/src/purchase-flow.test.tsx`
- Delete: `apps/mobile/src/features/home/modifierPricing.ts` and its test
- Delete: `apps/mobile/src/features/home/components/{ProductHero,ProductActionRow,ProductCartBar,ModifierGroupSelector}/`

**Interfaces:**
- Produces: `addItem(item: MenuItem, options?: { selections?: CartSelection[]; notes?: string; unitPrice?: number })`, with `unitPrice` defaulting to `item.price`.

- [ ] **Step 1: Write the failing test**

```tsx
// apps/mobile/src/hooks/useCart.test.tsx — add to the existing suite
it('prices a line at the item price when no unit price is given', () => {
  const { result } = renderHook(() => useCart(), { wrapper });
  act(() => result.current.addItem(burgerItem));
  expect(result.current.subtotal).toBe(burgerItem.price);
});

it('uses the unit price the caller computed for a configured line', () => {
  const { result } = renderHook(() => useCart(), { wrapper });
  act(() =>
    result.current.addItem(burgerItem, {
      selections: [{ groupId: 'extras', optionIds: ['extra-bacon'] }],
      unitPrice: 5500,
    })
  );
  expect(result.current.subtotal).toBe(5500);
});

it('keeps two different configurations of one product as separate lines', () => {
  const { result } = renderHook(() => useCart(), { wrapper });
  act(() => {
    result.current.addItem(burgerItem, {
      selections: [{ groupId: 'pao', optionIds: ['pao-sesame'] }],
      unitPrice: 4500,
    });
    result.current.addItem(burgerItem, {
      selections: [{ groupId: 'pao', optionIds: ['pao-brioche'] }],
      unitPrice: 4500,
    });
  });
  expect(result.current.items).toHaveLength(2);
  expect(result.current.count).toBe(2);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @kometa/mobile test -- useCart`
Expected: FAIL — `addItem` still derives the price and rejects the `unitPrice` option.

- [ ] **Step 3: Make the cutover**

In `CartProvider`, drop the `computeUnitPrice` import and read the price from the options:

```ts
const unitPrice = options?.unitPrice ?? menuItem.price;
```

Then remove `modifierGroups`, `ModifierGroup` and `ModifierOption` from `features/home/types.ts`, delete `modifierPricing.ts` and its test, drop the `Omit` in `features/product/types.ts`, delete the four superseded components and `theme/product.ts`, and update `purchase-flow.test.tsx` to drive the new screen.

- [ ] **Step 4: Run everything**

Run: `pnpm --filter @kometa/mobile test && pnpm --filter @kometa/mobile typecheck && pnpm --filter @kometa/mobile lint`
Expected: PASS, with no reference left to the deleted modules.

- [ ] **Step 5: Commit**

```bash
git add -A apps/mobile/src
git commit -m "refactor(product): cut over to the new module and delete the old screen"
```
