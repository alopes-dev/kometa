import type { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { CartProvider } from './CartProvider';
import { useCart } from './useCart';
import type { MenuItem } from '@/features/home/types';

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

const burger: MenuItem = {
  id: 'r1-1',
  restaurantId: 'r1',
  name: 'Cheeseburger Clássico',
  description: 'Hambúrguer de carne, queijo cheddar, alface e tomate.',
  price: 3000,
  imageUrl: 'https://picsum.photos/seed/r1-1/200/200',
  category: 'Pratos Principais',
};

const fries: MenuItem = {
  id: 'r1-2',
  restaurantId: 'r1',
  name: 'Batata Frita',
  description: 'Porção de batata frita crocante.',
  price: 1200,
  imageUrl: 'https://picsum.photos/seed/r1-2/200/200',
  category: 'Entradas',
};

const sushi: MenuItem = {
  id: 'r2-1',
  restaurantId: 'r2',
  name: 'Combo Sashimi',
  description: '12 peças variadas de sashimi fresco.',
  price: 7500,
  imageUrl: 'https://picsum.photos/seed/r2-1/200/200',
  category: 'Pratos Principais',
};

describe('useCart', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.count).toBe(0);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.restaurantId).toBeNull();
  });

  it('addItem adds a new item with quantity 1 and no selections', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(fries));
    expect(result.current.items).toEqual([
      { lineId: expect.any(String), item: fries, quantity: 1, selections: [], notes: undefined, unitPrice: 1200 },
    ]);
    expect(result.current.count).toBe(1);
    expect(result.current.subtotal).toBe(1200);
    expect(result.current.restaurantId).toBe('r1');
  });

  it('addItem increments quantity when the same item with no selections is added again', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(fries));
    act(() => result.current.addItem(fries));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.count).toBe(2);
    expect(result.current.subtotal).toBe(2400);
  });

  it('stores the configured unit price the caller passed, on the line and in the subtotal', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() =>
      result.current.addItem(burger, {
        selections: [
          { groupId: 'pao', optionIds: ['pao-brioche'] },
          { groupId: 'extras', optionIds: ['extra-bacon', 'extra-ovo'] },
        ],
        // 3000 base + 300 (brioche) + 700 (bacon) + 500 (ovo), computed by
        // the product screen, which is what the customer saw on the button.
        unitPrice: 4500,
      })
    );
    expect(result.current.items[0].unitPrice).toBe(4500);
    expect(result.current.subtotal).toBe(4500);
  });

  it('treats differently-customized lines of the same item as separate cart lines', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(burger, { selections: [{ groupId: 'pao', optionIds: ['pao-tradicional'] }] }));
    act(() => result.current.addItem(burger, { selections: [{ groupId: 'pao', optionIds: ['pao-brioche'] }] }));
    expect(result.current.items).toHaveLength(2);
    expect(result.current.count).toBe(2);
  });

  it('merges identically-customized lines regardless of selection order', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() =>
      result.current.addItem(burger, {
        selections: [{ groupId: 'extras', optionIds: ['extra-bacon', 'extra-ovo'] }],
      })
    );
    act(() =>
      result.current.addItem(burger, {
        selections: [{ groupId: 'extras', optionIds: ['extra-ovo', 'extra-bacon'] }],
      })
    );
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('treats items with different notes as separate cart lines', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(fries, { notes: 'Sem sal' }));
    act(() => result.current.addItem(fries));
    expect(result.current.items).toHaveLength(2);
  });

  it('incrementItem and decrementItem adjust quantity by lineId', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(fries));
    const { lineId } = result.current.items[0];
    act(() => result.current.incrementItem(lineId));
    expect(result.current.items[0].quantity).toBe(2);
    act(() => result.current.decrementItem(lineId));
    expect(result.current.items[0].quantity).toBe(1);
  });

  it('decrementItem removes the line once quantity reaches zero', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(fries));
    const { lineId } = result.current.items[0];
    act(() => result.current.decrementItem(lineId));
    expect(result.current.items).toEqual([]);
    expect(result.current.restaurantId).toBeNull();
  });

  it('keeps the restaurantId while other lines remain after a removal', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(burger));
    act(() => result.current.addItem(fries));
    const burgerLineId = result.current.items.find((entry) => entry.item.id === burger.id)!.lineId;
    act(() => result.current.decrementItem(burgerLineId));
    expect(result.current.items).toEqual([
      { lineId: expect.any(String), item: fries, quantity: 1, selections: [], notes: undefined, unitPrice: 1200 },
    ]);
    expect(result.current.restaurantId).toBe('r1');
  });

  it('adding an item from a different restaurant replaces the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(fries));
    act(() => result.current.addItem(sushi));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].item).toEqual(sushi);
    expect(result.current.restaurantId).toBe('r2');
  });

  it('clearCart empties the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(fries));
    act(() => result.current.clearCart());
    expect(result.current.items).toEqual([]);
    expect(result.current.restaurantId).toBeNull();
  });

  it('throws when used outside a CartProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useCart())).toThrow('useCart must be used within a CartProvider');
    consoleError.mockRestore();
  });
});

/**
 * The product screen computes the unit price it is showing, and hands it
 * over; the cart no longer derives one. Pricing a configuration needs the
 * modifier model, which lives in `features/product`.
 */
describe('useCart with a caller-supplied unit price', () => {
  it('prices a line at the item price when none is given', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(burger));
    expect(result.current.subtotal).toBe(burger.price);
  });

  /*
   * The number here deliberately matches nothing the cart could derive on
   * its own: it is neither the item price nor the item price plus any
   * selection. Only a cart that takes the caller's figure can produce it.
   */
  it('uses the unit price the caller computed, not one it derives', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() =>
      result.current.addItem(burger, {
        selections: [{ groupId: 'extras', optionIds: ['extra-bacon'] }],
        unitPrice: 8888,
      })
    );
    expect(result.current.subtotal).toBe(8888);
  });

  it('keeps two different configurations of one product as separate lines', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem(burger, {
        selections: [{ groupId: 'pao', optionIds: ['pao-tradicional'] }],
        unitPrice: 3000,
      });
    });
    act(() => {
      result.current.addItem(burger, {
        selections: [{ groupId: 'pao', optionIds: ['pao-brioche'] }],
        unitPrice: 7777,
      });
    });
    expect(result.current.items).toHaveLength(2);
    expect(result.current.count).toBe(2);
    expect(result.current.subtotal).toBe(10777);
  });
})
