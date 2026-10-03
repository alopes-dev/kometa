import {
  canAdd,
  findFirstIncompleteGroup,
  isOptionSelectable,
  isRadioGroup,
  resolveGroupStatus,
} from './validation';
import { getProductById } from './data';

const burger = getProductById('r4-1')!;
const milkshake = getProductById('r4-4')!;
const fries = getProductById('r4-3')!; // unavailable
const pizza = getProductById('r3-1')!;

const bread = burger.modifierGroups!.find((group) => group.id === 'pao')!;
const extras = burger.modifierGroups!.find((group) => group.id === 'extras')!;

const sesame = { groupId: 'pao', optionIds: ['pao-tradicional'] };
const fullExtras = {
  groupId: 'extras',
  optionIds: ['extra-bacon', 'extra-queijo', 'extra-cogumelos'],
};

describe('isRadioGroup', () => {
  it('is true only when exactly one choice is both required and allowed', () => {
    expect(isRadioGroup(bread)).toBe(true);
    expect(isRadioGroup(extras)).toBe(false);
  });
});

describe('resolveGroupStatus', () => {
  it('is incomplete when a required group has nothing selected', () => {
    expect(resolveGroupStatus(bread, undefined)).toBe('incomplete');
  });

  it('is satisfied once the required group has its one option', () => {
    expect(resolveGroupStatus(bread, sesame)).toBe('satisfied');
  });

  it('is satisfied when an optional group is left empty', () => {
    expect(resolveGroupStatus(extras, undefined)).toBe('satisfied');
  });

  it('is full once a multi-select group reaches its cap', () => {
    expect(resolveGroupStatus(extras, fullExtras)).toBe('full');
  });

  it('is satisfied, not full, below the cap', () => {
    expect(resolveGroupStatus(extras, { groupId: 'extras', optionIds: ['extra-bacon'] })).toBe(
      'satisfied'
    );
  });

  // Review Focus 1 — a radio group is never "full".
  it('never reports a radio group as full', () => {
    expect(resolveGroupStatus(bread, sesame)).not.toBe('full');
  });
});

describe('isOptionSelectable', () => {
  // Review Focus 1 — the regression this model invites.
  it('keeps every option of a satisfied radio group selectable, so it can be switched', () => {
    const brioche = bread.options.find((option) => option.id === 'pao-brioche')!;
    expect(isOptionSelectable(bread, sesame, brioche)).toBe(true);
  });

  it('blocks a new option once a multi-select group is full', () => {
    const spare = { ...extras.options[0], id: 'extra-outro', available: true };
    expect(isOptionSelectable(extras, fullExtras, spare)).toBe(false);
  });

  it('still allows deselecting an option already chosen in a full group', () => {
    const bacon = extras.options.find((option) => option.id === 'extra-bacon')!;
    expect(isOptionSelectable(extras, fullExtras, bacon)).toBe(true);
  });

  it('blocks an unavailable option whatever the group state', () => {
    const avocado = extras.options.find((option) => option.id === 'extra-abacate')!;
    expect(isOptionSelectable(extras, undefined, avocado)).toBe(false);
  });

  it('allows an option in an empty multi-select group', () => {
    const bacon = extras.options.find((option) => option.id === 'extra-bacon')!;
    expect(isOptionSelectable(extras, undefined, bacon)).toBe(true);
  });
});

describe('findFirstIncompleteGroup', () => {
  it('returns the first group in board order that is not satisfied', () => {
    expect(findFirstIncompleteGroup(burger, [])).toBe('pao');
  });

  it('returns null once every required group is answered', () => {
    expect(findFirstIncompleteGroup(burger, [sesame])).toBeNull();
  });

  it('returns null for a product with no groups', () => {
    expect(findFirstIncompleteGroup(milkshake, [])).toBeNull();
  });

  it('finds the required size group on the pizza', () => {
    expect(findFirstIncompleteGroup(pizza, [])).toBe('tamanho');
  });
});

describe('canAdd', () => {
  it('is true for a plain available product', () => {
    expect(canAdd(milkshake, [])).toBe(true);
  });

  it('is false while a required group is unanswered', () => {
    expect(canAdd(burger, [])).toBe(false);
  });

  it('is true once the required group is answered', () => {
    expect(canAdd(burger, [sesame])).toBe(true);
  });

  it('is false for an unavailable product even with nothing left to choose', () => {
    expect(canAdd(fries, [])).toBe(false);
  });
});
