import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { mockOrders } from '../../mockData';
import { OrderHistoryRow } from './OrderHistoryRow';

const now = new Date('2026-10-07T19:03:00').getTime();

function renderRow(order = mockOrders[1], merchantName = 'Burger House', onPress = jest.fn()) {
  render(
    <ThemeProvider>
      <OrderHistoryRow order={order} merchantName={merchantName} now={now} onPress={onPress} />
    </ThemeProvider>
  );
  return onPress;
}

describe('OrderHistoryRow', () => {
  it('shows the merchant, the meta line, the total and the state', () => {
    const order = { ...mockOrders[1], placedAt: now - 3_600_000 };
    renderRow(order);
    expect(screen.getByText('Burger House')).toBeTruthy();
    expect(screen.getByText('Hoje · 2 itens')).toBeTruthy();
    expect(screen.getByText('12.400 Kz')).toBeTruthy();
    expect(screen.getByLabelText('Estado: Pedido entregue')).toBeTruthy();
  });

  it('opens the order when pressed', () => {
    const onPress = renderRow();
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  /**
   * Board 05's last row: `Farmácia Central · 19 set · Reembolsado` with a
   * `Cancelado` chip. The refund is the meta line's news, not a second chip.
   */
  it('says Reembolsado in the meta line of a refunded order', () => {
    const refunded = { ...mockOrders[4], placedAt: new Date('2026-09-19T12:00:00').getTime() };
    renderRow(refunded, 'Farmácia Central');
    expect(screen.getByText('19 set · Reembolsado')).toBeTruthy();
    expect(screen.getByLabelText('Estado: Pedido cancelado')).toBeTruthy();
  });
});
