import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { MapFallback } from './MapFallback';

function renderFallback(props: Partial<Parameters<typeof MapFallback>[0]> = {}) {
  return render(
    <ThemeProvider>
      <MapFallback reason="unavailable" {...props} />
    </ThemeProvider>
  );
}

describe('MapFallback', () => {
  /**
   * Board 08's fallback is complete, not degraded: it says the order is still
   * coming and points at where the state actually lives.
   */
  it('says the order continues and where to read its state', () => {
    renderFallback();
    expect(screen.getByText('Mapa temporariamente indisponível')).toBeTruthy();
    expect(
      screen.getByText('O pedido continua a caminho. Consulta o estado e o ETA abaixo.')
    ).toBeTruthy();
  });

  /**
   * Board 08, "Privacidade por padrão": "Negar localização nunca bloqueia
   * tracking. A posição do cliente não é necessária para acompanhar uma
   * entrega."
   */
  it('explains a denied location without treating it as an error', () => {
    renderFallback({ locationDenied: true });
    expect(screen.getByText('Localização desativada')).toBeTruthy();
    expect(
      screen.getByText('Podes acompanhar o pedido sem partilhar a tua localização.')
    ).toBeTruthy();
  });

  /** Review Focus #5: both failures at once, and tracking still works. */
  it('shows both notices when the map is down and location is denied', () => {
    renderFallback({ locationDenied: true });
    expect(screen.getByText('Mapa temporariamente indisponível')).toBeTruthy();
    expect(screen.getByText('Localização desativada')).toBeTruthy();
  });
});
