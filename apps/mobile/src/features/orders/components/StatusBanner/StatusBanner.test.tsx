import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { StatusBanner } from './StatusBanner';

function renderBanner(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('StatusBanner', () => {
  /** Board 03's four banners: Sucesso, Atrasado, Erro, Offline. */
  it('states the title and the consequence', () => {
    renderBanner(
      <StatusBanner
        tone="warning"
        title="A entrega está a demorar um pouco mais"
        body="Novo intervalo: 19:22–19:30. Avisamos se houver nova alteração."
      />
    );
    expect(screen.getByText('A entrega está a demorar um pouco mais')).toBeTruthy();
    expect(
      screen.getByText('Novo intervalo: 19:22–19:30. Avisamos se houver nova alteração.')
    ).toBeTruthy();
  });

  it('renders a title on its own', () => {
    renderBanner(<StatusBanner tone="info" title="Sem conexão" />);
    expect(screen.getByText('Sem conexão')).toBeTruthy();
  });

  /**
   * A screen reader must hear the whole statement, not the headline alone:
   * the body is where the next action lives.
   */
  it('announces the title and the body as one alert', () => {
    renderBanner(<StatusBanner tone="success" title="Pedido confirmado." body="Bom apetite!" />);
    expect(screen.getByLabelText('Pedido confirmado. Bom apetite!')).toBeTruthy();
  });

  it('carries an icon so the tone is not colour alone', () => {
    renderBanner(<StatusBanner tone="error" title="Tenta novamente." />);
    expect(screen.getByTestId('status-banner-icon')).toBeTruthy();
  });
});
