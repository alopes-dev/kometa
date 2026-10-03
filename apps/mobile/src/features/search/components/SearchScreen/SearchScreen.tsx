import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, Text } from '@/components/design-system/atoms';
import { SearchBar } from '@/components/design-system/molecules';
import { SectionHeader } from '@/features/home/components/SectionHeader';
import { spacing } from '@/theme';
import { search } from '../../content';
import { getPopularSearches, getRecentSearches, getSuggestedCategories } from '../../data';
import { SEARCH_DEBOUNCE_MS, suggestTerms } from '../../selectors';
import { SearchEmptyState } from '../SearchEmptyState';
import { SearchTermRow } from '../SearchTermRow';
import { SuggestedCategoryGrid } from '../SuggestedCategoryGrid';
import {
  BACK_ICON_SIZE,
  CONTENT_GAP,
  Field,
  FIELD_HEIGHT,
  GUTTER,
  HintCard,
  Opening,
  Screen,
  Section,
  TopBar,
  WideSection,
} from './SearchScreen.styles';

/** Node 62:1340 — the same glyph the field carries, at the size of a state. */
const OPENING_ICON = { name: 'search', sf: 'magnifyingglass' } as const;

export type SearchScreenProps = {
  /** Runs a query — the return key, a remembered term, a suggested category. */
  onSubmit: (query: string) => void;
  onBack: () => void;
  /** Seeds the field when the results screen sends the customer back to edit. */
  initialQuery?: string;
};

/**
 * Search, focused — frame 48:20081.
 *
 * The screen the board gives searching, reached from the feeds' search field
 * rather than filtering one in place. It holds what you searched before, what
 * everyone is searching now, and four ways in; running a query leaves for the
 * results screen, which is what node 48:20154 means by "Enter abre
 * resultados".
 *
 * Both lists narrow as you type, after the 150 ms the same note promises. The
 * narrowing reuses the sections the board already draws instead of opening a
 * third one: a suggestion is a term you can run, and the board has two
 * headings for exactly that.
 */
export function SearchScreen({ onSubmit, onBack, initialQuery = '' }: SearchScreenProps) {
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [recents, setRecents] = useState<string[]>(() => getRecentSearches());

  const populars = getPopularSearches();
  const categories = getSuggestedCategories();

  useEffect(() => {
    if (query === debouncedQuery) return;
    const timer = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, debouncedQuery]);

  const suggestedRecents = useMemo(
    () => suggestTerms(recents, debouncedQuery),
    [recents, debouncedQuery]
  );
  const suggestedPopulars = useMemo(
    () => suggestTerms(populars, debouncedQuery),
    [populars, debouncedQuery]
  );

  /**
   * "Busca vazia" (node 62:300) — nothing typed and nothing remembered, which
   * is a first run or the moment after "Limpar".
   *
   * The board draws the block alone on the screen; here Populares and
   * Categorias stay below it, because unlike the board this screen has them
   * and they are the answer to the question the block asks. Hiding working
   * ways in to match a drawing that never had them would cost the customer
   * the only taps available.
   */
  const showOpening = query.trim() === '' && recents.length === 0;

  const runQuery = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    // Remembered newest first, and only once: searching "Pizza" twice should
    // not give it two rows.
    setRecents((current) => [trimmed, ...current.filter((entry) => entry !== trimmed)]);
    onSubmit(trimmed);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onBack();
  };

  return (
    <Screen>
      <TopBar style={{ paddingTop: insets.top + spacing[12] }}>
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={search.back}
          hitSlop={12}
        >
          <Icon name="chevron-back" sf="chevron.left" size={BACK_ICON_SIZE} color="primary" />
        </Pressable>
        <Field>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder={search.placeholder}
            shape="default"
            height={FIELD_HEIGHT}
            backgroundColor="primary"
            autoFocus
            onSubmit={runQuery}
            onClear={() => setQuery('')}
            clearAccessibilityLabel={search.clearQuery}
          />
        </Field>
      </TopBar>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingTop: spacing[8],
          paddingBottom: insets.bottom + spacing[24],
          paddingHorizontal: GUTTER,
          gap: CONTENT_GAP,
        }}
      >
        {showOpening ? (
          <Opening>
            <SearchEmptyState
              icon={OPENING_ICON}
              title={search.startTitle}
              body={search.startBody}
            />
          </Opening>
        ) : null}

        {suggestedRecents.length > 0 ? (
          <Section>
            <SectionHeader
              title={search.recents}
              actionLabel={search.clearRecents}
              onPressAction={() => setRecents([])}
            />
            {suggestedRecents.map((term) => (
              <SearchTermRow
                key={term}
                term={term}
                kind="recent"
                onPress={runQuery}
                onRemove={(removed) =>
                  setRecents((current) => current.filter((entry) => entry !== removed))
                }
              />
            ))}
          </Section>
        ) : null}

        {suggestedPopulars.length > 0 ? (
          <Section>
            <SectionHeader title={search.popular} />
            {suggestedPopulars.map((term) => (
              <SearchTermRow key={term} term={term} kind="popular" onPress={runQuery} />
            ))}
          </Section>
        ) : null}

        <WideSection>
          <SectionHeader title={search.suggestedCategories} />
          <SuggestedCategoryGrid
            categories={categories}
            horizontalInset={GUTTER}
            // A category is a query, not a filter: it fills the field and runs,
            // so the customer lands where typing the same word would land them.
            onSelect={(category) => runQuery(category.label)}
          />
        </WideSection>

        <HintCard>
          <Text variant="micro" color="muted">
            {search.keyboardNote}
          </Text>
        </HintCard>
      </ScrollView>
    </Screen>
  );
}
