import { render, screen, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { RejectedScreen } from './RejectedScreen';

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderRejected(props: Partial<Parameters<typeof RejectedScreen>[0]> = {}) {
  return render(
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <ThemeProvider>
        <RejectedScreen
          merchantName="Burger House"
          onReviewCart={jest.fn()}
          onExplore={jest.fn()}
          {...props}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

describe('RejectedScreen', () => {
  it('names the merchant that could not accept, without blaming the customer', () => {
    renderRejected();
    expect(screen.getByText('A Burger House não conseguiu aceitar o pedido')).toBeTruthy();
  });

  /**
   * Board 13: "Não houve cobrança" is the first thing a customer needs, and
   * the chip repeats it so it survives a glance.
   */
  it('says plainly that nothing was charged', () => {
    renderRejected();
    expect(
      screen.getByText('Não houve cobrança. Podes rever o carrinho ou escolher outro restaurante.')
    ).toBeTruthy();
    expect(screen.getByText('Sem cobrança')).toBeTruthy();
  });

  it('offers both next steps the board draws', () => {
    const onReviewCart = jest.fn();
    const onExplore = jest.fn();
    renderRejected({ onReviewCart, onExplore });
    fireEvent.press(screen.getByRole('button', { name: /Rever carrinho/ }));
    fireEvent.press(screen.getByRole('button', { name: /Explorar restaurantes/ }));
    expect(onReviewCart).toHaveBeenCalledTimes(1);
    expect(onExplore).toHaveBeenCalledTimes(1);
  });
});
