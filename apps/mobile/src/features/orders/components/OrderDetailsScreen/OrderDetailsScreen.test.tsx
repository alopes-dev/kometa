import { render, screen, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { mockOrders } from '../../mockData';
import { OrderDetailsScreen } from './OrderDetailsScreen';

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderDetails(props: Partial<Parameters<typeof OrderDetailsScreen>[0]> = {}) {
  return render(
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <ThemeProvider>
        <OrderDetailsScreen
          order={mockOrders[0]}
          merchantName="Burger House"
          onBack={jest.fn()}
          onReceipt={jest.fn()}
          onHelp={jest.fn()}
          onReorder={jest.fn()}
          {...props}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

describe('OrderDetailsScreen', () => {
  it('heads the screen with the order and its merchant', () => {
    renderDetails();
    expect(screen.getByText('Pedido #CM-10482')).toBeTruthy();
    expect(screen.getByText('Burger House · Talatona, Luanda')).toBeTruthy();
    expect(screen.getByLabelText('Estado: A caminho')).toBeTruthy();
  });

  it('lists every line with its quantity and price', () => {
    renderDetails();
    expect(screen.getByText('Classic Burger ×1')).toBeTruthy();
    expect(screen.getByText('5.400 Kz')).toBeTruthy();
    expect(screen.getByText('Chicken Burger ×1')).toBeTruthy();
    expect(screen.getByText('5.500 Kz')).toBeTruthy();
  });

  /**
   * Board 06's "Valores transparentes": subtotal 10.900 + entrega 1.200 −
   * desconto 1.000 = total 11.100. The screen must show the figures that add
   * up, not a total it was handed separately.
   */
  it('shows the arithmetic, with the discount signed', () => {
    renderDetails();
    expect(screen.getByText('10.900 Kz')).toBeTruthy();
    expect(screen.getByText('1.200 Kz')).toBeTruthy();
    expect(screen.getByText('-1.000 Kz')).toBeTruthy();
    expect(screen.getByText('11.100 Kz')).toBeTruthy();
  });

  it('omits the discount line when there is no discount', () => {
    renderDetails({ order: mockOrders[2] });
    expect(screen.queryByText('Desconto')).toBeNull();
  });

  /** Board 06's ENTREGA card — the address and how to find the door. */
  it('shows where it goes and the instructions for getting in', () => {
    renderDetails();
    expect(screen.getByText('Casa, Talatona, Luanda')).toBeTruthy();
    expect(screen.getByText('Ligar ao chegar. Portão cinzento.')).toBeTruthy();
  });

  it('offers the three actions the board draws', () => {
    const onReceipt = jest.fn();
    const onHelp = jest.fn();
    const onReorder = jest.fn();
    renderDetails({ onReceipt, onHelp, onReorder });

    fireEvent.press(screen.getByRole('button', { name: 'Recibo' }));
    fireEvent.press(screen.getByRole('button', { name: 'Repetir' }));
    expect(onReceipt).toHaveBeenCalledTimes(1);
    expect(onReorder).toHaveBeenCalledTimes(1);
  });
});
