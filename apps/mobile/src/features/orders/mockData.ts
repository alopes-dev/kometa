import type { OrderRecord } from './store';
import type { Courier, OrderDelivery } from './types';

/**
 * The orders boards 05 and 06 draw, with their own figures.
 *
 * There is no backend in this build. These are the fixtures every orders
 * screen renders from, so the numbers here are the ones a reviewer will check
 * against the Figma.
 *
 * ONE RECONCILIATION. Board 05's card, board 04's confirmation and board 14's
 * refund all write `12.400 Kz` for `#CM-10482`, but board 06 — the only board
 * that shows the arithmetic — breaks the same order down as subtotal 10.900 +
 * entrega 1.200 − desconto 1.000 = **11.100**. The two cannot both be true.
 * Board 06 wins: it is the board that adds up, and a card showing a total that
 * disagrees with its own receipt is the defect the spec's "Valores
 * transparentes" rule exists to prevent. Every screen renders
 * `totals.total`, so the cards read 11.100 Kz.
 */

/** Board 09's courier, on every board that shows one. */
export const mockCourier: Courier = {
  name: 'João Manuel',
  vehicle: 'Toyota Yaris',
  plate: 'ABC-12-34',
  rating: 4.9,
  phone: '+244923456789',
};

/** Board 06's `ENTREGA` card. */
const mockDelivery: OrderDelivery = {
  addressLabel: 'Casa',
  zone: 'Talatona',
  city: 'Luanda',
  instructions: 'Ligar ao chegar. Portão cinzento.',
};

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const now = Date.now();

/**
 * Board 05's active order and its history, in the order the board lists them.
 * `mockOrders[0]` is the one in flight; the rest are `Anteriores`.
 */
export const mockOrders: OrderRecord[] = [
  {
    orderId: 'CM-10482',
    merchantId: 'r1',
    stage: 'transit',
    paymentStatus: 'confirmed',
    placedAt: now - 21 * MINUTE,
    totals: {
      subtotal: 10_900,
      delivery: 1_200,
      deliveryMode: 'normal',
      discount: 1_000,
      total: 11_100,
    },
    lines: [
      { productId: 'r1-1', name: 'Classic Burger', quantity: 1, unitPrice: 5_400 },
      { productId: 'r1-2', name: 'Chicken Burger', quantity: 1, unitPrice: 5_500 },
    ],
    delivery: mockDelivery,
    payment: { brand: 'Visa', last4: '2408' },
    courier: mockCourier,
    events: [
      { stage: 'confirmed', occurredAt: now - 21 * MINUTE },
      { stage: 'preparing', occurredAt: now - 19 * MINUTE },
      { stage: 'ready', occurredAt: now - 8 * MINUTE },
      { stage: 'assigned', occurredAt: now - 6 * MINUTE },
      { stage: 'picked-up', occurredAt: now - 2 * MINUTE },
      { stage: 'transit', occurredAt: now - MINUTE },
    ],
    snapshotAt: now - MINUTE,
  },
  {
    orderId: 'CM-10477',
    merchantId: 'r1',
    stage: 'delivered',
    paymentStatus: 'confirmed',
    placedAt: now - 6 * 60 * MINUTE,
    totals: {
      subtotal: 11_200,
      delivery: 1_200,
      deliveryMode: 'normal',
      discount: 0,
      total: 12_400,
    },
    lines: [
      { productId: 'r1-1', name: 'Classic Burger', quantity: 1, unitPrice: 5_700 },
      { productId: 'r1-3', name: 'Batata Frita', quantity: 1, unitPrice: 5_500 },
    ],
    delivery: mockDelivery,
    payment: { brand: 'Visa', last4: '2408' },
    courier: mockCourier,
    events: [{ stage: 'delivered', occurredAt: now - 5 * 60 * MINUTE }],
    snapshotAt: now - 5 * 60 * MINUTE,
  },
  {
    orderId: 'CM-10465',
    merchantId: 'r2',
    stage: 'delivered',
    paymentStatus: 'confirmed',
    placedAt: now - 9 * DAY,
    totals: { subtotal: 7_300, delivery: 1_200, deliveryMode: 'normal', discount: 0, total: 8_500 },
    lines: [
      { productId: 'r2-1', name: 'Pizza Margherita', quantity: 2, unitPrice: 2_900 },
      { productId: 'r2-2', name: 'Refrigerante', quantity: 1, unitPrice: 1_500 },
    ],
    delivery: mockDelivery,
    payment: { brand: 'Visa', last4: '2408' },
    events: [{ stage: 'delivered', occurredAt: now - 9 * DAY }],
    snapshotAt: now - 9 * DAY,
  },
  {
    orderId: 'CM-10451',
    merchantId: 'r3',
    stage: 'delivered',
    paymentStatus: 'confirmed',
    placedAt: now - 13 * DAY,
    totals: {
      subtotal: 14_500,
      delivery: 1_200,
      deliveryMode: 'normal',
      discount: 0,
      total: 15_700,
    },
    lines: [
      { productId: 'r3-1', name: 'Cabaz semanal', quantity: 1, unitPrice: 9_800 },
      { productId: 'r3-2', name: 'Fruta variada', quantity: 5, unitPrice: 940 },
    ],
    delivery: mockDelivery,
    payment: { brand: 'Visa', last4: '2408' },
    events: [{ stage: 'delivered', occurredAt: now - 13 * DAY }],
    snapshotAt: now - 13 * DAY,
  },
  {
    orderId: 'CM-10433',
    merchantId: 'r4',
    // Board 05 draws this row as `Reembolsado`, so the payment had settled
    // before the order was cancelled — that is what there is to refund.
    stage: 'cancelled',
    paymentStatus: 'confirmed',
    placedAt: now - 18 * DAY,
    totals: { subtotal: 5_000, delivery: 1_200, deliveryMode: 'normal', discount: 0, total: 6_200 },
    lines: [{ productId: 'r4-1', name: 'Paracetamol 500mg', quantity: 2, unitPrice: 2_500 }],
    delivery: mockDelivery,
    payment: { brand: 'Visa', last4: '2408' },
    events: [
      { stage: 'confirmed', occurredAt: now - 18 * DAY },
      { stage: 'cancelled', occurredAt: now - 18 * DAY + 4 * MINUTE },
    ],
    snapshotAt: now - 18 * DAY + 4 * MINUTE,
  },
];
