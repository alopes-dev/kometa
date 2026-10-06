import type { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { CheckoutFlowProvider } from './CheckoutFlowProvider';
import { useCheckoutFlow } from './useCheckoutFlow';
import type { Order } from '@/features/checkout/types';

function wrapper({ children }: { children: ReactNode }) {
  return <CheckoutFlowProvider>{children}</CheckoutFlowProvider>;
}

const order: Order = {
  orderId: '#CM-2048',
  status: 'confirmed',
  totals: { subtotal: 12700, delivery: 1200, deliveryMode: 'normal', discount: 1500, total: 12400 },
  createdAt: 1700000000000,
};

describe('useCheckoutFlow', () => {
  it('starts with nothing collected', () => {
    const { result } = renderHook(() => useCheckoutFlow(), { wrapper });
    expect(result.current).toMatchObject({
      addressId: null,
      instructions: '',
      phone: '',
      paymentMethodId: null,
      promoCode: null,
      order: null,
    });
  });

  it('stores each decision the path collects', () => {
    const { result } = renderHook(() => useCheckoutFlow(), { wrapper });
    act(() => result.current.setAddressId('home'));
    act(() => result.current.setInstructions('Ligar ao chegar.'));
    act(() => result.current.setPhone('+244 923 456 789'));
    act(() => result.current.setPaymentMethodId('cash'));
    act(() => result.current.setPromoCode('COMETA1500'));

    expect(result.current).toMatchObject({
      addressId: 'home',
      instructions: 'Ligar ao chegar.',
      phone: '+244 923 456 789',
      paymentMethodId: 'cash',
      promoCode: 'COMETA1500',
    });
  });

  /**
   * Board 13, "Voltar sem perder dados": revisiting a step must not clear the
   * ones after it. Choosing a second address keeps the instructions written
   * for the first, because they are the customer's words, not the address's.
   */
  it('keeps every other field when one is revised', () => {
    const { result } = renderHook(() => useCheckoutFlow(), { wrapper });
    act(() => result.current.setInstructions('Portão castanho.'));
    act(() => result.current.setPaymentMethodId('card'));
    act(() => result.current.setAddressId('work'));

    expect(result.current.instructions).toBe('Portão castanho.');
    expect(result.current.paymentMethodId).toBe('card');
  });

  it('carries the order once one exists', () => {
    const { result } = renderHook(() => useCheckoutFlow(), { wrapper });
    act(() => result.current.setOrder(order));
    expect(result.current.order).toEqual(order);
  });

  it('clearing a promotion is distinct from never having had one', () => {
    const { result } = renderHook(() => useCheckoutFlow(), { wrapper });
    act(() => result.current.setPromoCode('COMETA1500'));
    act(() => result.current.setPromoCode(null));
    expect(result.current.promoCode).toBeNull();
  });

  it('reset returns to the initial state', () => {
    const { result } = renderHook(() => useCheckoutFlow(), { wrapper });
    act(() => result.current.setAddressId('home'));
    act(() => result.current.setPaymentMethodId('cash'));
    act(() => result.current.setOrder(order));
    act(() => result.current.reset());

    expect(result.current).toMatchObject({ addressId: null, paymentMethodId: null, order: null });
  });

  it('throws outside a provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useCheckoutFlow())).toThrow(
      'useCheckoutFlow must be used within a CheckoutFlowProvider'
    );
    spy.mockRestore();
  });
});
