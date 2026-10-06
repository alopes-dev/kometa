import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { FeedbackBanner } from './FeedbackBanner';

function renderBanner(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('FeedbackBanner', () => {
  it('states the title and the consequence', () => {
    renderBanner(
      <FeedbackBanner
        tone="error"
        title="Código inválido"
        body="Confirma a escrita ou tenta outro código."
      />
    );
    expect(screen.getByText('Código inválido')).toBeTruthy();
    expect(screen.getByText('Confirma a escrita ou tenta outro código.')).toBeTruthy();
  });

  it('renders a title on its own', () => {
    renderBanner(<FeedbackBanner tone="warning" title="Checkout bloqueado" />);
    expect(screen.getByText('Checkout bloqueado')).toBeTruthy();
  });

  /**
   * Board 19 · 06. A screen reader must hear the whole statement, not the
   * headline alone, because the body is where the next action lives.
   */
  it('announces the title and the body as one alert', () => {
    renderBanner(
      <FeedbackBanner
        tone="success"
        title="Código aplicado"
        body="Poupaste 1.500 Kz neste pedido."
      />
    );
    expect(screen.getByLabelText('Código aplicado. Poupaste 1.500 Kz neste pedido.')).toBeTruthy();
  });

  it('shows a spinner while it is loading rather than a state glyph', () => {
    renderBanner(<FeedbackBanner tone="loading" title="A verificar o código…" />);
    expect(screen.getByText('A verificar o código…')).toBeTruthy();
  });
});
