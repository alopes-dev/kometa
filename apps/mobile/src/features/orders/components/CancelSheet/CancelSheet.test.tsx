import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { CancelSheet } from './CancelSheet';

function renderSheet(props: Partial<Parameters<typeof CancelSheet>[0]> = {}) {
  return render(
    <ThemeProvider>
      <CancelSheet onConfirm={jest.fn()} onKeep={jest.fn()} {...props} />
    </ThemeProvider>
  );
}

describe('CancelSheet', () => {
  it('asks for the reason and promises to confirm the impact first', () => {
    renderSheet();
    expect(screen.getByText('Cancelar pedido?')).toBeTruthy();
    expect(
      screen.getByText('Diz-nos o motivo. Confirmamos qualquer impacto antes de cancelar.')
    ).toBeTruthy();
  });

  it('offers the four reasons the board lists', () => {
    renderSheet();
    ['Enganei-me no pedido', 'Endereço incorreto', 'Tempo de espera', 'Outro motivo'].forEach(
      (reason) => expect(screen.getByText(reason)).toBeTruthy()
    );
  });

  it('sends the chosen reason', () => {
    const onConfirm = jest.fn();
    renderSheet({ onConfirm });
    fireEvent.press(screen.getByText('Tempo de espera'));
    fireEvent.press(screen.getByRole('button', { name: /Confirmar cancelamento/ }));
    expect(onConfirm).toHaveBeenCalledWith('Tempo de espera');
  });

  /**
   * Final review, Minor 22. The first reason was pre-selected, so a customer
   * who tapped straight through was recorded as having said "Enganei-me no
   * pedido". Board 14 asks for the reason; it does not assume one.
   */
  it('assumes no reason on the customer behalf', () => {
    const onConfirm = jest.fn();
    renderSheet({ onConfirm });
    fireEvent.press(screen.getByRole('button', { name: /Confirmar cancelamento/ }));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('lets the order be kept', () => {
    const onKeep = jest.fn();
    renderSheet({ onKeep });
    fireEvent.press(screen.getByRole('button', { name: /Manter pedido/ }));
    expect(onKeep).toHaveBeenCalledTimes(1);
  });

  /**
   * Board 14, "Impacto antes da ação": "Se houver taxa ou impossibilidade de
   * cancelamento, isso aparece ANTES do botão destrutivo." Below it, the
   * customer learns the cost after deciding to pay it.
   */
  it('puts any fee above the destructive button, never below it', () => {
    renderSheet({ impact: 'Cancelar agora tem uma taxa de 500 Kz.' });
    const impact = screen.getByText('Cancelar agora tem uma taxa de 500 Kz.');
    const destructive = screen.getByRole('button', { name: /Confirmar cancelamento/ });
    const order = screen.UNSAFE_root.findAll((node) => node === impact || node === destructive);
    expect(order[0]).toBe(impact);
  });

  it('draws no impact notice when there is none', () => {
    renderSheet();
    expect(screen.queryByTestId('cancel-impact')).toBeNull();
  });
});
