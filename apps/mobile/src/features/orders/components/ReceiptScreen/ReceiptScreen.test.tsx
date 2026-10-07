import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { mockOrders } from '../../mockData';
import { ReceiptScreen } from './ReceiptScreen';

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderReceipt(order = mockOrders[0]) {
  return render(
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <ThemeProvider>
        <ReceiptScreen order={order} onBack={jest.fn()} onDownload={jest.fn()} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

describe('ReceiptScreen', () => {
  it('identifies the order and that it was paid', () => {
    renderReceipt();
    expect(screen.getByText('Pedido #CM-10482 · pago')).toBeTruthy();
  });

  /**
   * Board 15, "Privacidade": "Mostra apenas bandeira e quatro últimos dígitos
   * do cartão." A receipt is a document people screenshot and forward.
   */
  it('shows the card brand and four digits, and nothing more of the card', () => {
    renderReceipt();
    expect(screen.getByText('Visa •••• 2408')).toBeTruthy();
    // A PAN is 13-19 digits. Nothing on this screen may carry a run that long.
    expect(screen.queryByText(/\d{13,}/)).toBeNull();
  });

  it('states the amount actually charged', () => {
    renderReceipt();
    expect(screen.getByText('Total cobrado')).toBeTruthy();
    expect(screen.getByText('11.100 Kz')).toBeTruthy();
  });

  /**
   * Final review, Important 13. The receipt hardcoded "pago" and
   * "Total cobrado", so a cancelled order's receipt claimed a charge that
   * had been refunded or never made.
   */
  it('does not call a cancelled order paid', () => {
    renderReceipt({ ...mockOrders[4], stage: 'cancelled', paymentStatus: 'cancelled' });
    expect(screen.queryByText(/· pago/)).toBeNull();
    expect(screen.queryByText('Total cobrado')).toBeNull();
    expect(screen.getByText('Pedido #CM-10433 · cancelado')).toBeTruthy();
  });

  it('offers the download the board draws', () => {
    renderReceipt();
    expect(screen.getByRole('button', { name: /Descarregar recibo/ })).toBeTruthy();
  });
});
