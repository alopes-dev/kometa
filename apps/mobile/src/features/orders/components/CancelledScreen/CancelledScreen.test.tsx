import { render, screen, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { mockOrders } from '../../mockData';
import { CancelledScreen } from './CancelledScreen';

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderCancelled(props: Partial<Parameters<typeof CancelledScreen>[0]> = {}) {
  return render(
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <ThemeProvider>
        <CancelledScreen
          order={{ ...mockOrders[0], stage: 'cancelled' }}
          onBackToOrders={jest.fn()}
          onHelp={jest.fn()}
          {...props}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

describe('CancelledScreen', () => {
  it('states the outcome and the refund, with the bank named as the variable', () => {
    renderCancelled();
    expect(screen.getByText('O pedido foi cancelado')).toBeTruthy();
    expect(
      screen.getByText('O estorno de 11.100 Kz pode demorar 3–5 dias úteis, conforme o banco.')
    ).toBeTruthy();
    expect(screen.getByText('Estorno iniciado')).toBeTruthy();
  });

  it('offers a way back and a way to get help', () => {
    const onBackToOrders = jest.fn();
    const onHelp = jest.fn();
    renderCancelled({ onBackToOrders, onHelp });
    fireEvent.press(screen.getByRole('button', { name: /Voltar aos pedidos/ }));
    fireEvent.press(screen.getByRole('button', { name: /Preciso de ajuda/ }));
    expect(onBackToOrders).toHaveBeenCalledTimes(1);
    expect(onHelp).toHaveBeenCalledTimes(1);
  });
});
