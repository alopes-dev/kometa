import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { CheckoutAction } from './CheckoutAction';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderAction(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>
  );
}

describe('CheckoutAction', () => {
  it('fires when the contract allows it', () => {
    const onPress = jest.fn();
    renderAction(
      <CheckoutAction
        contract={{ label: 'Pagar 12.400 Kz', tone: 'brand', enabled: true }}
        onPress={onPress}
      />
    );
    fireEvent.press(screen.getByRole('button', { name: 'Pagar 12.400 Kz' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  /** Board 14, `ready → processing`: one tap, and the button locks at once. */
  it('does not fire while the contract is disabled', () => {
    const onPress = jest.fn();
    renderAction(
      <CheckoutAction
        contract={{
          label: 'A processar pagamento…',
          tone: 'brand',
          enabled: false,
          icon: 'spinner',
        }}
        onPress={onPress}
      />
    );
    fireEvent.press(screen.getByRole('button', { name: 'A processar pagamento…' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('announces a processing action as busy and disabled', () => {
    renderAction(
      <CheckoutAction
        contract={{
          label: 'A processar pagamento…',
          tone: 'brand',
          enabled: false,
          icon: 'spinner',
        }}
        onPress={jest.fn()}
      />
    );
    expect(
      screen.getByRole('button', { name: 'A processar pagamento…', busy: true, disabled: true })
    ).toBeTruthy();
  });

  it('renders the blocking banner above the button', () => {
    renderAction(
      <CheckoutAction
        contract={{ label: 'Faltam 1.300 Kz', tone: 'disabled', enabled: false }}
        onPress={jest.fn()}
      />
    );
    expect(screen.getByText('Faltam 1.300 Kz')).toBeTruthy();
  });

  /** Board 05 draws `Ver substitutos` and `Remover` above the CTA. */
  it('offers the secondary pair when an unavailable line needs answering', () => {
    const onRemove = jest.fn();
    renderAction(
      <CheckoutAction
        contract={{ label: 'Remover e continuar', tone: 'destructive', enabled: true }}
        onPress={jest.fn()}
        secondary={[
          { label: 'Ver substitutos', onPress: jest.fn() },
          { label: 'Remover', onPress: onRemove, destructive: true },
        ]}
      />
    );
    fireEvent.press(screen.getByRole('button', { name: 'Remover' }));
    expect(onRemove).toHaveBeenCalled();
  });
});
