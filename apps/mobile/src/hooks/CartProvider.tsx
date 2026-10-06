import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import type { MenuItem } from '@/features/home/types';

export type CartSelection = {
  groupId: string;
  optionIds: string[];
};

export type CartItem = {
  lineId: string;
  item: MenuItem;
  quantity: number;
  selections: CartSelection[];
  notes?: string;
  unitPrice: number;
  /**
   * Board 05 E. An unavailable line stays visible — with its name, its price
   * and its options — but leaves the subtotal. Removing it from the list
   * instead would leave the customer wondering what the total used to include.
   */
  availability: 'available' | 'unavailable';
};

/**
 * Board 15, `one-cart-one-merchant`. Adding from a second merchant is a
 * question, not an action: the cart is left exactly as it was until the
 * customer answers it.
 */
export type CartConflict = {
  currentMerchantId: string;
  item: MenuItem;
  options?: AddItemOptions;
};

export type ReplaceItemOptions = AddItemOptions & {
  /** Defaults to the quantity of the line being replaced. */
  quantity?: number;
};

export type AddItemOptions = {
  selections?: CartSelection[];
  notes?: string;
  /**
   * What one of these costs as configured. Defaults to `item.price`, which is
   * right for a quick add from a menu row.
   *
   * The cart takes this figure rather than deriving it: pricing a
   * configuration needs the modifier model, which belongs to
   * `features/product`. Deriving it here a second time is how the number on
   * the button and the number in the cart drift apart.
   */
  unitPrice?: number;
};

export type CartContextValue = {
  restaurantId: string | null;
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: MenuItem, options?: AddItemOptions) => void;
  /**
   * Swap one configuration for another in place. Editing a line from the
   * cart has to replace it: adding the edited version and leaving the
   * original would grow the cart instead of changing it.
   */
  replaceItem: (lineId: string, item: MenuItem, options?: ReplaceItemOptions) => void;
  incrementItem: (lineId: string) => void;
  decrementItem: (lineId: string) => void;
  /** `0` removes the line, which is what the stepper's trash icon sends. */
  setQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  /**
   * What revalidation found. Lines named here leave the subtotal and render
   * as unavailable; lines not named are restored, so a merchant restocking
   * between two checks un-greys the line without a reload.
   */
  setUnavailable: (lineIds: string[]) => void;
  /** Set when an add was blocked by the one-merchant rule. */
  conflict: CartConflict | null;
  resolveConflict: (resolution: 'replace' | 'keep') => void;
  clearCart: () => void;
};

type CartState = {
  restaurantId: string | null;
  itemsById: Record<string, CartItem>;
};

const EMPTY_CART: CartState = { restaurantId: null, itemsById: {} };

export const CartContext = createContext<CartContextValue | null>(null);

// Two cart entries are the "same line" only when the item AND every selection AND
// the notes match exactly — otherwise a customized burger would wrongly stack with
// a differently-customized one.
function buildLineId(item: MenuItem, selections: CartSelection[], notes?: string): string {
  const normalized = selections
    .map((selection) => ({
      groupId: selection.groupId,
      optionIds: [...selection.optionIds].sort(),
    }))
    .sort((a, b) => a.groupId.localeCompare(b.groupId));
  return `${item.id}::${JSON.stringify(normalized)}::${notes ?? ''}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(EMPTY_CART);
  const [conflict, setConflict] = useState<CartConflict | null>(null);

  const commitItem = useCallback((menuItem: MenuItem, options?: AddItemOptions) => {
    const selections = options?.selections ?? [];
    const notes = options?.notes;
    const lineId = buildLineId(menuItem, selections, notes);
    const unitPrice = options?.unitPrice ?? menuItem.price;

    setCart((current) => {
      // Reached only once the one-merchant question has been answered, so a
      // different merchant here means the customer chose to replace the cart.
      const itemsById =
        current.restaurantId && current.restaurantId !== menuItem.restaurantId
          ? {}
          : current.itemsById;
      const existing = itemsById[lineId];
      return {
        restaurantId: menuItem.restaurantId,
        itemsById: {
          ...itemsById,
          [lineId]: {
            lineId,
            item: menuItem,
            quantity: (existing?.quantity ?? 0) + 1,
            selections,
            notes,
            unitPrice,
            availability: 'available',
          },
        },
      };
    });
  }, []);

  /**
   * The guarded add. A second merchant raises the conflict instead of wiping
   * the cart, because board 15 gives the customer both answers — "Manter
   * Burger House" has to be able to leave the first cart untouched.
   */
  const addItem = useCallback(
    (menuItem: MenuItem, options?: AddItemOptions) => {
      const current = cart.restaurantId;
      if (current && current !== menuItem.restaurantId) {
        setConflict({ currentMerchantId: current, item: menuItem, options });
        return;
      }
      commitItem(menuItem, options);
    },
    [cart.restaurantId, commitItem]
  );

  const resolveConflict = useCallback(
    (resolution: 'replace' | 'keep') => {
      setConflict((pending) => {
        if (pending && resolution === 'replace') commitItem(pending.item, pending.options);
        return null;
      });
    },
    [commitItem]
  );

  const replaceItem = useCallback(
    (lineId: string, menuItem: MenuItem, options?: ReplaceItemOptions) => {
      const selections = options?.selections ?? [];
      const notes = options?.notes;
      const nextLineId = buildLineId(menuItem, selections, notes);
      const unitPrice = options?.unitPrice ?? menuItem.price;

      setCart((current) => {
        const existing = current.itemsById[lineId];
        // A line that is already gone — removed in another tab, or edited
        // twice — leaves the cart untouched rather than resurrecting itself.
        if (!existing) return current;

        const { [lineId]: _replaced, ...rest } = current.itemsById;
        const quantity = options?.quantity ?? existing.quantity;
        // Editing one configuration into another that already exists merges
        // them, which is what the customer asked for by making them identical.
        const merged = rest[nextLineId];

        return {
          restaurantId: menuItem.restaurantId,
          itemsById: {
            ...rest,
            [nextLineId]: {
              lineId: nextLineId,
              item: menuItem,
              quantity: (merged?.quantity ?? 0) + quantity,
              selections,
              notes,
              unitPrice,
              // An edit is the customer's answer to an unavailable line, so
              // the replacement starts available again.
              availability: 'available',
            },
          },
        };
      });
    },
    []
  );

  const incrementItem = useCallback((lineId: string) => {
    setCart((current) => {
      const existing = current.itemsById[lineId];
      if (!existing) return current;
      return {
        ...current,
        itemsById: {
          ...current.itemsById,
          [lineId]: { ...existing, quantity: existing.quantity + 1 },
        },
      };
    });
  }, []);

  const decrementItem = useCallback((lineId: string) => {
    setCart((current) => {
      const existing = current.itemsById[lineId];
      if (!existing) return current;
      if (existing.quantity <= 1) {
        const { [lineId]: _removed, ...rest } = current.itemsById;
        const hasRemaining = Object.keys(rest).length > 0;
        return { restaurantId: hasRemaining ? current.restaurantId : null, itemsById: rest };
      }
      return {
        ...current,
        itemsById: {
          ...current.itemsById,
          [lineId]: { ...existing, quantity: existing.quantity - 1 },
        },
      };
    });
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setCart((current) => {
      if (!current.itemsById[lineId]) return current;
      const { [lineId]: _removed, ...rest } = current.itemsById;
      const hasRemaining = Object.keys(rest).length > 0;
      return { restaurantId: hasRemaining ? current.restaurantId : null, itemsById: rest };
    });
  }, []);

  const setQuantity = useCallback(
    (lineId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(lineId);
        return;
      }
      setCart((current) => {
        const existing = current.itemsById[lineId];
        if (!existing) return current;
        return {
          ...current,
          itemsById: { ...current.itemsById, [lineId]: { ...existing, quantity } },
        };
      });
    },
    [removeItem]
  );

  const setUnavailable = useCallback((lineIds: string[]) => {
    setCart((current) => {
      const unavailable = new Set(lineIds);
      let changed = false;
      const itemsById = Object.fromEntries(
        Object.entries(current.itemsById).map(([id, entry]) => {
          const availability = unavailable.has(id)
            ? ('unavailable' as const)
            : ('available' as const);
          if (availability !== entry.availability) changed = true;
          return [id, availability === entry.availability ? entry : { ...entry, availability }];
        })
      );
      return changed ? { ...current, itemsById } : current;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart(EMPTY_CART);
    setConflict(null);
  }, []);

  const items = useMemo(() => Object.values(cart.itemsById), [cart.itemsById]);
  const count = useMemo(() => items.reduce((sum, entry) => sum + entry.quantity, 0), [items]);
  /**
   * Unavailable lines are excluded. Board 05 shows the consequence plainly:
   * dropping the drink leaves the subtotal where it was and the total goes
   * *up*, because the promotion it was carrying no longer applies.
   */
  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, entry) =>
          entry.availability === 'unavailable' ? sum : sum + entry.quantity * entry.unitPrice,
        0
      ),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      restaurantId: cart.restaurantId,
      items,
      count,
      subtotal,
      addItem,
      replaceItem,
      incrementItem,
      decrementItem,
      setQuantity,
      removeItem,
      setUnavailable,
      conflict,
      resolveConflict,
      clearCart,
    }),
    [
      cart.restaurantId,
      items,
      count,
      subtotal,
      addItem,
      replaceItem,
      incrementItem,
      decrementItem,
      setQuantity,
      removeItem,
      setUnavailable,
      conflict,
      resolveConflict,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
