import type { ReactNode } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHECKOUT_SESSION_KEY } from '@/features/checkout/session';
import type { MenuItem } from '@/features/home/types';
import { CartProvider } from './CartProvider';
import { CheckoutFlowProvider } from './CheckoutFlowProvider';
import { useCart } from './useCart';
import { useCheckoutFlow } from './useCheckoutFlow';
import { useCheckoutSession } from './useCheckoutSession';

function wrapper({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <CheckoutFlowProvider>{children}</CheckoutFlowProvider>
    </CartProvider>
  );
}

const burger: MenuItem = {
  id: 'r4-1',
  restaurantId: 'r4',
  name: 'Classic Burger',
  description: 'Carne grelhada, queijo, alface e molho da casa.',
  price: 5700,
  imageUrl: 'https://example.test/burger.png',
  category: 'Hambúrgueres',
};

function useAll() {
  return { cart: useCart(), flow: useCheckoutFlow(), session: useCheckoutSession() };
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('useCheckoutSession', () => {
  it('reports no session when nothing was saved', async () => {
    const { result } = renderHook(() => useCheckoutSession(), { wrapper });
    await waitFor(() => expect(result.current.isChecking).toBe(false));
    expect(result.current.restored).toBeNull();
  });

  /** Board 19 · 04 lists exactly what must survive; the save writes all of it. */
  it('persists the cart and the choices made around it', async () => {
    const { result } = renderHook(() => useAll(), { wrapper });
    await waitFor(() => expect(result.current.session.isChecking).toBe(false));

    act(() => result.current.cart.addItem(burger));
    act(() => result.current.flow.setAddressId('home'));
    act(() => result.current.flow.setPromoCode('COMETA1500'));
    act(() => result.current.flow.setInstructions('Ligar ao chegar.'));

    await waitFor(async () => {
      const raw = await AsyncStorage.getItem(CHECKOUT_SESSION_KEY);
      expect(raw).toBeTruthy();
      const saved = JSON.parse(raw as string);
      expect(saved).toMatchObject({
        merchantId: 'r4',
        addressId: 'home',
        promoCode: 'COMETA1500',
        instructions: 'Ligar ao chegar.',
      });
      expect(saved.lines).toHaveLength(1);
      expect(saved.lines[0]).toMatchObject({ productId: 'r4-1', quantity: 1, unitPrice: 5700 });
    });
  });

  /**
   * The saved session is what the resume prompt is made of. Overwriting it
   * with the empty cart that is being offered the prompt would delete the very
   * thing the customer is about to restore.
   */
  it('does not overwrite a saved session with an empty cart', async () => {
    await AsyncStorage.setItem(
      CHECKOUT_SESSION_KEY,
      JSON.stringify({ merchantId: 'r4', lines: [{ lineId: 'a', productId: 'r4-1', quantity: 1, unitPrice: 5700 }], savedAt: 1 })
    );

    const { result } = renderHook(() => useCheckoutSession(), { wrapper });
    await waitFor(() => expect(result.current.isChecking).toBe(false));

    expect(result.current.restored).toMatchObject({ merchantId: 'r4' });
    const raw = await AsyncStorage.getItem(CHECKOUT_SESSION_KEY);
    expect(JSON.parse(raw as string).lines).toHaveLength(1);
  });

  it('discarding clears both the prompt and the stored session', async () => {
    await AsyncStorage.setItem(
      CHECKOUT_SESSION_KEY,
      JSON.stringify({ merchantId: 'r4', lines: [], savedAt: 1 })
    );
    const { result } = renderHook(() => useCheckoutSession(), { wrapper });
    await waitFor(() => expect(result.current.restored).not.toBeNull());

    act(() => result.current.discard());

    expect(result.current.restored).toBeNull();
    await waitFor(async () => expect(await AsyncStorage.getItem(CHECKOUT_SESSION_KEY)).toBeNull());
  });
});
