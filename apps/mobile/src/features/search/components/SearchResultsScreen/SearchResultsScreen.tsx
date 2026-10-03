import { useCallback, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar } from '@/components/design-system/molecules';
import { RestaurantCard } from '@/features/home/components/RestaurantCard';
import { SectionHeader } from '@/features/home/components/SectionHeader';
import { mockNotifications } from '@/features/notifications/mockData';
import { hasUnreadNotifications } from '@/features/notifications/selectors';
import { spacing } from '@/theme';
import { search } from '../../content';
import { getSearchCatalogue } from '../../data';
import { applyQuickFilters, applyScope, searchRestaurants } from '../../selectors';
import type { SearchQuickFilter, SearchScope } from '../../types';
import { SearchEmptyState } from '../SearchEmptyState';
import { SearchFilterBar } from '../SearchFilterBar';
import { SearchResultsHeader } from '../SearchResultsHeader';
import { SearchScopeTabs } from '../SearchScopeTabs';
import {
  CONTENT_GAP,
  EmptySlot,
  FIELD_HEIGHT,
  GUTTER,
  Gutter,
  Results,
  Screen,
} from './SearchResultsScreen.styles';

/**
 * Node 62:1358 — Lucide's crossed utensils, which neither icon set carries.
 * `fork.knife` is the nearest SF Symbol and `restaurant-outline` its Ionicon
 * counterpart, the same pairing `mockSuggestedCategories` settled on.
 */
const NO_RESULTS_ICON = { name: 'restaurant-outline', sf: 'fork.knife' } as const;

export type SearchResultsScreenProps = {
  /** The query that was run, already trimmed. */
  query: string;
  onBack: () => void;
  /** Returns to the search screen with the query loaded, ready to be changed. */
  onEditQuery: () => void;
};

/**
 * Search results — frame 48:20156, drawn for "hambúrguer".
 *
 * The cards are Home's `RestaurantCard`, not a fourth copy: the board draws
 * the identical component here, down to the 150pt media, the offer pill and
 * the favourite disc, so the feeds cannot drift apart. The hero transition is
 * off because no restaurant detail route exists for the image to fly into.
 */
export function SearchResultsScreen({ query, onBack, onEditQuery }: SearchResultsScreenProps) {
  const insets = useSafeAreaInsets();

  const [scope, setScope] = useState<SearchScope>('all');
  const [filters, setFilters] = useState<ReadonlySet<SearchQuickFilter>>(() => new Set());
  const [favoriteIds, setFavoriteIds] = useState<ReadonlySet<string>>(() => new Set());

  const hasUnread = hasUnreadNotifications(mockNotifications);

  /** What the query alone returns — what the filters are given to narrow. */
  const matches = useMemo(() => searchRestaurants(getSearchCatalogue(), query), [query]);

  const results = useMemo(
    () => applyQuickFilters(applyScope(matches, scope), filters),
    [matches, scope, filters]
  );

  /**
   * Which dead end this is. A query that matched nothing and a filter that
   * hid everything look the same on screen and are not the same problem: one
   * is undone here, the other only by changing the words.
   */
  const hiddenByFilters = results.length === 0 && matches.length > 0;

  const clearFilters = useCallback(() => {
    setFilters(new Set());
    setScope('all');
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }, []);

  const toggleFilter = useCallback((filter: SearchQuickFilter) => {
    setFilters((current) => {
      const next = new Set(current);
      if (!next.delete(filter)) next.add(filter);
      return next;
    });
  }, []);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + spacing[12],
          paddingBottom: insets.bottom + spacing[24],
          gap: CONTENT_GAP,
        }}
      >
        <Gutter>
          <SearchResultsHeader onBack={onBack} hasUnread={hasUnread} onPressNotifications={() => {}} />
        </Gutter>

        <Gutter>
          <SearchBar
            value={query}
            // The field here holds the query rather than taking one; editing
            // happens on the screen built for it, one tap away.
            onChangeText={() => {}}
            onPress={onEditQuery}
            placeholder={search.placeholder}
            accessibilityLabel={search.editQuery(query)}
            shape="default"
            height={FIELD_HEIGHT}
          />
        </Gutter>

        <SearchScopeTabs selected={scope} onSelect={setScope} horizontalInset={GUTTER} />

        <SearchFilterBar
          selected={filters}
          onToggle={toggleFilter}
          // The board draws the chip but not the sheet behind it, so there is
          // nothing to open yet.
          onPressFilters={() => {}}
          horizontalInset={GUTTER}
        />

        <Gutter>
          <Results>
            <SectionHeader title={search.resultCount(results.length)} />
            {results.length > 0 ? (
              results.map((restaurant, index) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  index={index}
                  isFavorite={favoriteIds.has(restaurant.id)}
                  onToggleFavorite={() => toggleFavorite(restaurant.id)}
                  enableHeroTransition={false}
                  onPress={() => {}}
                />
              ))
            ) : (
              <EmptySlot>
                <SearchEmptyState
                  icon={NO_RESULTS_ICON}
                  title={search.noResultsTitle}
                  body={
                    hiddenByFilters ? search.noResultsFiltered(matches.length) : search.noResultsBody
                  }
                  action={
                    hiddenByFilters
                      ? { label: search.clearFilters, onPress: clearFilters }
                      : { label: search.editSearch, onPress: onEditQuery }
                  }
                />
              </EmptySlot>
            )}
          </Results>
        </Gutter>
      </ScrollView>
    </Screen>
  );
}
