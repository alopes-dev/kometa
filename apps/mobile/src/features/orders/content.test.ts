import { content } from './content';
import { mockOrders } from './mockData';

const at = (iso: string) => new Date(iso).getTime();

describe('itemCount', () => {
  /** Board 05 writes `2 itens` and `1 item` — the noun changes, not just the number. */
  it('uses the singular for one item', () => {
    expect(content.itemCount(1)).toBe('1 item');
  });

  it('uses the plural for anything else', () => {
    expect(content.itemCount(2)).toBe('2 itens');
    expect(content.itemCount(6)).toBe('6 itens');
    expect(content.itemCount(0)).toBe('0 itens');
  });
});

describe('historyMeta', () => {
  const now = at('2026-10-07T19:03:00');

  /** Board 05's first history row reads `Hoje · 2 itens`. */
  it('says Hoje for an order placed today', () => {
    expect(content.historyMeta(at('2026-10-07T12:10:00'), 2, now)).toBe('Hoje · 2 itens');
  });

  /** And `28 set · 3 itens` for an older one. */
  it('writes a short date for an older order', () => {
    expect(content.historyMeta(at('2026-09-28T12:10:00'), 3, now)).toBe('28 set · 3 itens');
  });

  it('says Ontem for yesterday rather than a date', () => {
    expect(content.historyMeta(at('2026-10-06T23:50:00'), 1, now)).toBe('Ontem · 1 item');
  });

  /**
   * An order placed four minutes after midnight is still today. Comparing
   * elapsed milliseconds rather than calendar days would call it yesterday.
   */
  it('compares calendar days, not elapsed hours', () => {
    expect(content.historyMeta(at('2026-10-07T00:04:00'), 1, now)).toBe('Hoje · 1 item');
  });
});

describe('etaLine', () => {
  it('prefixes the band the way board 05 writes it', () => {
    expect(content.etaLine({ kind: 'approx', minutes: 12 })).toBe('Chega em ~12 min');
    expect(content.etaLine({ kind: 'range', min: 25, max: 35 })).toBe('Chega em 25–35 min');
  });

  /** A delivered order reports when, not how long. */
  it('states the delivery time rather than an arrival', () => {
    expect(content.etaLine({ kind: 'time', at: at('2026-10-07T19:18:00') })).toBe(
      'Entregue às 19:18'
    );
  });

  it('says nothing for an order with no ETA', () => {
    expect(content.etaLine({ kind: 'none' })).toBe('');
  });
});

describe('etaSpoken', () => {
  /**
   * Board 16, AX3: `Chega em aproximadamente 12 minutos`. A screen reader
   * must not have to pronounce `~` or an abbreviation.
   */
  it('spells the ETA out for a screen reader', () => {
    expect(content.etaSpoken({ kind: 'approx', minutes: 12 })).toBe(
      'Chega em aproximadamente 12 minutos'
    );
    expect(content.etaSpoken({ kind: 'range', min: 25, max: 35 })).toBe('Chega em 25 a 35 minutos');
  });

  it('uses the singular minute where it must', () => {
    expect(content.etaSpoken({ kind: 'approx', minutes: 1 })).toBe(
      'Chega em aproximadamente 1 minuto'
    );
  });
});

describe('refundBody', () => {
  /** Board 14, verbatim. */
  it('states the amount and the bank-dependent window', () => {
    expect(content.refundBody(12_400)).toBe(
      'O estorno de 12.400 Kz pode demorar 3–5 dias úteis, conforme o banco.'
    );
  });
});

describe('confirmedBody', () => {
  it('names the merchant that received the order', () => {
    expect(content.confirmedBody('Burger House')).toBe('A Burger House já recebeu o teu pedido.');
  });
});

describe('activeOrderLabel', () => {
  /** Board 16's semantic label for the Active Order Card, verbatim. */
  it('reads the whole card as one sentence', () => {
    const order = { ...mockOrders[0], orderId: 'CM-10482', stage: 'transit' as const };
    expect(content.activeOrderLabel(order, 'Burger House')).toBe(
      'Pedido CM-10482, Burger House, a caminho, chega em aproximadamente 12 minutos. Botão acompanhar pedido.'
    );
  });
});
