import type { Address, AreaCheck, PaymentMethodId, PaymentMethodOption } from './types';

/**
 * Fixtures for the cart and checkout path, transcribed from Figma page
 * `67:4561`. Every value a screen shows comes from here, so the boards and the
 * app can be compared line by line.
 */

/** Board 10 draws exactly these three, in this order. */
export const mockAddresses: Address[] = [
  {
    id: 'home',
    kind: 'home',
    label: 'Casa',
    zone: 'Talatona',
    street: 'Rua do MAT, Condomínio 12',
    reference: 'Portão ao lado da farmácia',
    city: 'Luanda',
  },
  {
    id: 'work',
    kind: 'work',
    label: 'Trabalho',
    zone: 'Alvalade',
    street: 'Avenida Hoji Ya Henda, 44',
    city: 'Luanda',
  },
  {
    id: 'other',
    kind: 'other',
    label: 'Outro',
    zone: 'Kilamba',
    street: 'Quarteirão K, Edifício C9',
    city: 'Luanda',
  },
];

/**
 * The zones this merchant delivers to. Board 15 turns the gap into a sentence
 * — "Ainda não entregamos em Kilamba a partir da Burger House" — so the list
 * of covered zones has to be a fact the screen can check, not a guess.
 */
const DELIVERABLE_ZONES = ['Talatona', 'Alvalade', 'Maianga', 'Ingombota'];

const AREA_ETA_MINUTES = 25;

export function checkDeliveryArea(address: Address, deliveryFee: number): AreaCheck {
  if (!DELIVERABLE_ZONES.includes(address.zone)) {
    return { status: 'outside', zone: address.zone };
  }
  return { status: 'inside', etaMinutes: AREA_ETA_MINUTES, deliveryFee };
}

/**
 * Board 12. Three methods, one per order — the MVP guardrail rules out
 * wallet, credit, BNPL and split payment, so there is nothing else to add.
 *
 * `cash` stays available when the digital methods are down, which is the
 * third screen of the board: the customer is offered the method that still
 * works rather than a dead end.
 */
export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'cash',
    label: 'Pagamento na entrega',
    subtitle: 'Paga ao receber',
    icon: { name: 'cash-outline', sf: 'banknote' },
    available: true,
    settlesOnDelivery: true,
  },
  {
    id: 'card',
    label: 'Cartão',
    subtitle: 'Visa ou Mastercard',
    icon: { name: 'card-outline', sf: 'creditcard' },
    available: true,
    settlesOnDelivery: false,
  },
  {
    id: 'multicaixa',
    label: 'Multicaixa Express',
    subtitle: 'Pagamento seguro no telemóvel',
    icon: { name: 'phone-portrait-outline', sf: 'iphone' },
    available: true,
    settlesOnDelivery: false,
  },
];

export function getPaymentMethod(id: PaymentMethodId): PaymentMethodOption {
  const method = PAYMENT_METHODS.find((candidate) => candidate.id === id);
  if (!method) {
    throw new Error(`Unknown payment method: ${id}`);
  }
  return method;
}

/** Board 11: the three instructions the board offers as one-tap answers. */
export const INSTRUCTION_MAX_LENGTH = 120;

/** Board 17 numbers its confirmed order `#CM-2048`. */
export const ORDER_REFERENCE_PREFIX = '#CM-';
