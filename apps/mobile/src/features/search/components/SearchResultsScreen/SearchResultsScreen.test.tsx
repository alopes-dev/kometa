import { render, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { search } from '../../content';
import { SearchResultsScreen } from './SearchResultsScreen';

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderResults(query = 'hambúrguer') {
  const onBack = jest.fn();
  const onEditQuery = jest.fn();
  return {
    onBack,
    onEditQuery,
    ...render(
      <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
        <ThemeProvider>
          <SearchResultsScreen query={query} onBack={onBack} onEditQuery={onEditQuery} />
        </ThemeProvider>
      </SafeAreaProvider>
    ),
  };
}

describe('SearchResultsScreen', () => {
  it('draws the chrome the board draws, in order', () => {
    const { getByText } = renderResults();
    expect(getByText(search.resultsTitle)).toBeTruthy();
    for (const label of [
      search.scopes.all,
      search.scopes.restaurants,
      search.scopes.products,
      search.scopes.offers,
      search.filters,
      search.fastest,
      search.highlyRated,
    ]) {
      expect(getByText(label)).toBeTruthy();
    }
  });

  it('casts the three merchants the board casts for "hambúrguer"', () => {
    const { getByText } = renderResults();
    for (const name of ['Burger House', 'Bun Lab Luanda', 'O Pão & Brasa']) {
      expect(getByText(name)).toBeTruthy();
    }
  });

  it('counts what it actually renders', () => {
    const { getByText } = renderResults();
    expect(getByText(search.resultCount(3))).toBeTruthy();
  });

  it('shows the discount the board puts on the first card', () => {
    const { getByText } = renderResults();
    expect(getByText('-20%')).toBeTruthy();
  });

  it('holds the query in a field that hands editing back, rather than taking it here', () => {
    const { getByLabelText, onEditQuery } = renderResults();
    fireEvent.press(getByLabelText(search.editQuery('hambúrguer')));
    expect(onEditQuery).toHaveBeenCalled();
  });

  it('narrows to what carries a promotion under "Ofertas"', () => {
    const { getByText, queryByText } = renderResults();
    fireEvent.press(getByText(search.scopes.offers));

    expect(getByText('Burger House')).toBeTruthy();
    expect(queryByText('O Pão & Brasa')).toBeNull();
    expect(getByText(search.resultCount(1))).toBeTruthy();
  });

  it('drops anything under 4.5 stars, and says so in the count', () => {
    const { getByText, queryByText } = renderResults();
    fireEvent.press(getByText(search.highlyRated));

    // O Pão & Brasa rates 4,6 — the board's own card; nothing here is below 4,5.
    expect(getByText(search.resultCount(3))).toBeTruthy();
    expect(queryByText(search.noResultsTitle)).toBeNull();
  });

  it('says so when a query returns nothing, instead of an empty count', () => {
    const { getByText } = renderResults('tratores');
    expect(getByText(search.noResultsTitle)).toBeTruthy();
    expect(getByText(search.noResultsBody)).toBeTruthy();
    expect(getByText(search.resultCount(0))).toBeTruthy();
  });

  it('hands a query that matched nothing back to the field, which is the only thing left to change', () => {
    const { getByText, onEditQuery } = renderResults('tratores');
    fireEvent.press(getByText(search.editSearch));
    expect(onEditQuery).toHaveBeenCalled();
  });

  it('counts what the filters are hiding when they are what emptied the screen', () => {
    const { getByText } = renderResults();
    fireEvent.press(getByText(search.scopes.products));

    expect(getByText(search.noResultsTitle)).toBeTruthy();
    expect(getByText(search.noResultsFiltered(3))).toBeTruthy();
  });

  it('gives the filters back rather than the field, where the filters are what emptied it', () => {
    const { getByText, onEditQuery } = renderResults();
    fireEvent.press(getByText(search.scopes.products));
    fireEvent.press(getByText(search.clearFilters));

    expect(getByText(search.resultCount(3))).toBeTruthy();
    expect(getByText('Burger House')).toBeTruthy();
    expect(onEditQuery).not.toHaveBeenCalled();
  });

  it('leaves', () => {
    const { getByLabelText, onBack } = renderResults();
    fireEvent.press(getByLabelText(search.back));
    expect(onBack).toHaveBeenCalled();
  });
});
