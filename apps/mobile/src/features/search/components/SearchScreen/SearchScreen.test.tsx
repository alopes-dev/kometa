import { act, render, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { search } from '../../content';
import { SEARCH_DEBOUNCE_MS } from '../../selectors';
import { SearchScreen } from './SearchScreen';

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderSearch(props: Partial<React.ComponentProps<typeof SearchScreen>> = {}) {
  const onSubmit = jest.fn();
  const onBack = jest.fn();
  return {
    onSubmit,
    onBack,
    ...render(
      <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
        <ThemeProvider>
          <SearchScreen onSubmit={onSubmit} onBack={onBack} {...props} />
        </ThemeProvider>
      </SafeAreaProvider>
    ),
  };
}

/** Walks past the debounce the board promises (node 48:20154). */
function settleSuggestions() {
  act(() => {
    jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
  });
}

describe('SearchScreen', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('renders every section the board draws, in order', () => {
    const { getByText } = renderSearch();
    for (const title of [search.recents, search.popular, search.suggestedCategories]) {
      expect(getByText(title)).toBeTruthy();
    }
    expect(getByText(search.keyboardNote)).toBeTruthy();
  });

  it('remembers the terms the board remembers', () => {
    const { getAllByText, getByText } = renderSearch();
    expect(getAllByText('Hambúrguer').length).toBeGreaterThan(0);
    for (const term of ['KFC', 'Supermercado', 'Frango']) {
      expect(getByText(term)).toBeTruthy();
    }
  });

  it('runs a remembered term', () => {
    const { getByText, onSubmit } = renderSearch();
    fireEvent.press(getByText('KFC'));
    expect(onSubmit).toHaveBeenCalledWith('KFC');
  });

  it('runs a suggested category as the query it stands for', () => {
    const { getByTestId, onSubmit } = renderSearch();
    // By tile, not by text: "Farmácia" is also one of the popular terms.
    fireEvent.press(getByTestId('suggested-category-farmacia'));
    expect(onSubmit).toHaveBeenCalledWith('Farmácia');
  });

  it('opens results from the return key, as node 48:20154 says it does', () => {
    const { getByLabelText, onSubmit } = renderSearch();
    const field = getByLabelText(search.placeholder);
    fireEvent.changeText(field, 'sushi');
    fireEvent(field, 'submitEditing');
    expect(onSubmit).toHaveBeenCalledWith('sushi');
  });

  it('ignores a return key with nothing to run', () => {
    const { getByLabelText, onSubmit } = renderSearch();
    fireEvent(getByLabelText(search.placeholder), 'submitEditing');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('narrows both lists to what is being typed, once the 150 ms are up', () => {
    const { getByLabelText, queryByText, getAllByText } = renderSearch();
    fireEvent.changeText(getByLabelText(search.placeholder), 'piz');

    // Still showing everything until the debounce expires.
    expect(queryByText('KFC')).toBeTruthy();
    settleSuggestions();

    expect(queryByText('KFC')).toBeNull();
    expect(queryByText('Supermercado')).toBeNull();
    // Remembered, popular, and the suggested category that never narrows.
    expect(getAllByText('Pizza')).toHaveLength(3);
  });

  it('keeps the categories on screen when no term matches, so the screen is never bare', () => {
    const { getByLabelText, queryByText, getByText } = renderSearch();
    fireEvent.changeText(getByLabelText(search.placeholder), 'zzz');
    settleSuggestions();

    expect(queryByText(search.recents)).toBeNull();
    expect(queryByText(search.popular)).toBeNull();
    expect(getByText(search.suggestedCategories)).toBeTruthy();
  });

  it('forgets one term, and all of them', () => {
    const { getByLabelText, queryByText, getByText } = renderSearch();

    fireEvent.press(getByLabelText(search.removeRecent('KFC')));
    expect(queryByText('KFC')).toBeNull();

    fireEvent.press(getByText(search.clearRecents));
    expect(queryByText(search.recents)).toBeNull();
    expect(queryByText('Supermercado')).toBeNull();
  });

  it('greets a screen with nothing remembered with the board’s opening', () => {
    const { getByText, queryByText } = renderSearch();
    expect(queryByText(search.startTitle)).toBeNull();

    fireEvent.press(getByText(search.clearRecents));

    expect(getByText(search.startTitle)).toBeTruthy();
    expect(getByText(search.startBody)).toBeTruthy();
    // The ways in the board's own empty phone does not draw, kept because
    // this screen has them and they are what the opening is asking for.
    expect(getByText(search.popular)).toBeTruthy();
    expect(getByText(search.suggestedCategories)).toBeTruthy();
  });

  it('drops the opening once there is something typed for it to answer', () => {
    const { getByText, getByLabelText, queryByText } = renderSearch();
    fireEvent.press(getByText(search.clearRecents));
    fireEvent.changeText(getByLabelText(search.placeholder), 'piz');
    settleSuggestions();

    expect(queryByText(search.startTitle)).toBeNull();
  });

  it('remembers what was just searched, newest first and only once', () => {
    const { getByLabelText, getAllByLabelText, onSubmit } = renderSearch();
    const field = getByLabelText(search.placeholder);

    fireEvent.changeText(field, 'Pizza');
    fireEvent(field, 'submitEditing');
    // Emptying the field puts the whole remembered list back on screen.
    fireEvent.changeText(field, '');
    settleSuggestions();

    expect(onSubmit).toHaveBeenCalledWith('Pizza');
    // Each remembered row carries its own remove button, so the labels are
    // the list, in order. "Pizza" was already in it and did not come back twice.
    const remembered = getAllByLabelText(/^Remover /).map(
      (node) => node.props.accessibilityLabel
    );
    expect(remembered).toEqual([
      search.removeRecent('Pizza'),
      search.removeRecent('Hambúrguer'),
      search.removeRecent('KFC'),
      search.removeRecent('Supermercado'),
    ]);
  });

  it('seeds the field when the results screen sends the query back to be edited', () => {
    const { getByLabelText } = renderSearch({ initialQuery: 'hambúrguer' });
    expect(getByLabelText(search.placeholder).props.value).toBe('hambúrguer');
  });

  it('leaves', () => {
    const { getByLabelText, onBack } = renderSearch();
    fireEvent.press(getByLabelText(search.back));
    expect(onBack).toHaveBeenCalled();
  });
});
