import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { ProductHeader } from './ProductHeader';
import { getProductById } from '../../data';

const burger = getProductById('r4-1')!; // 3.000 Kz
const milkshake = getProductById('r4-4')!; // 1.800 Kz, attribute row
const pizza = getProductById('r3-1')!; // absolute size group
const offer = getProductById('r4-2')!; // 3.800 Kz, was 4.600 Kz
const fries = getProductById('r4-3')!; // unavailable

const large = [{ groupId: 'tamanho', optionIds: ['tamanho-grande'] }];

const renderHeader = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ProductHeader', () => {
  it('renders name, price and description', () => {
    const { getByText } = renderHeader(<ProductHeader product={burger} selections={[]} />);
    expect(getByText('Cheeseburger Clássico')).toBeTruthy();
    expect(getByText('3.000 Kz')).toBeTruthy();
    expect(getByText(burger.description)).toBeTruthy();
  });

  it('renders the inline attribute row as values, without their labels', () => {
    const { getByText, queryByText } = renderHeader(
      <ProductHeader product={milkshake} selections={[]} />
    );
    expect(getByText('Chocolate')).toBeTruthy();
    expect(getByText('400 ml')).toBeTruthy();
    expect(getByText('Disponível')).toBeTruthy();
    expect(queryByText('Sabor')).toBeNull();
  });

  it('renders no attribute row for a product without attributes', () => {
    const { queryByText } = renderHeader(<ProductHeader product={burger} selections={[]} />);
    expect(queryByText('400 ml')).toBeNull();
  });

  it('prefixes the price while a variation is undecided', () => {
    const { getByText } = renderHeader(<ProductHeader product={pizza} selections={[]} />);
    expect(getByText('A partir de 4.000 Kz')).toBeTruthy();
  });

  it('names the variation once it is chosen', () => {
    const { getByText } = renderHeader(<ProductHeader product={pizza} selections={large} />);
    expect(getByText('Grande · 6.000 Kz')).toBeTruthy();
  });

  it('strikes the previous price and states the saving on an offer', () => {
    const { getByText } = renderHeader(<ProductHeader product={offer} selections={[]} />);
    expect(getByText('3.800 Kz')).toBeTruthy();
    expect(getByText('4.600 Kz')).toHaveStyle({ textDecorationLine: 'line-through' });
    expect(getByText('Poupa 800 Kz. O desconto já está incluído no total.')).toBeTruthy();
  });

  it('shows no savings notice on a product that is not discounted', () => {
    const { queryByText } = renderHeader(<ProductHeader product={burger} selections={[]} />);
    expect(queryByText(/Poupa/)).toBeNull();
  });

  it('keeps an unavailable product readable and promises no return time', () => {
    const { getByText } = renderHeader(<ProductHeader product={fries} selections={[]} />);
    expect(getByText('Temporariamente indisponível')).toBeTruthy();
    expect(getByText('Volte a consultar mais tarde')).toBeTruthy();
    expect(getByText(fries.description)).toBeTruthy();
    expect(getByText('1.200 Kz')).toBeTruthy();
    expect(
      getByText(
        'O produto continua visível para preservar contexto, preço e informação. Não prometemos uma hora de regresso.'
      )
    ).toBeTruthy();
  });

  it('announces the product as name, price and whether it is customizable', () => {
    const { getByLabelText } = renderHeader(<ProductHeader product={burger} selections={[]} />);
    expect(getByLabelText('Cheeseburger Clássico, 3.000 Kz, personalizável')).toBeTruthy();
  });

  it('omits "personalizável" from the announcement of a product with no choices', () => {
    const { getByLabelText } = renderHeader(<ProductHeader product={milkshake} selections={[]} />);
    expect(getByLabelText('Milkshake de Chocolate, 1.800 Kz')).toBeTruthy();
  });

  // Review Focus 5 — Dynamic Type and long names.
  it('wraps a long name to two lines without truncating the price', () => {
    const long = { ...burger, name: 'Cheeseburger Clássico Duplo com Bacon Artesanal e Cheddar' };
    const { getByText } = renderHeader(<ProductHeader product={long} selections={[]} />);
    expect(getByText(long.name).props.numberOfLines).toBe(2);
    expect(getByText('3.000 Kz').props.numberOfLines).toBeUndefined();
  });
});
