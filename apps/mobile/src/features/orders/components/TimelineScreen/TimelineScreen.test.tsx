import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { mockOrders } from '../../mockData';
import { TimelineScreen } from './TimelineScreen';

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderTimeline(order = mockOrders[0]) {
  return render(
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <ThemeProvider>
        <TimelineScreen order={order} merchantName="Burger House" onBack={jest.fn()} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

describe('TimelineScreen', () => {
  it('heads with the order, the merchant and the zone', () => {
    renderTimeline();
    expect(screen.getByText('Pedido #CM-10482')).toBeTruthy();
    expect(screen.getByText('Burger House · Talatona')).toBeTruthy();
  });

  it('lists the stages that have happened, with their times', () => {
    renderTimeline();
    expect(screen.getByText('Pedido confirmado')).toBeTruthy();
    expect(screen.getByText('Pedido recolhido')).toBeTruthy();
  });

  /**
   * Review Focus #3. Board 10, "Futuro sem promessa": at `arrived`, the order
   * has not been delivered, so `Entregue` is still upcoming and carries no
   * time — even though delivery is moments away.
   */
  it('leaves Entregue undated while the courier is still at the door', () => {
    renderTimeline({ ...mockOrders[0], stage: 'arrived' });
    expect(screen.getByLabelText('Pedido entregue, a seguir')).toBeTruthy();
  });

  it('dates Entregue once it has actually happened', () => {
    const delivered = {
      ...mockOrders[0],
      stage: 'delivered' as const,
      events: [
        ...mockOrders[0].events,
        { stage: 'delivered' as const, occurredAt: new Date('2026-10-07T19:18:00').getTime() },
      ],
    };
    renderTimeline(delivered);
    expect(screen.getByText('19:18')).toBeTruthy();
  });
});
