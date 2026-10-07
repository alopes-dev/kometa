import { render, screen, fireEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { mockOrders } from '../../mockData';
import { ConfirmationScreen } from './ConfirmationScreen';

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/** Board 04 draws the order the moment it is placed: no stage has landed yet. */
const justPlaced = { ...mockOrders[0], stage: 'pending' as const, events: [] };

function renderConfirmation(props: Partial<Parameters<typeof ConfirmationScreen>[0]> = {}) {
  return render(
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <ThemeProvider>
        <ConfirmationScreen
          order={justPlaced}
          merchantName="Burger House"
          onTrack={jest.fn()}
          onKeepExploring={jest.fn()}
          {...props}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

beforeEach(() => jest.clearAllMocks());

describe('ConfirmationScreen', () => {
  it('confirms in words, not only with a mark', () => {
    renderConfirmation();
    expect(screen.getByText('Pedido confirmado!')).toBeTruthy();
    expect(screen.getByText('A Burger House já recebeu o teu pedido.')).toBeTruthy();
  });

  /**
   * Board 04, "Confiança em primeiro lugar": ícone, título e número do pedido
   * formam uma redundância acessível. The order number is the part a customer
   * quotes to support, so it is on the first screen they see.
   */
  it('states the order number, the merchant and the total', () => {
    renderConfirmation();
    expect(screen.getByText('#CM-10482')).toBeTruthy();
    expect(screen.getByText('Burger House')).toBeTruthy();
    expect(screen.getByText('11.100 Kz')).toBeTruthy();
  });

  /**
   * Board 04, "ETA sem falsa precisão": "Enquanto o courier não está
   * atribuído, usa-se 25–35 min." A single number here would be a promise the
   * app has no basis for.
   */
  it('gives the ETA as an interval, never as one number', () => {
    renderConfirmation();
    expect(screen.getByText('Chega em 25–35 min')).toBeTruthy();
  });

  it('offers the two actions the board draws', () => {
    const onTrack = jest.fn();
    const onKeepExploring = jest.fn();
    renderConfirmation({ onTrack, onKeepExploring });
    fireEvent.press(screen.getByRole('button', { name: /Acompanhar pedido/ }));
    fireEvent.press(screen.getByRole('button', { name: /Continuar a explorar/ }));
    expect(onTrack).toHaveBeenCalledTimes(1);
    expect(onKeepExploring).toHaveBeenCalledTimes(1);
  });

  /** Board 18 puts a success haptic here — once. "Nunca repetitivo." */
  it('fires the success haptic exactly once', () => {
    renderConfirmation();
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success
    );
  });
});
