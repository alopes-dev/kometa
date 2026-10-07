import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrdersProvider } from './OrdersProvider';
import { useOrders } from './useOrders';
import { useOrderSimulation } from './useOrderSimulation';
import { STAGE_INTERVAL_MS } from '@/features/orders/simulation';

function wrapper({ children }: { children: ReactNode }) {
  return <OrdersProvider>{children}</OrdersProvider>;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.useFakeTimers();
});
afterEach(() => jest.useRealTimers());

describe('useOrderSimulation', () => {
  /**
   * A screen that owns a timer leaks it. The whole reason the simulation
   * lives outside the component is so unmounting reliably stops it.
   */
  it('stops its clock when the screen goes away', async () => {
    // The environment holds one ambient timer of its own (the AsyncStorage
    // stand-in), so this measures the simulation's timer specifically rather
    // than asserting the process has none.
    const idle = renderHook(() => useOrders(), { wrapper });
    await waitFor(() => expect(idle.result.current.isReady).toBe(true));
    const ambient = jest.getTimerCount();
    idle.unmount();

    const { result, unmount } = renderHook(
      () => {
        useOrderSimulation('CM-10482');
        return useOrders();
      },
      { wrapper }
    );

    // Wait for hydration, or the hook finds no order, starts no clock, and
    // the assertion below passes against a leak it never created.
    await waitFor(() => expect(result.current.isReady).toBe(true));
    await waitFor(() => expect(result.current.byId('CM-10482')).toBeDefined());
    expect(jest.getTimerCount()).toBe(ambient + 1);

    unmount();
    expect(jest.getTimerCount()).toBe(ambient);
  });

  it('runs no clock for an order that is not there', () => {
    renderHook(() => useOrderSimulation('does-not-exist'), { wrapper });
    jest.advanceTimersByTime(STAGE_INTERVAL_MS * 3);
    expect(jest.getTimerCount()).toBe(0);
  });
});
