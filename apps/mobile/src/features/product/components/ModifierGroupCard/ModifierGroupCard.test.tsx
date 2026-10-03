import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { ModifierGroupCard } from './ModifierGroupCard';
import { getProductById } from '../../data';

const burger = getProductById('r4-1')!;
const bread = burger.modifierGroups!.find((group) => group.id === 'pao')!;
const extras = burger.modifierGroups!.find((group) => group.id === 'extras')!;

const renderCard = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ModifierGroupCard', () => {
  it('renders a single-choice group with its required subtitle and no counter', () => {
    const { getByText, queryByText, getAllByRole } = renderCard(
      <ModifierGroupCard group={bread} selection={undefined} onToggle={jest.fn()} />
    );
    expect(getByText('Escolha o pão')).toBeTruthy();
    expect(getByText('Escolha 1 · obrigatório')).toBeTruthy();
    expect(queryByText('0/1')).toBeNull();
    expect(getAllByRole('radio')).toHaveLength(2);
  });

  it('renders a multi-choice group with its cap subtitle and a live counter', () => {
    const selection = { groupId: 'extras', optionIds: ['extra-bacon', 'extra-queijo'] };
    const { getByText, getAllByRole } = renderCard(
      <ModifierGroupCard group={extras} selection={selection} onToggle={jest.fn()} />
    );
    expect(getByText('Escolha até 3')).toBeTruthy();
    expect(getByText('2/3')).toBeTruthy();
    expect(getAllByRole('checkbox')).toHaveLength(4);
  });

  it('starts the counter at zero when nothing is chosen', () => {
    const { getByText } = renderCard(
      <ModifierGroupCard group={extras} selection={undefined} onToggle={jest.fn()} />
    );
    expect(getByText('0/3')).toBeTruthy();
  });

  it('passes the pressed option id up', () => {
    const onToggle = jest.fn();
    const { getByText } = renderCard(
      <ModifierGroupCard group={bread} selection={undefined} onToggle={onToggle} />
    );
    fireEvent.press(getByText('Brioche'));
    expect(onToggle).toHaveBeenCalledWith('pao-brioche');
  });

  it('shows the validation message when asked — never the outline alone', () => {
    const { getByText } = renderCard(
      <ModifierGroupCard group={bread} selection={undefined} onToggle={jest.fn()} showError />
    );
    expect(getByText('Falta escolher o pão.')).toBeTruthy();
  });

  it('shows no validation message when not asked', () => {
    const { queryByText } = renderCard(
      <ModifierGroupCard group={bread} selection={undefined} onToggle={jest.fn()} />
    );
    expect(queryByText('Falta escolher o pão.')).toBeNull();
  });

  it('announces the group before its options, with its state', () => {
    const { getByLabelText } = renderCard(
      <ModifierGroupCard group={bread} selection={undefined} onToggle={jest.fn()} />
    );
    expect(getByLabelText('Escolha o pão, obrigatório, 0 de 1 seleccionado')).toBeTruthy();
  });
});
