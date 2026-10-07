import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { MapCanvas } from './MapCanvas';

function renderCanvas(props: Partial<Parameters<typeof MapCanvas>[0]> = {}) {
  return render(
    <ThemeProvider>
      <MapCanvas stage="transit" {...props} />
    </ThemeProvider>
  );
}

describe('MapCanvas', () => {
  /**
   * Mapbox is not linked in this environment, which is exactly the condition
   * board 08's fallback exists for. A blank rectangle where the map should be
   * is the failure mode this test rules out.
   */
  it('renders the textual fallback rather than an empty area when there is no map', () => {
    renderCanvas();
    expect(screen.getByText('Mapa temporariamente indisponível')).toBeTruthy();
  });

  it('renders the fallback when the map is explicitly unavailable', () => {
    renderCanvas({ state: 'unavailable' });
    expect(screen.getByText('Mapa temporariamente indisponível')).toBeTruthy();
  });

  it('passes a denied location through to the fallback', () => {
    renderCanvas({ locationDenied: true });
    expect(screen.getByText('Localização desativada')).toBeTruthy();
  });
});
