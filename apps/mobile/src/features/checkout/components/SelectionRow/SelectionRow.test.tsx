import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { SelectionRow } from './SelectionRow';

const home = { name: 'home-outline', sf: 'house' } as const;

function renderRow(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('SelectionRow', () => {
  it('reads as one label with its subtitle', () => {
    renderRow(
      <SelectionRow icon={home} title="Casa" subtitle="Talatona, Luanda" onPress={jest.fn()} />
    );
    expect(screen.getByLabelText('Casa. Talatona, Luanda')).toBeTruthy();
  });

  it('calls back when chosen', () => {
    const onPress = jest.fn();
    renderRow(<SelectionRow icon={home} title="Trabalho" onPress={onPress} />);
    fireEvent.press(screen.getByText('Trabalho'));
    expect(onPress).toHaveBeenCalled();
  });

  it('announces the selected row as selected', () => {
    renderRow(<SelectionRow icon={home} title="Casa" state="selected" onPress={jest.fn()} />);
    expect(screen.getByRole('button', { selected: true })).toBeTruthy();
  });

  /**
   * Board 12 draws the unavailable methods with a lock and no chevron. A
   * press that silently does nothing is worse than a row that does not offer
   * one, so the row stops being a button at all.
   */
  /**
   * Board 12 draws the unavailable methods with a lock and no chevron. The row
   * stops being a button at all, rather than being a button that silently
   * does nothing — asserted through the role, because `fireEvent.press`
   * resolves handlers on composite elements and would report the prop it was
   * given rather than what the tree actually renders.
   */
  it('exposes no button while unavailable', () => {
    renderRow(
      <SelectionRow
        icon={home}
        title="Multicaixa Express"
        state="unavailable"
        onPress={jest.fn()}
      />
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Multicaixa Express')).toBeTruthy();
  });

  it('exposes no button while loading', () => {
    renderRow(<SelectionRow icon={home} title="A verificar" state="loading" onPress={jest.fn()} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  /** The review's rows state a fact; nothing there should look tappable. */
  it('renders as plain text when there is nothing to open', () => {
    renderRow(<SelectionRow icon={home} title="Casa" subtitle="Talatona" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Casa')).toBeTruthy();
  });
});
