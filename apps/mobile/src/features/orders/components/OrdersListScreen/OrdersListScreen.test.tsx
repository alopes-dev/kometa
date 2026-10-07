import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { mockOrders } from '../../mockData';
import { OrdersListScreen } from './OrdersListScreen';

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const active = { ...mockOrders[0], stage: 'transit' as const };
const history = [mockOrders[1], mockOrders[2]];

function renderList(props: Partial<Parameters<typeof OrdersListScreen>[0]> = {}) {
  return render(
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <ThemeProvider>
        <OrdersListScreen
          active={active}
          history={history}
          merchantName={() => 'Burger House'}
          onTrack={jest.fn()}
          onOpen={jest.fn()}
          {...props}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

describe('OrdersListScreen', () => {
  /** Board 05: "Em curso precede anteriores." */
  it('puts the order in flight above the history', () => {
    renderList();
    const sections = screen.getAllByText(/Em curso|Anteriores/);
    expect(sections.map((node) => node.props.children)).toEqual(['Em curso', 'Anteriores']);
  });

  it('shows the active card and the history rows', () => {
    renderList();
    expect(screen.getByRole('button', { name: /Acompanhar pedido/ })).toBeTruthy();
    expect(screen.getByText('#CM-10482')).toBeTruthy();
  });

  /** No heading for a section with nothing under it. */
  it('omits the Em curso section entirely when nothing is in flight', () => {
    renderList({ active: undefined });
    expect(screen.queryByText('Em curso')).toBeNull();
    expect(screen.getByText('Anteriores')).toBeTruthy();
  });

  it('shows an empty state rather than two bare headings', () => {
    renderList({ active: undefined, history: [] });
    expect(screen.queryByText('Em curso')).toBeNull();
    expect(screen.queryByText('Anteriores')).toBeNull();
    expect(screen.getByText('Ainda não tens pedidos')).toBeTruthy();
    expect(screen.getByText('Quando fizeres um pedido, ele aparece aqui.')).toBeTruthy();
  });

  it('titles the screen', () => {
    renderList();
    expect(screen.getByText('Pedidos')).toBeTruthy();
  });
});
