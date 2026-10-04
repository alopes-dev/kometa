import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { ProductFooter, resolveCtaState } from './ProductFooter';
import { getProductById } from '../../data';

const burger = getProductById('r4-1')!; // 3.000 Kz, bread required
const milkshake = getProductById('r4-4')!; // 1.800 Kz, no groups
const fries = getProductById('r4-3')!; // unavailable

const configured = [
  { groupId: 'pao', optionIds: ['pao-tradicional'] },
  { groupId: 'extras', optionIds: ['extra-bacon', 'extra-queijo'] },
];

const renderFooter = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const footer = (props: Partial<React.ComponentProps<typeof ProductFooter>> = {}) => (
  <ProductFooter
    product={burger}
    selections={configured}
    quantity={1}
    bottomInset={0}
    onAdd={jest.fn()}
    onNeedsChoices={jest.fn()}
    {...props}
  />
);

describe('resolveCtaState', () => {
  it('is ready for a plain available product', () => {
    expect(resolveCtaState(milkshake, [])).toBe('ready');
  });

  it('needs choices while a required group is unanswered', () => {
    expect(resolveCtaState(burger, [])).toBe('needsChoices');
  });

  it('is ready once the required group is answered', () => {
    expect(resolveCtaState(burger, configured)).toBe('ready');
  });

  it('is unavailable whatever the configuration', () => {
    expect(resolveCtaState(fries, [])).toBe('unavailable');
  });
});

describe('ProductFooter', () => {
  it('shows the breakdown, the total and the add label', () => {
    const { getByText } = renderFooter(footer());
    expect(getByText('1 × 3.000 Kz + extras · 1.200 Kz')).toBeTruthy();
    expect(getByText('4.200 Kz')).toBeTruthy();
    expect(getByText('Adicionar ao carrinho · 4.200 Kz')).toBeTruthy();
  });

  it('multiplies the total by the quantity', () => {
    const { getByText } = renderFooter(footer({ quantity: 2 }));
    expect(getByText('Adicionar ao carrinho · 8.400 Kz')).toBeTruthy();
  });

  it('adds when the CTA is ready', () => {
    const onAdd = jest.fn();
    const { getByText } = renderFooter(footer({ onAdd }));
    fireEvent.press(getByText('Adicionar ao carrinho · 4.200 Kz'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('calls onNeedsChoices, never onAdd, while choices are missing', () => {
    const onAdd = jest.fn();
    const onNeedsChoices = jest.fn();
    const { getByText } = renderFooter(footer({ selections: [], onAdd, onNeedsChoices }));
    fireEvent.press(getByText('Escolher opções'));
    expect(onNeedsChoices).toHaveBeenCalledTimes(1);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('renders an inert CTA for an unavailable product', () => {
    const onAdd = jest.fn();
    const onNeedsChoices = jest.fn();
    const { getByText } = renderFooter(
      footer({ product: fries, selections: [], onAdd, onNeedsChoices })
    );
    fireEvent.press(getByText('Indisponível'));
    expect(onAdd).not.toHaveBeenCalled();
    expect(onNeedsChoices).not.toHaveBeenCalled();
  });

  it('announces the total on the CTA, not just the verb', () => {
    const { getByLabelText } = renderFooter(footer());
    expect(getByLabelText('Adicionar ao carrinho, total 4.200 Kz')).toBeTruthy();
  });

  it('counts units for a product with no groups', () => {
    const { getByText } = renderFooter(
      footer({ product: milkshake, selections: [], quantity: 3 })
    );
    expect(getByText('3 un. × 1.800 Kz')).toBeTruthy();
    expect(getByText('Adicionar ao carrinho · 5.400 Kz')).toBeTruthy();
  });
});

describe('ProductFooter while a submission is in flight or has failed', () => {
  it('says it is working and refuses a second press', () => {
    const onAdd = jest.fn();
    const { getByText } = renderFooter(footer({ submission: { kind: 'adding' }, onAdd }));
    fireEvent.press(getByText('A adicionar…'));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('names the failure beside the total and offers a retry', () => {
    const onAdd = jest.fn();
    const { getByText } = renderFooter(
      footer({ submission: { kind: 'failed', reason: 'failed' }, onAdd })
    );
    expect(getByText('Não foi possível adicionar ao carrinho.')).toBeTruthy();
    expect(getByText('Nada foi duplicado. Tente adicionar novamente.')).toBeTruthy();
    fireEvent.press(getByText('Tentar novamente'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('distinguishes a total that could not be worked out', () => {
    const { getByText } = renderFooter(
      footer({ submission: { kind: 'failed', reason: 'pricing' } })
    );
    expect(getByText('Não foi possível calcular o total.')).toBeTruthy();
    expect(getByText('As escolhas continuam aqui. Tente novamente.')).toBeTruthy();
  });

  it('pauses rather than fails when there is no connection, and says what survived', () => {
    const onAdd = jest.fn();
    const { getByText } = renderFooter(
      footer({
        submission: { kind: 'failed', reason: 'offline' },
        preservedLabels: ['Bacon', 'Extra queijo', 'Sesame'],
        onAdd,
      })
    );
    expect(getByText('Sem conexão')).toBeTruthy();
    expect(getByText('Bacon, Extra queijo e Sesame estão preservados.')).toBeTruthy();
    // The board pauses the action rather than renaming it; the banner is
    // what explains the pause.
    fireEvent.press(getByText('Adicionar ao carrinho · 4.200 Kz'));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('reports a price that moved and asks for a fresh confirmation', () => {
    const onAdd = jest.fn();
    const { getByText } = renderFooter(
      footer({ submission: { kind: 'failed', reason: 'priceChanged', newPrice: 4800, previousPrice: 3000 } })
    );
    expect(getByText('Produto actualizado')).toBeTruthy();
    expect(getByText('Preço base alterado de 3.000 Kz para 4.800 Kz.')).toBeTruthy();
    expect(getByText('Tentar novamente')).toBeTruthy();
  });

  it('shows no banner when nothing has gone wrong', () => {
    const { queryByText } = renderFooter(footer());
    expect(queryByText(/Não foi possível/)).toBeNull();
    expect(queryByText('Sem conexão')).toBeNull();
  });
});
