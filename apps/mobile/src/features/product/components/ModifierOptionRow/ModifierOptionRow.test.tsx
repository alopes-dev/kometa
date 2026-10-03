import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { ModifierOptionRow } from './ModifierOptionRow';
import { getProductById } from '../../data';

const burger = getProductById('r4-1')!;
const pizza = getProductById('r3-1')!;

const bread = burger.modifierGroups!.find((group) => group.id === 'pao')!;
const extras = burger.modifierGroups!.find((group) => group.id === 'extras')!;
const size = pizza.modifierGroups!.find((group) => group.id === 'tamanho')!;

const bacon = extras.options.find((option) => option.id === 'extra-bacon')!;
const avocado = extras.options.find((option) => option.id === 'extra-abacate')!;
const brioche = bread.options.find((option) => option.id === 'pao-brioche')!;
const plain = bread.options.find((option) => option.id === 'pao-tradicional')!;
const large = size.options.find((option) => option.id === 'tamanho-grande')!;

const fullExtras = {
  groupId: 'extras',
  optionIds: ['extra-bacon', 'extra-queijo', 'extra-cogumelos'],
};

const renderRow = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ModifierOptionRow', () => {
  it('shows the label and its surcharge as separate elements', () => {
    const { getByText } = renderRow(
      <ModifierOptionRow group={extras} option={bacon} selection={undefined} onToggle={jest.fn()} />
    );
    expect(getByText('Bacon')).toBeTruthy();
    expect(getByText('+700 Kz')).toBeTruthy();
  });

  it('shows an absolute variation price without a plus sign', () => {
    const { getByText } = renderRow(
      <ModifierOptionRow group={size} option={large} selection={undefined} onToggle={jest.fn()} />
    );
    expect(getByText('6.000 Kz')).toBeTruthy();
  });

  it('shows no cost at all for a free option', () => {
    const { queryByText } = renderRow(
      <ModifierOptionRow group={bread} option={plain} selection={undefined} onToggle={jest.fn()} />
    );
    expect(queryByText('+0 Kz')).toBeNull();
  });

  it('toggles when the row is pressed, not only the control', () => {
    const onToggle = jest.fn();
    const { getByRole } = renderRow(
      <ModifierOptionRow group={extras} option={bacon} selection={undefined} onToggle={onToggle} />
    );
    fireEvent.press(getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('extra-bacon');
  });

  it('announces itself once, as a checkbox, with its checked state', () => {
    const selection = { groupId: 'extras', optionIds: ['extra-bacon'] };
    const { getAllByRole } = renderRow(
      <ModifierOptionRow group={extras} option={bacon} selection={selection} onToggle={jest.fn()} />
    );
    const rows = getAllByRole('checkbox');
    expect(rows).toHaveLength(1);
    expect(rows[0].props.accessibilityState.checked).toBe(true);
  });

  it('announces itself as a radio inside a single-choice group', () => {
    const { getAllByRole } = renderRow(
      <ModifierOptionRow group={bread} option={brioche} selection={undefined} onToggle={jest.fn()} />
    );
    expect(getAllByRole('radio')).toHaveLength(1);
  });

  it('keeps an unavailable option visible, explains it, and ignores presses', () => {
    const onToggle = jest.fn();
    const { getByText, getByRole } = renderRow(
      <ModifierOptionRow group={extras} option={avocado} selection={undefined} onToggle={onToggle} />
    );
    expect(getByText('Abacate')).toBeTruthy();
    expect(getByText('Indisponível hoje')).toBeTruthy();
    fireEvent.press(getByRole('checkbox'));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('explains a blocked option as a reached limit once the group is full', () => {
    const spare = { ...bacon, id: 'extra-outro', label: 'Cebola caramelizada' };
    const { getByText } = renderRow(
      <ModifierOptionRow group={extras} option={spare} selection={fullExtras} onToggle={jest.fn()} />
    );
    expect(getByText('Limite atingido')).toBeTruthy();
  });

  it('still lets a chosen option be removed from a full group', () => {
    const onToggle = jest.fn();
    const { getByRole } = renderRow(
      <ModifierOptionRow group={extras} option={bacon} selection={fullExtras} onToggle={onToggle} />
    );
    fireEvent.press(getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('extra-bacon');
  });

  it('carries the label, cost and reason into one spoken announcement', () => {
    const { getByLabelText } = renderRow(
      <ModifierOptionRow group={extras} option={avocado} selection={undefined} onToggle={jest.fn()} />
    );
    expect(getByLabelText('Abacate, +600 Kz, Indisponível hoje')).toBeTruthy();
  });

  // Review Focus 5 — a long label must not push its cost off-screen.
  it('truncates a long label to one line and still renders the cost', () => {
    const long = { ...bacon, label: 'Bacon artesanal fumado em lenha de carvalho com ervas' };
    const { getByText } = renderRow(
      <ModifierOptionRow group={extras} option={long} selection={undefined} onToggle={jest.fn()} />
    );
    expect(getByText(long.label).props.numberOfLines).toBe(1);
    expect(getByText('+700 Kz')).toBeTruthy();
  });
});
