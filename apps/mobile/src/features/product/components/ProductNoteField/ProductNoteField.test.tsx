import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { ProductNoteField } from './ProductNoteField';

const renderField = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ProductNoteField', () => {
  it('renders the label, the helper and an empty counter', () => {
    const { getByText } = renderField(<ProductNoteField value="" onChangeText={jest.fn()} />);
    expect(getByText('Observação')).toBeTruthy();
    expect(getByText('Opcional · não substitui escolhas acima')).toBeTruthy();
    expect(getByText('0/180')).toBeTruthy();
  });

  it('counts the characters already typed', () => {
    const { getByText } = renderField(
      <ProductNoteField value="Sem cebola" onChangeText={jest.fn()} />
    );
    expect(getByText('10/180')).toBeTruthy();
  });

  it('passes typed text up', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = renderField(
      <ProductNoteField value="" onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByPlaceholderText('Ex.: Sem cebola'), 'Sem tomate');
    expect(onChangeText).toHaveBeenCalledWith('Sem tomate');
  });

  it('stops accepting input at the limit', () => {
    const { getByPlaceholderText } = renderField(
      <ProductNoteField value={'a'.repeat(180)} onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText('Ex.: Sem cebola').props.maxLength).toBe(180);
  });

  it('shows the counter at the limit', () => {
    const { getByText } = renderField(
      <ProductNoteField value={'a'.repeat(180)} onChangeText={jest.fn()} />
    );
    expect(getByText('180/180')).toBeTruthy();
  });
});
