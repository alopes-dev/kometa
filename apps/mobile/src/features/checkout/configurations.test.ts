import { countSeparateConfigurations } from './configurations';
import type { CartItem } from '@/hooks/CartProvider';
import type { MenuItem } from '@/features/home/types';

const burger = { id: 'r4-1', price: 3000 } as MenuItem;
const fries = { id: 'r4-3', price: 1200 } as MenuItem;

const line = (id: string, item: MenuItem): CartItem => ({
  lineId: id,
  item,
  quantity: 1,
  selections: [],
  notes: undefined,
  unitPrice: item.price,
});

describe('countSeparateConfigurations', () => {
  it('is zero when every line is a different product', () => {
    expect(countSeparateConfigurations([line('a', burger), line('b', fries)])).toBe(0);
  });

  it('is zero for an empty cart', () => {
    expect(countSeparateConfigurations([])).toBe(0);
  });

  /*
   * Board 05 E: "O mesmo produto permanece separado para não misturar
   * escolhas." The count is how many lines belong to a product that appears
   * more than once — those are the ones a customer could mistake for a
   * mistake.
   */
  it('counts the lines of a product that appears more than once', () => {
    const items = [line('a', burger), line('b', burger)];
    expect(countSeparateConfigurations(items)).toBe(2);
  });

  it('ignores products that appear only once', () => {
    const items = [line('a', burger), line('b', burger), line('c', fries)];
    expect(countSeparateConfigurations(items)).toBe(2);
  });

  it('counts three configurations of one product', () => {
    const items = [line('a', burger), line('b', burger), line('c', burger)];
    expect(countSeparateConfigurations(items)).toBe(3);
  });
});
