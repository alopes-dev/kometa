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
  it('stops its clock when the screen goes away', () => {
    const { result, unmount } = renderHook(
      () => {
        useOrderSimulation('CM-10482');
        return useOrders();
      },
      { wrapper }
    );

    unmount();
    const before = jest.getTimerCount();
    jest.advanceTimersByTime(STAGE_INTERVAL_MS * 5);
    expect(before).toBe(0);
    expect(result.current).toBeDefined();
  });

  it('runs no clock for an order that is not there', () => {
    renderHook(() => useOrderSimulation('does-not-exist'), { wrapper });
    jest.advanceTimersByTime(STAGE_INTERVAL_MS * 3);
    expect(jest.getTimerCount()).toBe(0);
  });
});
