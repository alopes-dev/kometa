import { render, screen } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './HomeScreen';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { CartProvider } from '@/hooks/CartProvider';
import { mockOrders } from '@/features/orders/mockData';
import { RESTAURANT_CARD_WIDTH } from '../RestaurantCard';
import { CAROUSEL_GAP } from './HomeScreen.styles';

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderHome() {
  return render(
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <ThemeProvider>
        <CartProvider>
          <HomeScreen />
        </CartProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

describe('HomeScreen', () => {
  it('renders every section the board draws, in order', () => {
    const { getByText } = renderHome();
    for (const title of [
      'O que te apetece?',
      'Para ti',
      'Popular perto de ti',
      'Ofertas para ti',
      'Perto de ti',
      'Pedir novamente',
      'Hi Kometa',
    ]) {
      expect(getByText(title)).toBeTruthy();
    }
  });

  it('snaps each carousel to one card, so a swipe never rests mid-card', () => {
    const { UNSAFE_getAllByType } = renderHome();
    const carousels = UNSAFE_getAllByType(ScrollView).filter((node) => node.props.horizontal);

    expect(carousels.length).toBeGreaterThan(0);
    for (const carousel of carousels) {
      expect(carousel.props.snapToInterval).toBe(RESTAURANT_CARD_WIDTH + CAROUSEL_GAP);
      expect(carousel.props.decelerationRate).toBe('fast');
      expect(carousel.props.snapToAlignment).toBe('start');
    }
  });
});

describe('the active order card on Home', () => {
  const order = {
    ...mockOrders[0],
    stage: 'transit' as const,
  };

  /**
   * Final review, Important 18. Task 14 required this and it was never
   * written: the card is the whole reason Home reads the order store.
   */
  it('shows the order in flight', () => {
    render(
      <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
        <ThemeProvider>
          <CartProvider>
            <HomeScreen activeOrder={order} activeOrderMerchant="Burger House" />
          </CartProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    );
    // The merchant name also appears on the restaurant carousels, so the
    // order number is what identifies this card specifically.
    expect(screen.getByText('#CM-10482')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Acompanhar pedido/ })).toBeTruthy();
  });

  /** Board 05 keeps it only while there IS one. */
  it('draws nothing once there is no order in flight', () => {
    render(
      <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
        <ThemeProvider>
          <CartProvider>
            <HomeScreen />
          </CartProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    );
    expect(screen.queryByRole('button', { name: /Acompanhar pedido/ })).toBeNull();
  });
});
