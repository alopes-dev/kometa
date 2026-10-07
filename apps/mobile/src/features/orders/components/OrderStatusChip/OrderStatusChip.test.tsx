import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { ORDER_STAGES, stageCopy } from '../../stages';
import type { OrderStage } from '../../types';
import { OrderStatusChip, chipTone } from './OrderStatusChip';

function renderChip(stage: OrderStage) {
  return render(
    <ThemeProvider>
      <OrderStatusChip stage={stage} />
    </ThemeProvider>
  );
}

describe('OrderStatusChip', () => {
  it('writes board 18 copy for every stage on the line', () => {
    ORDER_STAGES.forEach((stage) => {
      const view = renderChip(stage);
      expect(screen.getByText(stageCopy(stage))).toBeTruthy();
      view.unmount();
    });
  });

  it('writes the cancelled copy too', () => {
    renderChip('cancelled');
    expect(screen.getByText('Pedido cancelado')).toBeTruthy();
  });

  /**
   * Board 10, "Redundância visual": cor, texto, ícone e posição comunicam
   * estado; nunca apenas verde ou vermelho. A chip that carried only a colour
   * would be invisible to a colour-blind reader.
   */
  it('carries an icon beside the label, never colour alone', () => {
    renderChip('transit');
    expect(screen.getByTestId('order-status-chip-icon')).toBeTruthy();
  });

  it('names its state to a screen reader', () => {
    renderChip('transit');
    expect(screen.getByLabelText('Estado: A caminho')).toBeTruthy();
  });
});

describe('chipTone', () => {
  /** Board 03 paints everything in flight green. */
  it('is active for every stage between confirmation and arrival', () => {
    const inFlight: OrderStage[] = [
      'confirmed',
      'preparing',
      'ready',
      'assigned',
      'picked-up',
      'transit',
      'arriving',
      'arrived',
    ];
    inFlight.forEach((stage) => expect(chipTone(stage)).toBe('active'));
  });

  /**
   * Board 14: "O resultado concluído volta a uma paleta neutra." A delivered
   * order is not a success banner — it is history. Board 03 draws its chip
   * grey, like `Pendente`.
   */
  it('is neutral before the order starts and after it ends', () => {
    expect(chipTone('pending')).toBe('neutral');
    expect(chipTone('delivered')).toBe('neutral');
  });

  /** Red is reserved for the final destructive outcome. */
  it('is failed only for a cancelled order', () => {
    expect(chipTone('cancelled')).toBe('failed');
  });
});
