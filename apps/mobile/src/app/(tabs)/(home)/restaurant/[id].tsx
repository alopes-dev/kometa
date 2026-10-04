import { useCallback, useMemo, useRef, useState } from 'react';
import { Share, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Text } from '@/components/design-system/atoms';
import { boardTextStyle } from '@/theme';
import { useTabBarVisibility } from '@/hooks/useTabBarVisibility';
import { useCart } from '@/hooks/useCart';
import { useMeasureOnTap, type ScreenOrigin } from '@/hooks/useMeasureOnTap';
import { CartSummaryBar } from '@/features/home/components/CartSummaryBar';
import { FlyToCartGhost } from '@/features/home/components/FlyToCartGhost';
import { MenuItemRow } from '@/features/home/components/MenuItemRow';
import { MenuTabs } from '@/features/home/components/MenuTabs';
import { ReviewCard } from '@/features/home/components/ReviewCard';
import { RestaurantProfile } from '@/features/home/components/RestaurantProfile';
import {
  HEADER_COMPACT_HEIGHT,
  HERO_MAX_HEIGHT,
  RestaurantHero,
} from '@/features/home/components/RestaurantHero';
import { getMenuItems, getRestaurantById } from '@/features/home/data';
import { getProductById } from '@/features/product/data';
import { buildMenuSections, POPULAR_SECTION_KEY } from '@/features/home/selectors';
import type { ImageRef, MenuItem } from '@/features/home/types';

const GHOST_SIZE = 40;

type Flight = {
  id: number;
  imageUrl: ImageRef;
  from: { x: number; y: number };
  to: { x: number; y: number };
};

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const TabsWrapper = styled.View`
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

/**
 * `Menu` — node 48:20639. One column at a single rhythm: the board spaces
 * titles, products and reviews with the same gap, so sections are told apart
 * by their headings rather than by varying distance.
 */
const MenuList = styled.View`
  gap: ${({ theme }) => theme.business.metrics.menuGap}px;
  padding-horizontal: ${({ theme }) => theme.business.metrics.menuPadding}px;
  padding-top: ${({ theme }) => theme.business.metrics.menuPaddingTop}px;
  padding-bottom: ${({ theme }) => theme.business.metrics.menuPaddingBottom}px;
`;

/** The board runs one column at a single rhythm — titles, products, reviews. */
const Section = styled.View`
  gap: ${({ theme }) => theme.business.metrics.menuGap}px;
`;

const SectionTitle = styled.Text`
  ${boardTextStyle('sectionTitle')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CartBarWrapper = styled.View<{ bottomInset: number }>`
  position: absolute;
  left: ${({ theme }) => theme.spacing[16]}px;
  right: ${({ theme }) => theme.spacing[16]}px;
  bottom: ${({ theme, bottomInset }) => bottomInset + theme.spacing[8]}px;
`;

const NotFoundScreen = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setIsTabBarHidden } = useTabBarVisibility();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);
  const sectionOffsets = useRef<Record<string, number>>({});
  const menuTop = useRef(0);
  const tabsHeight = useRef(0);
  // Where the category row sits in the scroll content. Shared rather than a
  // ref because the sticky transform reads it on the UI thread.
  const tabsTop = useSharedValue(0);
  const [selectedTab, setSelectedTab] = useState<string>(POPULAR_SECTION_KEY);
  const [isFavorite, setIsFavorite] = useState(false);
  const { count: cartCount, subtotal: cartSubtotal, addItem } = useCart();
  const { ref: cartBarRef, measure: measureCartBar } = useMeasureOnTap();
  const [flights, setFlights] = useState<Flight[]>([]);
  const flightId = useRef(0);

  const compactHeaderHeight = HEADER_COMPACT_HEIGHT + insets.top;

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Counter-translate the category row by however far it has been scrolled
  // past the collapsed header, so it pins under it instead of scrolling away
  // (the board's "Categorias sticky", node 48:20632).
  const stickyTabsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.max(0, scrollY.value - (tabsTop.value - compactHeaderHeight)) }],
  }));

  useFocusEffect(
    useCallback(() => {
      setIsTabBarHidden(true);
      return () => setIsTabBarHidden(false);
    }, [setIsTabBarHidden])
  );

  const restaurant = useMemo(() => getRestaurantById(id), [id]);
  const menuItems = useMemo(() => getMenuItems(id), [id]);
  const sections = useMemo(() => buildMenuSections(menuItems), [menuItems]);
  const tabs = useMemo(() => sections.map(({ key, title }) => ({ key, title })), [sections]);

  const handleSelectTab = (key: string) => {
    setSelectedTab(key);
    const offset = sectionOffsets.current[key];
    if (offset === undefined) return;
    // Section offsets are measured inside the menu column, so the column's own
    // position is added back before landing it under the pinned category row.
    const target = Math.max(0, menuTop.current + offset - compactHeaderHeight - tabsHeight.current);
    scrollTo(scrollRef, 0, target, true);
  };

  const handleShare = () => {
    if (!restaurant) return;
    Share.share({
      message: `${restaurant.name} — ${restaurant.description}`,
    }).catch(() => {});
  };

  /**
   * Which presentation a product gets is the menu's call, not the product
   * screen's: a route's presentation is fixed when it is pushed. Board 06
   * gives the long page to products whose choices need context and the sheet
   * to the short tasks.
   */
  const openProduct = (itemId: string) => {
    const compact = getProductById(itemId)?.presentation === 'sheet';
    router.push({
      pathname: compact ? '/product/sheet/[itemId]' : '/product/[itemId]',
      params: { itemId },
    });
  };

  const removeFlight = (flightId: number) => {
    setFlights((current) => current.filter((flight) => flight.id !== flightId));
  };

  const handleQuickAdd = async (item: MenuItem, origin: ScreenOrigin) => {
    addItem(item);
    const target = await measureCartBar();
    // Either measurement failing (origin/target width 0) means we can't place
    // the ghost meaningfully — the item is still added, just without the flourish.
    if (origin.width === 0 || target.width === 0) return;
    const from = {
      x: origin.x + origin.width / 2 - GHOST_SIZE / 2,
      y: origin.y + origin.height / 2 - GHOST_SIZE / 2,
    };
    const to = {
      x: target.x + target.width / 2 - GHOST_SIZE / 2,
      y: target.y + target.height / 2 - GHOST_SIZE / 2,
    };
    const id = flightId.current++;
    setFlights((current) => [...current, { id, imageUrl: item.imageUrl, from, to }]);
  };

  if (!restaurant) {
    return (
      <NotFoundScreen>
        <Text color="secondary">Restaurante não encontrado</Text>
      </NotFoundScreen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: HERO_MAX_HEIGHT + insets.top, paddingBottom: 96 }}
      >
        <RestaurantProfile restaurant={restaurant} />

        <Animated.View
          style={[{ zIndex: 10 }, stickyTabsStyle]}
          onLayout={(event) => {
            tabsTop.value = event.nativeEvent.layout.y;
            tabsHeight.current = event.nativeEvent.layout.height;
          }}
        >
          <TabsWrapper>
            <MenuTabs tabs={tabs} selectedKey={selectedTab} onSelect={handleSelectTab} />
          </TabsWrapper>
        </Animated.View>

        <MenuList
          onLayout={(event) => {
            menuTop.current = event.nativeEvent.layout.y;
          }}
        >
          {sections.map((section) => {
            return (
              <Section
                key={section.key}
                onLayout={(event) => {
                  sectionOffsets.current[section.key] = event.nativeEvent.layout.y;
                }}
              >
                <SectionTitle>{section.title}</SectionTitle>
                {section.data.map((item) => {
                  // The board puts the same green "+" on every product
                  // (nodes 48:20650, 48:20663, 48:20674, 48:20686). A dish
                  // with required choices cannot be added blind, so its
                  // button opens the sheet where those choices are made
                  // rather than dropping an unconfigured item in the cart.
                  const hasModifiers = Boolean(getProductById(item.id)?.modifierGroups?.length);
                  return (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                      onAdd={
                        hasModifiers
                          ? () => openProduct(item.id)
                          : (origin) => handleQuickAdd(item, origin)
                      }
                      onPress={hasModifiers ? () => openProduct(item.id) : undefined}
                    />
                  );
                })}
              </Section>
            );
          })}

          <Section>
            <SectionTitle>Avaliações</SectionTitle>
            {restaurant.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </Section>
        </MenuList>
      </Animated.ScrollView>

      <RestaurantHero
        restaurant={restaurant}
        topInset={insets.top}
        scrollY={scrollY}
        onBack={() => router.back()}
        onShare={handleShare}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite((current) => !current)}
      />

      <CartBarWrapper bottomInset={insets.bottom}>
        <View ref={cartBarRef}>
          <CartSummaryBar
            count={cartCount}
            total={cartSubtotal}
            onPress={() => router.push('/cart')}
          />
        </View>
      </CartBarWrapper>
      {flights.map((flight) => (
        <FlyToCartGhost
          key={flight.id}
          imageUrl={flight.imageUrl}
          from={flight.from}
          to={flight.to}
          onComplete={() => removeFlight(flight.id)}
        />
      ))}
    </Screen>
  );
}
