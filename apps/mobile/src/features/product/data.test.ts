import { getProductById } from './data';

describe('getProductById', () => {
  it('returns undefined for an unknown id', () => {
    expect(getProductById('nope')).toBeUndefined();
  });

  it('carries the catalogue name, price and photo through unchanged', () => {
    const burger = getProductById('r4-1');
    expect(burger?.name).toBe('Cheeseburger Clássico');
    expect(burger?.price).toBe(3000);
    expect(burger?.imageUrl).toBeTruthy();
  });

  it('defaults a product with no enrichment to available', () => {
    expect(getProductById('r1-1')?.availability).toBe('available');
  });

  it('describes the required bread group by its limits, not by a type flag', () => {
    const bread = getProductById('r4-1')?.modifierGroups?.find((group) => group.id === 'pao');
    expect(bread).toMatchObject({
      minSelections: 1,
      maxSelections: 1,
      pricing: 'delta',
      errorNoun: 'o pão',
    });
  });

  it('describes the optional extras group with a cap above one', () => {
    const extras = getProductById('r4-1')?.modifierGroups?.find((group) => group.id === 'extras');
    expect(extras).toMatchObject({ minSelections: 0, maxSelections: 3, pricing: 'delta' });
  });

  it('keeps an unavailable option visible with the note that explains it', () => {
    const extras = getProductById('r4-1')?.modifierGroups?.find((group) => group.id === 'extras');
    const avocado = extras?.options.find((option) => option.id === 'extra-abacate');
    expect(avocado).toMatchObject({ available: false, unavailableNote: 'Indisponível hoje' });
  });

  it('returns a plain product with no modifier groups but an attribute row', () => {
    const milkshake = getProductById('r4-4');
    expect(milkshake?.modifierGroups).toBeUndefined();
    expect(milkshake?.attributeLayout).toBe('inline');
    expect(milkshake?.attributes?.map((attribute) => attribute.value)).toEqual([
      'Chocolate',
      '400 ml',
      'Disponível',
    ]);
  });

  it('caps the quantity of a product with limited stock', () => {
    expect(getProductById('r4-4')?.maxQuantity).toBe(6);
  });

  it('prices the pizza size group absolutely, not as a delta', () => {
    const size = getProductById('r3-1')?.modifierGroups?.find((group) => group.id === 'tamanho');
    expect(size?.pricing).toBe('absolute');
    expect(size?.options.map((option) => option.price)).toEqual([4000, 6000]);
    expect(size?.errorNoun).toBe('o tamanho');
  });

  it('marks the unavailable product without stripping its price or description', () => {
    const fries = getProductById('r4-3');
    expect(fries?.availability).toBe('unavailable');
    expect(fries?.unavailableNote).toBe('Volte a consultar mais tarde');
    expect(fries?.price).toBe(1200);
    expect(fries?.description).toBeTruthy();
  });

  it('carries offer metadata on the discounted product', () => {
    const double = getProductById('r4-2');
    expect(double?.price).toBe(3800);
    expect(double?.previousPrice).toBe(4600);
    expect(double?.offerLabel).toBe('−17% hoje');
  });
});
