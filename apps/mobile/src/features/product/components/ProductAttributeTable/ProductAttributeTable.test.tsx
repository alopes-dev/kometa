import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { ProductAttributeTable } from './ProductAttributeTable';
import type { ProductAttribute } from '../../types';

const attributes: ProductAttribute[] = [
  { id: 'marca', label: 'Marca', value: 'Genérico' },
  { id: 'apresentacao', label: 'Apresentação', value: 'Blister · 20 comprimidos' },
  { id: 'disponibilidade', label: 'Disponibilidade', value: 'Em stock', tone: 'positive' },
];

const renderTable = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ProductAttributeTable', () => {
  it('shows every label with its value', () => {
    const { getByText } = renderTable(<ProductAttributeTable attributes={attributes} />);
    expect(getByText('Marca')).toBeTruthy();
    expect(getByText('Genérico')).toBeTruthy();
    expect(getByText('Apresentação')).toBeTruthy();
    expect(getByText('Blister · 20 comprimidos')).toBeTruthy();
  });

  // Unlike the inline chip row, the table names what each value is — a
  // pharmacy fact is useless without its label.
  it('keeps labels visible, which the inline layout omits', () => {
    const { getByText } = renderTable(<ProductAttributeTable attributes={attributes} />);
    expect(getByText('Disponibilidade')).toBeTruthy();
    expect(getByText('Em stock')).toBeTruthy();
  });

  it('pairs each label and value in one spoken row', () => {
    const { getByLabelText } = renderTable(<ProductAttributeTable attributes={attributes} />);
    expect(getByLabelText('Marca: Genérico')).toBeTruthy();
    expect(getByLabelText('Disponibilidade: Em stock')).toBeTruthy();
  });

  it('renders nothing when there are no attributes', () => {
    const { toJSON } = renderTable(<ProductAttributeTable attributes={[]} />);
    expect(toJSON()).toBeNull();
  });
});
