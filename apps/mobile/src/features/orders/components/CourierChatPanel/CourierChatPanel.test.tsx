import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { CourierChatPanel } from './CourierChatPanel';

function renderPanel(state: 'available' | 'unavailable' | 'closed') {
  return render(
    <ThemeProvider>
      <CourierChatPanel
        state={state}
        courierName="João Manuel"
        messages={[
          { id: 'm1', from: 'courier', text: 'Boa noite, estou a caminho.' },
          { id: 'm2', from: 'customer', text: 'Obrigado! Liga ao chegar.' },
        ]}
      />
    </ThemeProvider>
  );
}

describe('CourierChatPanel', () => {
  it('shows the conversation when the chat is open', () => {
    renderPanel('available');
    expect(screen.getByText('Boa noite, estou a caminho.')).toBeTruthy();
    expect(screen.getByText('Obrigado! Liga ao chegar.')).toBeTruthy();
    expect(screen.getByText('Disponível agora')).toBeTruthy();
  });

  it('explains an unavailable chat and points at the alternative', () => {
    renderPanel('unavailable');
    expect(screen.getByText('Mensagem indisponível')).toBeTruthy();
    expect(screen.getByText('Podes ligar ou tentar novamente em instantes.')).toBeTruthy();
  });

  it('says where a closed conversation went', () => {
    renderPanel('closed');
    expect(screen.getByText('Chat encerrado')).toBeTruthy();
    expect(screen.getByText('A conversa fica visível no histórico do pedido.')).toBeTruthy();
  });

  /**
   * This build has no backend. A composer that accepted text and sent it
   * nowhere would be the only surface in the feature that lies, so the panel
   * renders the three states board 09 draws and no input in any of them.
   */
  it('offers no composer in any state', () => {
    (['available', 'unavailable', 'closed'] as const).forEach((state) => {
      const view = renderPanel(state);
      expect(screen.queryByPlaceholderText(/Mensagem/)).toBeNull();
      expect(screen.queryByRole('button', { name: /Enviar/ })).toBeNull();
      view.unmount();
    });
  });
});
