import { describeCartLine, describeSelections } from './cartDisplay';
import type { MenuItem } from '@/features/home/types';

/*
 * The catalogue item that carries modifier groups. Option labels are no
 * longer inlined on the fixture: `describeSelections` resolves them through
 * the product feature, so the ids here have to be ones that exist.
 */
const burger: MenuItem = {
  id: 'r4-1',
  restaurantId: 'r4',
  name: 'Cheeseburger Clássico',
  description: 'Hambúrguer de carne, queijo cheddar, alface e tomate.',
  price: 3000,
  imageUrl: 'https://picsum.photos/seed/r4-1/200/200',
  category: 'Pratos Principais',
};

describe('describeSelections', () => {
  it('joins the chosen option labels across groups', () => {
    const summary = describeSelections(burger, [
      { groupId: 'pao', optionIds: ['pao-brioche'] },
      { groupId: 'extras', optionIds: ['extra-bacon', 'extra-queijo'] },
    ]);
    expect(summary).toBe('Brioche, Bacon, Extra queijo');
  });

  it('returns an empty string when there are no selections', () => {
    expect(describeSelections(burger, [])).toBe('');
  });
});

describe('describeCartLine', () => {
  it('combines selections and notes', () => {
    const summary = describeCartLine(burger, [{ groupId: 'pao', optionIds: ['pao-brioche'] }], 'Sem cebola');
    expect(summary).toBe('Brioche · Sem cebola');
  });

  it('falls back to the item description when there are no selections or notes', () => {
    expect(describeCartLine(burger, [])).toBe(burger.description);
  });
});
