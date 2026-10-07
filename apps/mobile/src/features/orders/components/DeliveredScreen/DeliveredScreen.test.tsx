import { render, screen, fireEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { mockOrders } from '../../mockData';
import { DeliveredScreen } from './DeliveredScreen';

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const DELIVERED_AT = new Date('2026-10-07T19:18:00').getTime();
const delivered = {
  ...mockOrders[0],
  stage: 'delivered' as const,
  events: [...mockOrders[0].events, { stage: 'delivered' as const, occurredAt: DELIVERED_AT }],
};

function renderDelivered(props: Partial<Parameters<typeof DeliveredScreen>[0]> = {}) {
  return render(
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <ThemeProvider>
        <DeliveredScreen
          order={delivered}
          onRate={jest.fn()}
          onBackToOrders={jest.fn()}
          {...props}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

beforeEach(() => jest.clearAllMocks());

describe('DeliveredScreen', () => {
  it('reports the delivery and when it happened', () => {
    renderDelivered();
    expect(screen.getByText('Pedido entregue')).toBeTruthy();
    expect(screen.getByText('Esperamos que aproveites!')).toBeTruthy();
    expect(screen.getByText('Entregue às 19:18')).toBeTruthy();
  });

  it('shows where it was left', () => {
    renderDelivered();
    expect(screen.getByText('Casa, Talatona, Luanda')).toBeTruthy();
  });

  it('offers the two actions the board draws', () => {
    const onRate = jest.fn();
    const onBackToOrders = jest.fn();
    renderDelivered({ onRate, onBackToOrders });
    fireEvent.press(screen.getByRole('button', { name: /Avaliar pedido/ }));
    fireEvent.press(screen.getByRole('button', { name: /Voltar aos pedidos/ }));
    expect(onRate).toHaveBeenCalledTimes(1);
    expect(onBackToOrders).toHaveBeenCalledTimes(1);
  });

  it('fires the success haptic exactly once', () => {
    renderDelivered();
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
  });
});
