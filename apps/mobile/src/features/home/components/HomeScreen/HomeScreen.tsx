import { useCallback, useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar } from '@/components/design-system/molecules';
import { useCart } from '@/hooks/useCart';
import { spacing } from '@/theme';
import { home } from '../../content';
import {
  getForYouRestaurants,
  getHomeCategories,
  getLastOrder,
  getNearestRestaurant,
  getPopularNearbyRestaurants,
  getPromotions,
} from '../../data';
import { formatKwanza } from '../../format';
import type { Restaurant } from '../../types';
import { ActiveOrderCard } from '@/features/orders/components/ActiveOrderCard';
import { AssistantCard } from '../AssistantCard';
import { CategoryTileList } from '../CategoryTileList';
import { DiscoverHeader } from '../DiscoverHeader';
import { PromoBanner } from '../PromoBanner';
import { RestaurantCard, RESTAURANT_CARD_WIDTH } from '../RestaurantCard';
import { SectionHeader } from '../SectionHeader';
import { CAROUSEL_GAP, GUTTER, Gutter, Screen, Section } from './HomeScreen.styles';

/** Placeholder until the address book lands; the board draws it fixed. */
const DELIVERY_ADDRESS = 'Talatona, Luanda';

/**
 * Home — frame 48:19762, "Home — António com pedido ativo".
 *
 * Every section the board draws renders unconditionally and in the board's
 * order. Search and the craving tiles are entry points here, not filters: the
 * board gives searching and refinement their own screens (frames 48:20081 and
 * 62:560), so narrowing the feed in place would hide sections the design
 * always shows.
 */
export type HomeScreenProps = {
  /** Opens the search screen (frame 48:20081), which is where searching happens. */
  onPressSearch?: () => void;
  /** Opens a restaurant's detail screen (frame 48:20601). */
  onPressRestaurant?: (id: string) => void;
  /** Opens tracking for the order in flight. */
  onPressActiveOrder?: () => void;
  /**
   * The order in flight, resolved by the route. Board 05 keeps this card on
   * Home for as long as there is one; absent, the section is simply not drawn.
   */
  activeOrder?: import('@/features/orders/store').OrderRecord;
  /** The merchant behind `activeOrder`, resolved by the route. */
  activeOrderMerchant?: string;
  /** Opens the cart. */
  onPressCart?: () => void;
  /** Opens the notification centre. */
  onPressNotifications?: () => void;
  /** "Ver todos" on a restaurant section — opens the full, filterable list. */
  onPressAllRestaurants?: () => void;
  /** "Ver todos" on the offers section. */
  onPressOffers?: () => void;
};

export function HomeScreen({
  onPressSearch = () => {},
  onPressRestaurant,
  onPressActiveOrder = () => {},
  activeOrder,
  activeOrderMerchant = '',
  onPressCart,
  onPressNotifications,
  onPressAllRestaurants,
  onPressOffers,
}: HomeScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const { count: cartCount } = useCart();

  const [craving, setCraving] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<ReadonlySet<string>>(() => new Set());

  const categories = getHomeCategories();
  const [featuredPromotion, limitedPromotion] = getPromotions();
  const lastOrder = getLastOrder();
  const nearest = getNearestRestaurant();

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }, []);

  const renderCard = (
    restaurant: Restaurant,
    index: number,
    options?: { width?: number; footnote?: string }
  ) => (
    <RestaurantCard
      key={restaurant.id}
      restaurant={restaurant}
      index={index}
      width={options?.width}
      footnote={options?.footnote}
      isFavorite={favoriteIds.has(restaurant.id)}
      onToggleFavorite={() => toggleFavorite(restaurant.id)}
      // The detail screen opens with a hero that receives the card's image,
      // so the ghost has somewhere to land.
      enableHeroTransition={Boolean(onPressRestaurant)}
      onPress={() => onPressRestaurant?.(restaurant.id)}
    />
  );

  // Snapping by one card step: the gutter padding shifts every card equally,
  // so a stride of card + gap still lands each one on the gutter.
  const renderCarousel = (restaurants: Restaurant[]) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={RESTAURANT_CARD_WIDTH + CAROUSEL_GAP}
      snapToAlignment="start"
      decelerationRate="fast"
      contentContainerStyle={{ gap: CAROUSEL_GAP, paddingHorizontal: GUTTER }}
    >
      {restaurants.map((restaurant, index) =>
        renderCard(restaurant, index, { width: RESTAURANT_CARD_WIDTH })
      )}
    </ScrollView>
  );

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + spacing[8],
          paddingBottom: insets.bottom + spacing[24],
          gap: spacing[24],
        }}
      >
        <Gutter>
          <DiscoverHeader
            address={DELIVERY_ADDRESS}
            cartCount={cartCount}
            onPressCart={onPressCart}
            onPressNotifications={onPressNotifications}
          />
        </Gutter>

        <Gutter>
          {/*
            A doorway, not a filter: searching has its own screen, and the
            feed below it is the one the board always draws in full.
          */}
          <SearchBar
            value=""
            onChangeText={() => {}}
            onPress={onPressSearch}
            placeholder={home.searchPlaceholder}
            shape="default"
            height={52}
          />
        </Gutter>

        {activeOrder ? (
          <Gutter>
            <ActiveOrderCard
              order={activeOrder}
              merchantName={activeOrderMerchant}
              onTrack={onPressActiveOrder}
            />
          </Gutter>
        ) : null}

        <Section>
          <Gutter>
            <SectionHeader title={home.cravings} />
          </Gutter>
          <Gutter>
            <CategoryTileList categories={categories} selected={craving} onSelect={setCraving} />
          </Gutter>
        </Section>

        {featuredPromotion ? (
          <Gutter>
            <PromoBanner promotion={featuredPromotion} />
          </Gutter>
        ) : null}

        <Section>
          <Gutter>
            <SectionHeader
              title={home.forYou}
              actionLabel={home.seeAll}
              onPressAction={onPressAllRestaurants}
            />
          </Gutter>
          {renderCarousel(getForYouRestaurants())}
        </Section>

        <Section>
          <Gutter>
            <SectionHeader
              title={home.popularNearby}
              actionLabel={home.seeAll}
              onPressAction={onPressAllRestaurants}
            />
          </Gutter>
          {renderCarousel(getPopularNearbyRestaurants())}
        </Section>

        {limitedPromotion ? (
          <Section>
            <Gutter>
              <SectionHeader
                title={home.offers}
                actionLabel={home.seeAll}
                onPressAction={onPressOffers}
              />
            </Gutter>
            <Gutter>
              <PromoBanner promotion={limitedPromotion} />
            </Gutter>
          </Section>
        ) : null}

        {nearest ? (
          <Section>
            <Gutter>
              <SectionHeader
                title={home.nearby}
                actionLabel={home.seeAll}
                onPressAction={onPressAllRestaurants}
              />
            </Gutter>
            <Gutter>{renderCard(nearest, 0)}</Gutter>
          </Section>
        ) : null}

        {lastOrder ? (
          <Section>
            <Gutter>
              <SectionHeader
                title={home.orderAgain}
                actionLabel={home.seeAll}
                onPressAction={onPressAllRestaurants}
              />
            </Gutter>
            <Gutter>
              {renderCard(lastOrder.restaurant, 0, {
                footnote: `${home.lastOrder} · ${formatKwanza(lastOrder.total)}`,
              })}
            </Gutter>
          </Section>
        ) : null}

        <Gutter>
          <AssistantCard />
        </Gutter>
      </ScrollView>
    </Screen>
  );
}
