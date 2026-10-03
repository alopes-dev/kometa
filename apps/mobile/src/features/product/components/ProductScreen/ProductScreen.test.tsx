import { render, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { CartProvider } from '@/hooks/CartProvider';
import { TabBarVisibilityProvider } from '@/hooks/TabBarVisibilityProvider';
import { ProductScreen } from './ProductScreen';

// Navigation is the navigator's job; the screen only calls back() and
// push(). Mocked here the way the flow suites already mock it.
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), dismiss: jest.fn() }),
    useLocalSearchParams: () => ({}),
    // The real hook runs its effect on focus; a mounted screen in a test is
    // focused, so it runs once on mount.
    useFocusEffect: (callback: () => void | (() => void)) => {
      React.useEffect(callback, [callback]);
    },
    Stack: Object.assign(() => null, { Screen: () => null }),
    Link: () => null,
  };
});

function renderScreen(productId: string) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <ThemeProvider>
        <TabBarVisibilityProvider>
          <CartProvider>
            <ProductScreen productId={productId} />
          </CartProvider>
        </TabBarVisibilityProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

describe('ProductScreen', () => {
  it('tells the customer when the product does not exist', () => {
    const { getByText } = renderScreen('nope');
    expect(getByText('Produto não encontrado')).toBeTruthy();
  });

  it('shows a plain product ready to add', () => {
    const { getAllByText, getByText } = renderScreen('r4-4');
    // Twice by design: the header's title, and the hero's compact title that
    // takes its place once the photograph has collapsed away.
    expect(getAllByText('Milkshake de Chocolate')).toHaveLength(2);
    expect(getByText('Adicionar ao carrinho · 1.800 Kz')).toBeTruthy();
  });

  // Ruling 2 — nothing is pre-selected, so the board's validation flow exists.
  it('starts a customizable product with its required group unanswered', () => {
    const { getByText } = renderScreen('r4-1');
    expect(getByText('Escolher opções')).toBeTruthy();
  });

  it('becomes addable once the required group is answered', () => {
    const { getByText } = renderScreen('r4-1');
    fireEvent.press(getByText('Tradicional'));
    expect(getByText('Adicionar ao carrinho · 3.000 Kz')).toBeTruthy();
  });

  it('adds an extra to the total as soon as it is ticked', () => {
    const { getByText } = renderScreen('r4-1');
    fireEvent.press(getByText('Tradicional'));
    fireEvent.press(getByText('Bacon'));
    expect(getByText('Adicionar ao carrinho · 3.700 Kz')).toBeTruthy();
  });

  // Review Focus 1, end to end: the group must stay switchable on the screen.
  it('switches the chosen bread instead of freezing on the first option', () => {
    const { getByText } = renderScreen('r4-1');
    fireEvent.press(getByText('Brioche'));
    expect(getByText('Adicionar ao carrinho · 3.300 Kz')).toBeTruthy();
    fireEvent.press(getByText('Tradicional'));
    expect(getByText('Adicionar ao carrinho · 3.000 Kz')).toBeTruthy();
  });

  it('reveals the unanswered group and keeps every choice when add is pressed early', () => {
    const { getByText, queryByText } = renderScreen('r3-1');
    fireEvent.press(getByText('Queijo extra'));
    expect(queryByText('Falta escolher o tamanho.')).toBeNull();

    fireEvent.press(getByText('Escolher opções'));

    expect(getByText('Falta escolher o tamanho.')).toBeTruthy();
    // The extra the customer already picked survives the press.
    expect(getByText('Queijo extra')).toBeTruthy();
    expect(getByText('1/3')).toBeTruthy();
  });

  it('clears the validation message once the group is answered', () => {
    const { getByText, queryByText } = renderScreen('r3-1');
    fireEvent.press(getByText('Escolher opções'));
    expect(getByText('Falta escolher o tamanho.')).toBeTruthy();

    fireEvent.press(getByText('Grande'));
    expect(queryByText('Falta escolher o tamanho.')).toBeNull();
  });

  it('raises the quantity and the total together', () => {
    const { getByText, getByLabelText } = renderScreen('r4-4');
    fireEvent.press(getByLabelText('Aumentar quantidade'));
    expect(getByText('Adicionar ao carrinho · 3.600 Kz')).toBeTruthy();
  });

  it('keeps an unavailable product readable with an inert CTA', () => {
    const { getAllByText, getByText } = renderScreen('r4-3');
    expect(getAllByText('Batata Frita').length).toBeGreaterThan(0);
    expect(getByText('Indisponível')).toBeTruthy();
    // The product stays explained rather than reduced to its refusal.
    expect(getAllByText('Temporariamente indisponível').length).toBeGreaterThan(0);
    expect(getByText('Volte a consultar mais tarde')).toBeTruthy();
  });

  it('carries the configured line into the cart at the price shown', () => {
    const { getByText, getByLabelText } = renderScreen('r4-1');
    fireEvent.press(getByText('Tradicional'));
    fireEvent.press(getByText('Bacon'));
    fireEvent.press(getByLabelText('Adicionar ao carrinho, total 3.700 Kz'));
    // The cart bar the screen renders reflects what was added.
    expect(getByText('Adicionar ao carrinho · 3.700 Kz')).toBeTruthy();
  });
});
