import {
  dedupeByEvent,
  destinationFor,
  lockScreenBody,
  type OrderNotification,
} from './notifications';

const base = { orderId: 'CM-10482', occurredAt: 1_000, title: 't', body: 'b' };

describe('destinationFor', () => {
  /** Board 12: "Cada notificação abre detalhe, tracking, mapa, pagamento ou avaliação sem perder contexto." */
  it('routes each event board 12 lists to the destination it draws', () => {
    expect(destinationFor('order_confirmed')).toBe('details');
    expect(destinationFor('courier_assigned')).toBe('tracking');
    expect(destinationFor('order_picked_up')).toBe('tracking');
    expect(destinationFor('arriving')).toBe('map');
    expect(destinationFor('delivered')).toBe('rating');
    expect(destinationFor('delayed')).toBe('tracking');
    expect(destinationFor('payment_pending')).toBe('payment');
    expect(destinationFor('courier_reassigned')).toBe('tracking');
  });
});

describe('dedupeByEvent', () => {
  /** Board 12: "Deduplicar por eventId." A retried push must not stack. */
  it('keeps one row per event id', () => {
    const rows: OrderNotification[] = [
      { ...base, eventId: 'e1', event: 'order_confirmed' },
      { ...base, eventId: 'e1', event: 'order_confirmed' },
      { ...base, eventId: 'e2', event: 'delivered' },
    ];
    expect(dedupeByEvent(rows).map((row) => row.eventId)).toEqual(['e1', 'e2']);
  });

  it('keeps the first arrival, not the last', () => {
    const rows: OrderNotification[] = [
      { ...base, eventId: 'e1', event: 'order_confirmed', occurredAt: 1_000 },
      { ...base, eventId: 'e1', event: 'order_confirmed', occurredAt: 5_000 },
    ];
    expect(dedupeByEvent(rows)[0].occurredAt).toBe(1_000);
  });
});

describe('lockScreenBody', () => {
  /**
   * Board 12, "Conteúdo privado": "Lock screen evita morada completa,
   * instruções de acesso e telefone do courier." The in-app body may carry
   * them; what shows on a locked device may not.
   */
  it('strips the address, the access instructions and the courier phone', () => {
    const body = lockScreenBody({
      merchantName: 'Burger House',
      addressLabel: 'Casa',
      street: 'Rua do MAT, Condomínio 12',
      instructions: 'Ligar ao chegar. Portão cinzento.',
      courierPhone: '+244923456789',
      event: 'arriving',
    });

    expect(body).not.toContain('Rua do MAT');
    expect(body).not.toContain('Portão cinzento');
    expect(body).not.toContain('+244923456789');
    expect(body).not.toContain('Condomínio');
  });

  it('still says enough to be worth unlocking for', () => {
    const body = lockScreenBody({
      merchantName: 'Burger House',
      addressLabel: 'Casa',
      street: 'Rua do MAT, Condomínio 12',
      instructions: 'Ligar ao chegar.',
      courierPhone: '+244923456789',
      event: 'arriving',
    });
    expect(body).toContain('Casa');
    expect(body.length).toBeGreaterThan(0);
  });
});
