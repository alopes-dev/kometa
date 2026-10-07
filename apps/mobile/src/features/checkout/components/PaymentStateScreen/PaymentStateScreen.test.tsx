import { render, screen, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { PaymentStateScreen } from './PaymentStateScreen';

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderState(props: Partial<Parameters<typeof PaymentStateScreen>[0]> = {}) {
  return render(
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <ThemeProvider>
        <PaymentStateScreen
          state="pending"
          merchantName="Burger House"
          orderId="CM-10482"
          total={12_400}
          onPrimary={jest.fn()}
          onSecondary={jest.fn()}
          {...props}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

describe('PaymentStateScreen · pending', () => {
  /**
   * Board 15: the customer has something left to do, and the consequence of
   * not doing it is named — the merchant has not started.
   */
  it('says what is outstanding and what it is holding up', () => {
    renderState();
    expect(screen.getByText('Pagamento pendente')).toBeTruthy();
    expect(
      screen.getByText('Conclui o pagamento para a Burger House começar a preparar o pedido.')
    ).toBeTruthy();
  });

  it('identifies the order and the amount', () => {
    renderState();
    expect(screen.getByText('#CM-10482')).toBeTruthy();
    expect(screen.getByText('12.400 Kz')).toBeTruthy();
  });

  it('offers completing the payment or cancelling the order', () => {
    const onPrimary = jest.fn();
    const onSecondary = jest.fn();
    renderState({ onPrimary, onSecondary });
    fireEvent.press(screen.getByRole('button', { name: /Concluir pagamento/ }));
    fireEvent.press(screen.getByRole('button', { name: /Cancelar pedido/ }));
    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(onSecondary).toHaveBeenCalledTimes(1);
  });

  /**
   * Review Focus #1. Board 15: "Enquanto o pagamento está pendente, o pedido
   * não aparece como Confirmado nem inicia ETA operacional." No stage, no
   * delivery estimate, nothing that reads as an accepted order.
   */
  it('shows no operational state and no ETA', () => {
    renderState();
    expect(screen.queryByText(/Chega em/)).toBeNull();
    expect(screen.queryByText(/Confirmado/)).toBeNull();
    expect(screen.queryByText(/A caminho/)).toBeNull();
  });
});

describe('PaymentStateScreen · failed', () => {
  /** Board 15: "Diz se houve cobrança." The first fact is that there was none. */
  it('states plainly that the card was not charged', () => {
    renderState({ state: 'failed' });
    expect(screen.getByText('O pagamento não foi concluído')).toBeTruthy();
    expect(
      screen.getByText('Não cobrámos o teu cartão. Tenta novamente ou escolhe outro método.')
    ).toBeTruthy();
  });

  it('offers retrying or changing the method', () => {
    renderState({ state: 'failed' });
    expect(screen.getByRole('button', { name: /Tentar novamente/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Alterar método/ })).toBeTruthy();
  });

  it('shows no operational state and no ETA either', () => {
    renderState({ state: 'failed' });
    expect(screen.queryByText(/Chega em/)).toBeNull();
  });
});
