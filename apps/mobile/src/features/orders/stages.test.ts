import {
  ORDER_STAGES,
  courierVisibility,
  isTerminal,
  nextStage,
  stageCopy,
  stageIndex,
} from './stages';

describe('ORDER_STAGES', () => {
  it('runs in the order board 18 lists them, with cancelled outside the line', () => {
    expect(ORDER_STAGES).toEqual([
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'assigned',
      'picked-up',
      'transit',
      'arriving',
      'arrived',
      'delivered',
    ]);
    expect(ORDER_STAGES).not.toContain('cancelled');
  });
});

describe('stageCopy', () => {
  /** Board 18's table, verbatim. Portuguese of Angola. */
  it('gives every stage the human copy the board writes', () => {
    expect(stageCopy('pending')).toBe('A confirmar');
    expect(stageCopy('confirmed')).toBe('Pedido confirmado');
    expect(stageCopy('preparing')).toBe('A preparar');
    expect(stageCopy('ready')).toBe('Pronto para recolha');
    expect(stageCopy('assigned')).toBe('Courier atribuído');
    expect(stageCopy('picked-up')).toBe('Pedido recolhido');
    expect(stageCopy('transit')).toBe('A caminho');
    expect(stageCopy('arriving')).toBe('A chegar');
    expect(stageCopy('arrived')).toBe('Courier chegou');
    expect(stageCopy('delivered')).toBe('Pedido entregue');
    expect(stageCopy('cancelled')).toBe('Pedido cancelado');
  });
});

describe('courierVisibility', () => {
  /**
   * Board 18's third column, which board 09 draws as four distinct cards.
   * `none` is the absence of a card, not a card that says nothing.
   */
  it('hides the courier before there is one to show', () => {
    expect(courierVisibility('pending')).toBe('none');
    expect(courierVisibility('preparing')).toBe('none');
    expect(courierVisibility('cancelled')).toBe('none');
  });

  it('says it is looking while the merchant has no courier yet', () => {
    expect(courierVisibility('confirmed')).toBe('searching');
    expect(courierVisibility('ready')).toBe('searching');
  });

  it('reveals identity on assignment and contact from pickup onwards', () => {
    expect(courierVisibility('assigned')).toBe('identity');
    expect(courierVisibility('picked-up')).toBe('contact');
    expect(courierVisibility('transit')).toBe('contact');
    expect(courierVisibility('arriving')).toBe('contact');
    expect(courierVisibility('arrived')).toBe('contact');
  });

  it('closes contact once the delivery is done', () => {
    expect(courierVisibility('delivered')).toBe('closed');
  });
});

describe('stageIndex', () => {
  it('orders the operational line', () => {
    expect(stageIndex('pending')).toBe(0);
    expect(stageIndex('transit')).toBeGreaterThan(stageIndex('ready'));
  });

  /** Cancelled is not late in the line — it is off it. */
  it('places cancelled outside the line rather than at its end', () => {
    expect(stageIndex('cancelled')).toBe(-1);
  });
});

describe('nextStage', () => {
  it('advances along the line', () => {
    expect(nextStage('pending')).toBe('confirmed');
    expect(nextStage('arriving')).toBe('arrived');
    expect(nextStage('arrived')).toBe('delivered');
  });

  it('stops at the terminals', () => {
    expect(nextStage('delivered')).toBeNull();
    expect(nextStage('cancelled')).toBeNull();
  });
});

describe('isTerminal', () => {
  it('is true only where the order stops moving', () => {
    expect(isTerminal('delivered')).toBe(true);
    expect(isTerminal('cancelled')).toBe(true);
    expect(isTerminal('arrived')).toBe(false);
  });
});
