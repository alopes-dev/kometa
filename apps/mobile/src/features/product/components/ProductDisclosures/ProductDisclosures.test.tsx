import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { ProductDisclosures } from './ProductDisclosures';
import type { ProductDisclosure } from '../../types';

const disclosures: ProductDisclosure[] = [
  {
    id: 'ingredientes',
    label: 'Ingredientes',
    summary: '7 itens',
    body: 'Massa, molho de tomate, mozzarella, manjericão, azeite, sal, orégãos.',
  },
  {
    id: 'alergenios',
    label: 'Alergénios',
    summary: 'Glúten · leite',
    body: 'Contém glúten e leite.',
  },
  { id: 'composicao', label: 'Composição', body: 'Paracetamol 500 mg.' },
];

const renderList = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ProductDisclosures', () => {
  it('lists every section by label', () => {
    const { getByText } = renderList(<ProductDisclosures disclosures={disclosures} />);
    expect(getByText('Ingredientes')).toBeTruthy();
    expect(getByText('Alergénios')).toBeTruthy();
    expect(getByText('Composição')).toBeTruthy();
  });

  it('shows the summary beside the label while collapsed', () => {
    const { getByText } = renderList(<ProductDisclosures disclosures={disclosures} />);
    expect(getByText('7 itens')).toBeTruthy();
    expect(getByText('Glúten · leite')).toBeTruthy();
  });

  it('keeps every body hidden until asked', () => {
    const { queryByText } = renderList(<ProductDisclosures disclosures={disclosures} />);
    expect(queryByText(disclosures[0].body)).toBeNull();
    expect(queryByText(disclosures[1].body)).toBeNull();
  });

  it('expands the section when the row is pressed', () => {
    const { getByText } = renderList(<ProductDisclosures disclosures={disclosures} />);
    fireEvent.press(getByText('Ingredientes'));
    expect(getByText(disclosures[0].body)).toBeTruthy();
  });

  it('collapses it again on a second press', () => {
    const { getByText, queryByText } = renderList(<ProductDisclosures disclosures={disclosures} />);
    fireEvent.press(getByText('Ingredientes'));
    fireEvent.press(getByText('Ingredientes'));
    expect(queryByText(disclosures[0].body)).toBeNull();
  });

  // The board's rule: "o estado expandido preserva o ponto de leitura".
  // Opening one section must not close another, or the page jumps under the
  // reader's finger.
  it('lets several sections stay open at once', () => {
    const { getByText } = renderList(<ProductDisclosures disclosures={disclosures} />);
    fireEvent.press(getByText('Ingredientes'));
    fireEvent.press(getByText('Alergénios'));
    expect(getByText(disclosures[0].body)).toBeTruthy();
    expect(getByText(disclosures[1].body)).toBeTruthy();
  });

  it('renders a section with no summary', () => {
    const { getByText } = renderList(<ProductDisclosures disclosures={disclosures} />);
    fireEvent.press(getByText('Composição'));
    expect(getByText('Paracetamol 500 mg.')).toBeTruthy();
  });

  it('announces each row as a collapsed or expanded control', () => {
    const { getByLabelText } = renderList(<ProductDisclosures disclosures={disclosures} />);
    const row = getByLabelText('Ingredientes, 7 itens');
    expect(row.props.accessibilityState.expanded).toBe(false);
    fireEvent.press(row);
    expect(getByLabelText('Ingredientes, 7 itens').props.accessibilityState.expanded).toBe(true);
  });

  it('renders nothing when there are no sections', () => {
    const { toJSON } = renderList(<ProductDisclosures disclosures={[]} />);
    expect(toJSON()).toBeNull();
  });
});
