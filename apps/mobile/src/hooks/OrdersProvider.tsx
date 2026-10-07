import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { OrderSummary, PaymentStatus } from '@/features/checkout/types';
import { mockOrders } from '@/features/orders/mockData';
import {
  activeOrder,
  applyStageEvent,
  historyOrders,
  loadOrders,
  saveOrders,
  type OrderRecord,
} from '@/features/orders/store';
import type { StageEvent } from '@/features/orders/timeline';
import type { OrderDelivery, OrderLine, OrderPayment } from '@/features/orders/types';

/**
 * Every order this device knows about.
 *
 * Mounted inside `CheckoutFlowProvider` because an order is created from a
 * checkout: the payment settles, and this is what the result becomes.
 */

export type PlaceOrderInput = {
  orderId: string;
  merchantId: string;
  totals: OrderSummary;
  lines: OrderLine[];
  delivery: OrderDelivery;
  payment?: OrderPayment;
  paymentStatus: PaymentStatus;
  placedAt?: number;
};

export type OrdersContextValue = {
  orders: OrderRecord[];
  /** The one order still in flight, if any. */
  active: OrderRecord | undefined;
  /** Everything finished, newest first. */
  history: OrderRecord[];
  byId: (orderId: string) => OrderRecord | undefined;
  placeOrder: (input: PlaceOrderInput) => void;
  advance: (orderId: string, event: StageEvent) => void;
  cancel: (orderId: string, reason: string) => void;
  /** False until the saved orders have been read back. */
  isReady: boolean;
};

export const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isReady, setIsReady] = useState(false);
  // Nothing is written back until the first read has finished, so an empty
  // initial state cannot overwrite the orders already on disk.
  const hydrated = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadOrders().then((result) => {
      if (cancelled) return;
      // With no backend, a genuinely empty device is seeded from the board's
      // fixtures so the orders list has the content the Figma draws.
      if (result.ok) {
        setOrders(result.orders.length > 0 ? result.orders : mockOrders);
        hydrated.current = true;
      } else {
        // The read FAILED — the device may well hold real orders this process
        // could not see. Showing nothing is recoverable; writing fixtures over
        // them is not, so persistence stays switched off for this session.
        setOrders([]);
      }
      setIsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    void saveOrders(orders);
  }, [orders]);

  const placeOrder = useCallback((input: PlaceOrderInput) => {
    const placedAt = input.placedAt ?? Date.now();
    setOrders((current) => [
      {
        orderId: input.orderId,
        merchantId: input.merchantId,
        // Board 15: only a settled payment starts the operational lifecycle.
        // Anything else has no stage at all, so no ETA can be read off it.
        stage: input.paymentStatus === 'confirmed' ? 'pending' : null,
        paymentStatus: input.paymentStatus,
        placedAt,
        totals: input.totals,
        lines: input.lines,
        delivery: input.delivery,
        payment: input.payment,
        events: [],
        snapshotAt: placedAt,
      },
      ...current.filter((order) => order.orderId !== input.orderId),
    ]);
  }, []);

  const advance = useCallback((orderId: string, event: StageEvent) => {
    setOrders((current) =>
      current.map((order) => (order.orderId === orderId ? applyStageEvent(order, event) : order))
    );
  }, []);

  const cancel = useCallback((orderId: string, reason: string) => {
    setOrders((current) =>
      current.map((order) => {
        if (order.orderId !== orderId) return order;
        const cancelled = applyStageEvent(order, { stage: 'cancelled', occurredAt: Date.now() });
        return { ...cancelled, cancelReason: reason };
      })
    );
  }, []);

  const value = useMemo<OrdersContextValue>(
    () => ({
      orders,
      active: activeOrder(orders),
      history: historyOrders(orders),
      byId: (orderId) => orders.find((order) => order.orderId === orderId),
      placeOrder,
      advance,
      cancel,
      isReady,
    }),
    [orders, placeOrder, advance, cancel, isReady]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}
