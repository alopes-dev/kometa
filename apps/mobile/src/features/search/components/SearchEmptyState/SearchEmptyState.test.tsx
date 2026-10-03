import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { SearchEmptyState } from './SearchEmptyState';

const ICON = { name: 'search', sf: 'magnifyingglass' } as const;

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('SearchEmptyState', () => {
  it('says what happened and what to do about it', () => {
    const { getByText } = renderWithTheme(
      <SearchEmptyState icon={ICON} title="Sem resultados" body="Tenta outro termo." />
    );
    expect(getByText('Sem resultados')).toBeTruthy();
    expect(getByText('Tenta outro termo.')).toBeTruthy();
  });

  it('runs the way out it offers', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <SearchEmptyState
        icon={ICON}
        title="Sem resultados"
        body="Tenta outro termo."
        action={{ label: 'Limpar filtros', onPress }}
      />
    );
    fireEvent.press(getByText('Limpar filtros'));
    expect(onPress).toHaveBeenCalled();
  });

  it('draws no button where there is nothing to undo', () => {
    const { queryByRole } = renderWithTheme(
      <SearchEmptyState
        icon={ICON}
        title="O que vais encontrar hoje?"
        body="Pesquisa por pratos."
      />
    );
    expect(queryByRole('button')).toBeNull();
  });
});
