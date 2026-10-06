import { checkDeliveryArea, getPaymentMethod, mockAddresses, PAYMENT_METHODS } from './mockData';

describe('getPaymentMethod', () => {
  it('returns the matching method for each known id', () => {
    for (const method of PAYMENT_METHODS) {
      expect(getPaymentMethod(method.id)).toEqual(method);
    }
  });

  it('throws for an unknown id', () => {
    // @ts-expect-error - intentionally passing an invalid id to verify the guard
    expect(() => getPaymentMethod('bitcoin')).toThrow('Unknown payment method: bitcoin');
  });

  /** Board 12: cash is what remains when the digital methods are down. */
  it('keeps cash settling on delivery and the digital methods not', () => {
    expect(getPaymentMethod('cash').settlesOnDelivery).toBe(true);
    expect(getPaymentMethod('card').settlesOnDelivery).toBe(false);
    expect(getPaymentMethod('multicaixa').settlesOnDelivery).toBe(false);
  });
});

describe('checkDeliveryArea', () => {
  it('accepts a covered zone and carries the ETA and the fee', () => {
    const home = mockAddresses.find((address) => address.id === 'home')!;
    expect(checkDeliveryArea(home, 1200)).toEqual({
      status: 'inside',
      etaMinutes: 25,
      deliveryFee: 1200,
    });
  });

  /** Board 15 names the zone in the refusal, so the check has to return it. */
  it('refuses an uncovered zone and names it', () => {
    const other = mockAddresses.find((address) => address.id === 'other')!;
    expect(checkDeliveryArea(other, 1200)).toEqual({ status: 'outside', zone: 'Kilamba' });
  });
});
