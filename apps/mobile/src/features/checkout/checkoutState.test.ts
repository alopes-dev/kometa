import { deriveCtaContract, type CheckoutSnapshot } from './checkoutState';

const ready: CheckoutSnapshot = {
  step: 'review',
  cart: 'ready',
  delivery: 'valid',
  payment: 'selected',
  order: 'draft',
  total: 12400,
  remainingToMinimum: 0,
};

describe('deriveCtaContract', () => {
  it('names the destination and the amount when everything is satisfied', () => {
    expect(deriveCtaContract(ready)).toEqual({
      label: 'Pagar 12.400 Kz',
      tone: 'brand',
      enabled: true,
    });
  });

  it('says where the cart is going instead of what it pays', () => {
    expect(deriveCtaContract({ ...ready, step: 'cart' })).toMatchObject({
      label: 'Continuar para pagamento · 12.400 Kz',
      enabled: true,
    });
  });

  it('blocks on a missing payment method and says which one is missing', () => {
    expect(deriveCtaContract({ ...ready, payment: 'unselected' })).toEqual({
      label: 'Seleciona o pagamento',
      tone: 'disabled',
      enabled: false,
    });
  });

  it('blocks on a missing address', () => {
    expect(deriveCtaContract({ ...ready, delivery: 'missing' })).toEqual({
      label: 'Adiciona um endereço',
      tone: 'disabled',
      enabled: false,
    });
  });

  /**
   * Review focus 4. The CTA has one slot and two reasons can be true at once.
   * The one closest to the cart wins: fixing the payment method would not let
   * a below-minimum basket through, so saying so first would be a lie.
   */
  it('prefers the blocking reason closest to the cart', () => {
    const contract = deriveCtaContract({
      ...ready,
      cart: 'below-minimum',
      delivery: 'missing',
      payment: 'unselected',
      remainingToMinimum: 1300,
    });
    expect(contract).toEqual({ label: 'Faltam 1.300 Kz', tone: 'disabled', enabled: false });
  });

  it('asks for the outstanding changes to be accepted before anything else', () => {
    expect(deriveCtaContract({ ...ready, cart: 'invalid' })).toEqual({
      label: 'Aceitar alterações',
      tone: 'brand',
      enabled: true,
    });
  });

  it('shows progress and locks while the payment is in flight', () => {
    expect(deriveCtaContract({ ...ready, order: 'submitting', payment: 'processing' })).toEqual({
      label: 'A processar pagamento…',
      tone: 'brand',
      enabled: false,
      icon: 'spinner',
    });
  });

  /**
   * Board 14, `processing → pending`: a payment waiting on the provider is
   * still not a failure, and the button must not invite a second attempt.
   */
  it('keeps the button locked while a payment is pending', () => {
    expect(deriveCtaContract({ ...ready, order: 'pending' })).toMatchObject({
      enabled: false,
      icon: 'spinner',
    });
  });

  it('confirms once, in the brand, with a check', () => {
    expect(deriveCtaContract({ ...ready, order: 'confirmed', payment: 'success' })).toEqual({
      label: 'Pagamento confirmado',
      tone: 'brand',
      enabled: false,
      icon: 'check',
    });
  });

  it('offers a retry in the destructive tone after a failure', () => {
    expect(deriveCtaContract({ ...ready, order: 'failed', payment: 'failed' })).toEqual({
      label: 'Tentar novamente',
      tone: 'destructive',
      enabled: true,
    });
  });

  it('waits for the total rather than showing a figure it does not have', () => {
    expect(deriveCtaContract({ ...ready, cart: 'loading' })).toEqual({
      label: 'A carregar total…',
      tone: 'disabled',
      enabled: false,
    });
  });

  it('sends an empty cart to the restaurants instead of to a payment', () => {
    expect(deriveCtaContract({ ...ready, cart: 'empty', total: 0 })).toEqual({
      label: 'Explorar restaurantes',
      tone: 'brand',
      enabled: true,
    });
  });

  /**
   * An in-flight quantity change must not let a stale total be paid, but it
   * also must not re-label the button — board 05 keeps the CTA in place and
   * simply stops it from firing.
   */
  it('holds the button while a line is updating', () => {
    expect(deriveCtaContract({ ...ready, cart: 'updating', step: 'cart' })).toMatchObject({
      label: 'Continuar para pagamento · 12.400 Kz',
      enabled: false,
    });
  });

  it('removes and continues when the only problem is an unavailable line', () => {
    expect(
      deriveCtaContract({ ...ready, step: 'cart', cart: 'invalid', onlyUnavailable: true })
    ).toEqual({
      label: 'Remover e continuar',
      tone: 'destructive',
      enabled: true,
    });
  });
});
