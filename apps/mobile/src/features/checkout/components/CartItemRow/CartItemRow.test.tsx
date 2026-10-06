import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import type { CartItem } from '@/hooks/CartProvider';
import { CartItemRow } from './CartItemRow';

const entry: CartItem = {
  lineId: 'line-1',
  item: {
    id: 'r4-1',
    restaurantId: 'r4',
    name: 'Classic Burger',
    description: 'Carne grelhada, queijo, alface e molho da casa.',
    price: 5700,
    imageUrl: 'https://example.test/burger.png',
    category: 'Hambúrgueres',
  },
  quantity: 1,
  selections: [],
  unitPrice: 5700,
  availability: 'available',
};

function renderRow(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('CartItemRow', () => {
  it('states the name, what it was configured as, and what the line costs', () => {
    renderRow(<CartItemRow entry={entry} description="Carne · queijo · molho da casa" />);
    expect(screen.getByText('Classic Burger')).toBeTruthy();
    expect(screen.getByText('Carne · queijo · molho da casa')).toBeTruthy();
    expect(screen.getByText('5.700 Kz')).toBeTruthy();
  });

  /** A line of two reads as what it costs, not as what one of them costs. */
  it('prices the whole line, not one unit of it', () => {
    renderRow(<CartItemRow entry={{ ...entry, quantity: 2 }} description="Grande" />);
    expect(screen.getByText('11.400 Kz')).toBeTruthy();
  });

  /**
   * Board 03 draws a trash can at quantity 1 and a minus above it. The icon
   * has to say the line is about to go before the press, not after.
   */
  it('offers removal rather than a decrement at the last unit', () => {
    const onDecrement = jest.fn();
    renderRow(<CartItemRow entry={entry} description="Grande" onDecrement={onDecrement} />);
    fireEvent.press(screen.getByRole('button', { name: 'Remover' }));
    expect(onDecrement).toHaveBeenCalled();
  });

  it('offers a decrement above the last unit', () => {
    renderRow(
      <CartItemRow entry={{ ...entry, quantity: 3 }} description="Grande" onDecrement={jest.fn()} />
    );
    expect(screen.getByRole('button', { name: 'Menos' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Remover' })).toBeNull();
  });

  it('increments', () => {
    const onIncrement = jest.fn();
    renderRow(<CartItemRow entry={entry} description="Grande" onIncrement={onIncrement} />);
    fireEvent.press(screen.getByRole('button', { name: 'Mais' }));
    expect(onIncrement).toHaveBeenCalled();
  });

  /** Board 05: the line stays readable, and says why it cannot be ordered. */
  it('replaces the options line with the reason when the item is unavailable', () => {
    renderRow(
      <CartItemRow
        entry={entry}
        description="Carne · queijo"
        state="unavailable"
        onEdit={jest.fn()}
      />
    );
    expect(screen.getByText('Indisponível neste momento')).toBeTruthy();
    expect(screen.queryByText('Carne · queijo')).toBeNull();
    expect(screen.getByText('Classic Burger')).toBeTruthy();
    expect(screen.getByText('5.700 Kz')).toBeTruthy();
  });

  it('withdraws the edit affordance while the item is unavailable', () => {
    renderRow(<CartItemRow entry={entry} description="x" state="unavailable" onEdit={jest.fn()} />);
    expect(screen.queryByRole('button', { name: 'Editar' })).toBeNull();
  });

  it('says a line is updating instead of leaving it looking idle', () => {
    renderRow(<CartItemRow entry={entry} description="Grande" state="updating" />);
    expect(screen.getByText('A atualizar…')).toBeTruthy();
  });

  it('says a line is being edited', () => {
    renderRow(
      <CartItemRow entry={entry} description="Grande" state="editing" onEdit={jest.fn()} />
    );
    expect(screen.getByText('A editar opções')).toBeTruthy();
  });

  it('opens the editor', () => {
    const onEdit = jest.fn();
    renderRow(<CartItemRow entry={entry} description="Grande" onEdit={onEdit} />);
    fireEvent.press(screen.getByRole('button', { name: 'Editar' }));
    expect(onEdit).toHaveBeenCalled();
  });
});
