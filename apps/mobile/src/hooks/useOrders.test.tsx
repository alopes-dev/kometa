import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrdersProvider } from './OrdersProvider';
import { useOrders } from './useOrders';
import type { PlaceOrderInput } from './OrdersProvider';

function wrapper({ children }: { children: ReactNode }) {
  return <OrdersProvider>{children}</OrdersProvider>;
}

const placed: PlaceOrderInput = {
  orderId: 'CM-20001',
  merchantId: 'r1',
  totals: {
    subtotal: 10_900,
    delivery: 1_200,
    deliveryMode: 'normal',
    discount: 1_000,
    total: 11_100,
  },
  lines: [{ productId: 'r1-1', name: 'Classic Burger', quantity: 1, unitPrice: 5_400 }],
  delivery: { addressLabel: 'Casa', zone: 'Talatona', city: 'Luanda' },
  paymentStatus: 'confirmed',
};

async function renderOrders() {
  const view = renderHook(() => useOrders(), { wrapper });
  await waitFor(() => expect(view.result.current.isReady).toBe(true));
  return view;
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('useOrders', () => {
  it('throws outside its provider rather than returning an empty store', () => {
    expect(() => renderHook(() => useOrders())).toThrow(/OrdersProvider/);
  });

  /**
   * Board 15: a settled payment starts the operational lifecycle at its
   * first stage. The order becomes real and trackable at this moment.
   */
  it('starts a confirmed order on the line at pending', async () => {
    const { result } = await renderOrders();

    await act(async () => {
      result.current.placeOrder(placed);
    });

    expect(result.current.byId('CM-20001')).toMatchObject({
      stage: 'pending',
      paymentStatus: 'confirmed',
    });
  });

  /**
   * Board 15 again: "Enquanto o pagamento está pendente, o pedido não aparece
   * como Confirmado nem inicia ETA operacional." No stage means no ETA.
   */
  it('leaves an unsettled order off the line entirely', async () => {
    const { result } = await renderOrders();

    await act(async () => {
      result.current.placeOrder({ ...placed, orderId: 'CM-20002', paymentStatus: 'pending' });
    });

    expect(result.current.byId('CM-20002')?.stage).toBeNull();
    expect(result.current.active?.orderId).not.toBe('CM-20002');
  });

  it('advances an order and records when each stage happened', async () => {
    const { result } = await renderOrders();

    await act(async () => {
      result.current.placeOrder(placed);
    });
    await act(async () => {
      result.current.advance('CM-20001', { stage: 'confirmed', occurredAt: 7_000 });
    });

    const order = result.current.byId('CM-20001');
    expect(order).toMatchObject({ stage: 'confirmed', snapshotAt: 7_000 });
    expect(order?.events).toContainEqual({ stage: 'confirmed', occurredAt: 7_000 });
  });

  /** Board 14: the cancelled order enters the history with its reason. */
  it('cancels an order without losing the events it already had', async () => {
    const { result } = await renderOrders();

    await act(async () => {
      result.current.placeOrder(placed);
    });
    await act(async () => {
      result.current.advance('CM-20001', { stage: 'confirmed', occurredAt: 7_000 });
    });
    await act(async () => {
      result.current.cancel('CM-20001', 'Enganei-me no pedido');
    });

    const order = result.current.byId('CM-20001');
    expect(order?.stage).toBe('cancelled');
    expect(order?.cancelReason).toBe('Enganei-me no pedido');
    expect(order?.events).toContainEqual({ stage: 'confirmed', occurredAt: 7_000 });
  });

  /** A placed order must survive the app being closed. */
  it('restores what it saved', async () => {
    const first = await renderOrders();
    await act(async () => {
      first.result.current.placeOrder(placed);
    });
    await waitFor(async () => {
      expect(await AsyncStorage.getItem('kometa:orders')).toContain('CM-20001');
    });

    const second = await renderOrders();
    expect(second.result.current.byId('CM-20001')).toBeDefined();
  });
});
