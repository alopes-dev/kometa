import { render, screen, fireEvent } from '@testing-library/react-native';
import { useWindowDimensions } from 'react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { mockOrders } from '../../mockData';
import { ActiveOrderCard } from './ActiveOrderCard';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions');

const mockedDimensions = useWindowDimensions as unknown as jest.Mock;

function setFontScale(fontScale: number) {
  mockedDimensions.mockReturnValue({ width: 390, height: 844, scale: 3, fontScale });
}

const order = { ...mockOrders[0], stage: 'transit' as const };

function renderCard(onTrack = jest.fn()) {
  render(
    <ThemeProvider>
      <ActiveOrderCard order={order} merchantName="Burger House" onTrack={onTrack} />
    </ThemeProvider>
  );
  return onTrack;
}

beforeEach(() => setFontScale(1));

describe('ActiveOrderCard', () => {
  it('shows the merchant, the ETA, the zone and the total', () => {
    renderCard();
    expect(screen.getByText('Burger House')).toBeTruthy();
    expect(screen.getByText(/Chega em ~12 min/)).toBeTruthy();
    expect(screen.getByText(/Talatona/)).toBeTruthy();
    expect(screen.getByText('11.100 Kz')).toBeTruthy();
  });

  it('shows the state and the order number', () => {
    renderCard();
    expect(screen.getByLabelText('Estado: A caminho')).toBeTruthy();
    expect(screen.getByText('#CM-10482')).toBeTruthy();
  });

  it('offers one primary action', () => {
    const onTrack = renderCard();
    fireEvent.press(screen.getByRole('button', { name: /Acompanhar pedido/ }));
    expect(onTrack).toHaveBeenCalledTimes(1);
  });

  /**
   * Board 05: "A Home não expõe detalhes de itens; apenas merchant, total,
   * estado e ETA." The order carries its lines; the card must not print them.
   */
  it('never exposes what was ordered', () => {
    renderCard();
    expect(screen.queryByText(/Classic Burger/)).toBeNull();
    expect(screen.queryByText(/Chicken Burger/)).toBeNull();
  });

  /** Board 16's semantic label, read as one sentence. */
  it('reads as one sentence to a screen reader', () => {
    renderCard();
    expect(
      screen.getByLabelText(
        'Pedido CM-10482, Burger House, a caminho, chega em aproximadamente 12 minutos. Botão acompanhar pedido.'
      )
    ).toBeTruthy();
  });

  describe('Dynamic Type', () => {
    /**
     * Board 16: "Conteúdo crítico nunca trunca nem fica preso a altura fixa."
     * A merchant name clipped to one line is the card failing at the size the
     * people who most need it are using.
     */
    it('never clips the merchant name or the ETA to a single line', () => {
      renderCard();
      expect(screen.getByText('Burger House').props.numberOfLines).toBeUndefined();
      expect(screen.getByText(/Chega em/).props.numberOfLines).toBeUndefined();
    });

    /** At AX sizes the ETA is spelled out rather than abbreviated. */
    it('writes the ETA out in full at accessibility sizes', () => {
      setFontScale(1.6);
      renderCard();
      expect(screen.getByText(/Chega em aproximadamente 12 minutos/)).toBeTruthy();
      expect(screen.queryByText(/~12 min/)).toBeNull();
    });
  });
});
