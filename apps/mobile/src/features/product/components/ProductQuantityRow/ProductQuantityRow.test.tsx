import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { ProductQuantityRow } from './ProductQuantityRow';

const renderRow = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ProductQuantityRow', () => {
  it('shows the label and the current quantity', () => {
    const { getByText } = renderRow(
      <ProductQuantityRow quantity={1} onIncrement={jest.fn()} onDecrement={jest.fn()} />
    );
    expect(getByText('Quantidade')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
  });

  it('raises the quantity when plus is pressed', () => {
    const onIncrement = jest.fn();
    const { getByLabelText } = renderRow(
      <ProductQuantityRow quantity={1} onIncrement={onIncrement} onDecrement={jest.fn()} />
    );
    fireEvent.press(getByLabelText('Aumentar quantidade'));
    expect(onIncrement).toHaveBeenCalledTimes(1);
  });

  // Review Focus 4 — no cap when the field is absent.
  it('increments without limit when maxQuantity is not set', () => {
    const onIncrement = jest.fn();
    const { getByLabelText, queryByText } = renderRow(
      <ProductQuantityRow quantity={99} onIncrement={onIncrement} onDecrement={jest.fn()} />
    );
    expect(queryByText(/Máximo disponível/)).toBeNull();
    fireEvent.press(getByLabelText('Aumentar quantidade'));
    expect(onIncrement).toHaveBeenCalledTimes(1);
  });

  it('announces the cap and blocks increment once it is reached', () => {
    const onIncrement = jest.fn();
    const { getByText, getByLabelText } = renderRow(
      <ProductQuantityRow
        quantity={3}
        maxQuantity={3}
        onIncrement={onIncrement}
        onDecrement={jest.fn()}
      />
    );
    expect(getByText('Máximo disponível: 3')).toBeTruthy();
    fireEvent.press(getByLabelText('Aumentar quantidade'));
    expect(onIncrement).not.toHaveBeenCalled();
  });

  it('still increments below the cap', () => {
    const onIncrement = jest.fn();
    const { getByLabelText } = renderRow(
      <ProductQuantityRow
        quantity={2}
        maxQuantity={3}
        onIncrement={onIncrement}
        onDecrement={jest.fn()}
      />
    );
    fireEvent.press(getByLabelText('Aumentar quantidade'));
    expect(onIncrement).toHaveBeenCalledTimes(1);
  });

  // Review Focus 4 — the cap is already met at mount.
  it('blocks increment when the cap is one and the quantity starts at one', () => {
    const onIncrement = jest.fn();
    const { getByLabelText } = renderRow(
      <ProductQuantityRow
        quantity={1}
        maxQuantity={1}
        onIncrement={onIncrement}
        onDecrement={jest.fn()}
      />
    );
    fireEvent.press(getByLabelText('Aumentar quantidade'));
    expect(onIncrement).not.toHaveBeenCalled();
  });

  it('never decrements below one', () => {
    const onDecrement = jest.fn();
    const { getByLabelText } = renderRow(
      <ProductQuantityRow quantity={1} onIncrement={jest.fn()} onDecrement={onDecrement} />
    );
    fireEvent.press(getByLabelText('Diminuir quantidade'));
    expect(onDecrement).not.toHaveBeenCalled();
  });

  it('decrements above one', () => {
    const onDecrement = jest.fn();
    const { getByLabelText } = renderRow(
      <ProductQuantityRow quantity={2} onIncrement={jest.fn()} onDecrement={onDecrement} />
    );
    fireEvent.press(getByLabelText('Diminuir quantidade'));
    expect(onDecrement).toHaveBeenCalledTimes(1);
  });
});
