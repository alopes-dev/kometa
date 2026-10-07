import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { mockOrders } from '../../mockData';
import { TrackingScreen } from './TrackingScreen';

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const NOW = new Date('2026-10-07T19:03:00').getTime();
const fresh = { ...mockOrders[0], stage: 'transit' as const, snapshotAt: NOW - 5_000 };

function renderTracking(props: Partial<Parameters<typeof TrackingScreen>[0]> = {}) {
  return render(
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <ThemeProvider>
        <TrackingScreen
          order={fresh}
          merchantName="Burger House"
          now={NOW}
          onBack={jest.fn()}
          onMessage={jest.fn()}
          onCall={jest.fn()}
          {...props}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

describe('TrackingScreen', () => {
  it('leads with the state, the ETA and how fresh it is', () => {
    renderTracking();
    expect(screen.getByText('O teu pedido está a caminho')).toBeTruthy();
    expect(screen.getByText('Chega em ~12 min')).toBeTruthy();
    expect(screen.getByText('Atualizado agora')).toBeTruthy();
  });

  it('shows the courier at the visibility the stage allows', () => {
    renderTracking();
    expect(screen.getByText('João Manuel')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Mensagem' })).toBeTruthy();
  });

  /** Before assignment there is no courier to show, only the search. */
  it('shows the search card while no courier is assigned', () => {
    renderTracking({ order: { ...fresh, stage: 'confirmed' } });
    expect(screen.getByText('Courier ainda não atribuído')).toBeTruthy();
    expect(screen.queryByText('João Manuel')).toBeNull();
  });

  describe('a delayed delivery', () => {
    /**
     * Board 07 writes `Novo intervalo: 19:22–19:30`. A delay is news about a
     * NEW interval, so it arrives with its own re-estimate rather than
     * reusing the stage's band — which for `transit` is an approximation and
     * has no window to draw.
     */
    it('explains the delay with the new clock window and a new title', () => {
      renderTracking({ delay: { from: NOW, band: { kind: 'range', min: 19, max: 27 } } });
      expect(screen.getByText('O teu pedido continua a caminho')).toBeTruthy();
      expect(screen.getByText('A entrega está a demorar um pouco mais')).toBeTruthy();
      expect(
        screen.getByText('Novo intervalo: 19:22–19:30. Avisamos se houver nova alteração.')
      ).toBeTruthy();
    });
  });

  describe('a stale snapshot', () => {
    /**
     * Review Focus #2. Board 13: the screen keeps showing what it last knew,
     * labelled as last known and datestamped, rather than implying it is
     * live. Board 18 forbids inventing anything newer.
     */
    it('labels the ETA as the last one and dates the update', () => {
      renderTracking({ order: { ...fresh, snapshotAt: NOW - 120_000 } });
      expect(screen.getByText('Último ETA: ~12 min')).toBeTruthy();
      expect(screen.getByText('Última atualização às 19:01')).toBeTruthy();
      expect(screen.queryByText('Atualizado agora')).toBeNull();
    });

    it('still offers the courier and the order state', () => {
      renderTracking({ order: { ...fresh, snapshotAt: NOW - 120_000 } });
      expect(screen.getByText('João Manuel')).toBeTruthy();
      expect(screen.getByLabelText('Estado: A caminho')).toBeTruthy();
    });
  });

  describe('once it has been delivered', () => {
    const DELIVERED_AT = new Date('2026-10-07T19:18:00').getTime();
    const done = {
      ...fresh,
      stage: 'delivered' as const,
      events: [...fresh.events, { stage: 'delivered' as const, occurredAt: DELIVERED_AT }],
    };

    /**
     * Final review, Critical 3. The ETA was resolved without the delivery
     * timestamp, so it rendered as an empty string while the title still
     * said the order was on its way. Board 18 requires `hora real` here.
     */
    it('says it arrived, at the time it arrived', () => {
      renderTracking({ order: done });
      expect(screen.getByText('Entregue às 19:18')).toBeTruthy();
      expect(screen.queryByText('O teu pedido está a caminho')).toBeNull();
    });

    /** Flow A has to be able to finish. */
    it('hands off to the delivered screen', () => {
      const onDelivered = jest.fn();
      renderTracking({ order: done, onDelivered });
      expect(onDelivered).toHaveBeenCalledTimes(1);
    });

    it('does not hand off while the order is still moving', () => {
      const onDelivered = jest.fn();
      renderTracking({ onDelivered });
      expect(onDelivered).not.toHaveBeenCalled();
    });
  });

  describe('with no connection', () => {
    /**
     * Final review, Important 4. Board 13's offline state existed only as
     * unused strings. It keeps every fact on screen, dates them, puts the
     * title in the past tense and offers a way to try again.
     */
    it('says so, dates what it last knew, and offers a retry', () => {
      const onRetry = jest.fn();
      renderTracking({ offline: true, onRetry, order: { ...fresh, snapshotAt: NOW - 120_000 } });

      expect(screen.getByText('Sem conexão')).toBeTruthy();
      expect(screen.getByText('O teu pedido estava a caminho')).toBeTruthy();
      expect(screen.getByText('Último ETA: ~12 min')).toBeTruthy();

      fireEvent.press(screen.getByRole('button', { name: /Tentar novamente/ }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    /** Board 13: "Nunca apagar contexto." */
    it('keeps the courier and the order state reachable', () => {
      renderTracking({ offline: true, onRetry: jest.fn() });
      expect(screen.getByText('João Manuel')).toBeTruthy();
      expect(screen.getByLabelText('Estado: A caminho')).toBeTruthy();
    });
  });

  /** Review Focus #5: no map and no location, and tracking still works. */
  it('keeps state, ETA and contact when the map is gone and location is denied', () => {
    renderTracking({ locationDenied: true });
    expect(screen.getByText('Mapa temporariamente indisponível')).toBeTruthy();
    expect(screen.getByText('Localização desativada')).toBeTruthy();
    expect(screen.getByText('Chega em ~12 min')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ligar' })).toBeTruthy();
  });
});
