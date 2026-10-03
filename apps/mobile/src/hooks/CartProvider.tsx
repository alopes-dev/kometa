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
  incrementItem: (lineId: string) => void;
  decrementItem: (lineId: string) => void;
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
    .map((selection) => ({ groupId: selection.groupId, optionIds: [...selection.optionIds].sort() }))
    .sort((a, b) => a.groupId.localeCompare(b.groupId));
  return `${item.id}::${JSON.stringify(normalized)}::${notes ?? ''}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(EMPTY_CART);

  const addItem = useCallback((menuItem: MenuItem, options?: AddItemOptions) => {
    const selections = options?.selections ?? [];
    const notes = options?.notes;
    const lineId = buildLineId(menuItem, selections, notes);
    const unitPrice = options?.unitPrice ?? menuItem.price;

    setCart((current) => {
      // Adding from a different restaurant than the one already in the cart starts a fresh cart.
      const itemsById =
        current.restaurantId && current.restaurantId !== menuItem.restaurantId ? {} : current.itemsById;
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
          },
        },
      };
    });
  }, []);

  const incrementItem = useCallback((lineId: string) => {
    setCart((current) => {
      const existing = current.itemsById[lineId];
      if (!existing) return current;
      return {
        ...current,
        itemsById: { ...current.itemsById, [lineId]: { ...existing, quantity: existing.quantity + 1 } },
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
        itemsById: { ...current.itemsById, [lineId]: { ...existing, quantity: existing.quantity - 1 } },
      };
    });
  }, []);

  const clearCart = useCallback(() => setCart(EMPTY_CART), []);

  const items = useMemo(() => Object.values(cart.itemsById), [cart.itemsById]);
  const count = useMemo(() => items.reduce((sum, entry) => sum + entry.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, entry) => sum + entry.quantity * entry.unitPrice, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      restaurantId: cart.restaurantId,
      items,
      count,
      subtotal,
      addItem,
      incrementItem,
      decrementItem,
      clearCart,
    }),
    [cart.restaurantId, items, count, subtotal, addItem, incrementItem, decrementItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
