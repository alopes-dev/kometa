import { render, fireEvent } from '@testing-library/react-native';
import { makeMutable } from 'react-native-reanimated';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { ProductHero } from './ProductHero';
import { getProductById } from '../../data';

const burger = getProductById('r4-1')!;
const fries = getProductById('r4-3')!; // unavailable

const renderHero = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);
const scrollY = () => makeMutable(0);

describe('ProductHero', () => {
  it('offers back and share in detail mode', () => {
    const onBack = jest.fn();
    const { getByLabelText, queryByLabelText } = renderHero(
      <ProductHero
        product={burger}
        topInset={0}
        scrollY={scrollY()}
        mode="detail"
        onBack={onBack}
        onShare={jest.fn()}
      />
    );
    fireEvent.press(getByLabelText('Voltar'));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(getByLabelText('Partilhar')).toBeTruthy();
    expect(queryByLabelText('Fechar')).toBeNull();
  });

  it('offers back and close in customize mode', () => {
    const onClose = jest.fn();
    const { getByLabelText, queryByLabelText } = renderHero(
      <ProductHero
        product={burger}
        topInset={0}
        scrollY={scrollY()}
        mode="customize"
        onBack={jest.fn()}
        onClose={onClose}
      />
    );
    fireEvent.press(getByLabelText('Fechar'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(queryByLabelText('Partilhar')).toBeNull();
  });

  it('carries the product name as the compact title, not a generic one', () => {
    const { getByText, queryByText } = renderHero(
      <ProductHero
        product={burger}
        topInset={0}
        scrollY={scrollY()}
        mode="detail"
        onBack={jest.fn()}
      />
    );
    expect(getByText('Cheeseburger Clássico')).toBeTruthy();
    expect(queryByText('Detalhes')).toBeNull();
  });

  it('renders the favourite control when a handler is given', () => {
    const onToggleFavorite = jest.fn();
    const { getByLabelText } = renderHero(
      <ProductHero
        product={burger}
        topInset={0}
        scrollY={scrollY()}
        mode="detail"
        onBack={jest.fn()}
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
      />
    );
    fireEvent.press(getByLabelText('Adicionar aos favoritos'));
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it('omits the favourite control when no handler is given', () => {
    const { queryByLabelText } = renderHero(
      <ProductHero
        product={burger}
        topInset={0}
        scrollY={scrollY()}
        mode="detail"
        onBack={jest.fn()}
      />
    );
    expect(queryByLabelText('Adicionar aos favoritos')).toBeNull();
  });

  it('overlays the unavailable label on the photograph', () => {
    const { getByText } = renderHero(
      <ProductHero
        product={fries}
        topInset={0}
        scrollY={scrollY()}
        mode="detail"
        onBack={jest.fn()}
      />
    );
    expect(getByText('Temporariamente indisponível')).toBeTruthy();
  });

  it('shows no unavailable label on an available product', () => {
    const { queryByText } = renderHero(
      <ProductHero
        product={burger}
        topInset={0}
        scrollY={scrollY()}
        mode="detail"
        onBack={jest.fn()}
      />
    );
    expect(queryByText('Temporariamente indisponível')).toBeNull();
  });
});
