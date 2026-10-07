import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { OrderNumber } from './OrderNumber';

function renderNumber() {
  return render(
    <ThemeProvider>
      <OrderNumber orderId="CM-10482" />
    </ThemeProvider>
  );
}

beforeEach(() => jest.clearAllMocks());

describe('OrderNumber', () => {
  /** Board 03 writes it with the hash; the stored id has none. */
  it('writes the order id with a hash', () => {
    renderNumber();
    expect(screen.getByText('#CM-10482')).toBeTruthy();
  });

  it('copies the id to the clipboard without the hash', async () => {
    renderNumber();
    fireEvent.press(screen.getByRole('button', { name: 'Copiar número do pedido' }));
    await waitFor(() => expect(Clipboard.setStringAsync).toHaveBeenCalledWith('CM-10482'));
  });

  it('confirms the copy rather than leaving the tap unacknowledged', async () => {
    renderNumber();
    fireEvent.press(screen.getByRole('button', { name: 'Copiar número do pedido' }));
    await waitFor(() => expect(screen.getByText('Copiado')).toBeTruthy());
  });
});
