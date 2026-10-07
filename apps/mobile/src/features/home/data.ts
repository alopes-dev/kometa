import {
  mockHomeCategories,
  mockLastOrder,
  mockMenuItems,
  mockOffers,
  mockPromotions,
  mockRestaurants,
} from './mockData';
import type { HomeCategory, MenuItem, Offer, Promotion, Restaurant } from './types';

export function getRestaurants(): Restaurant[] {
  return mockRestaurants;
}

export function getRestaurantById(id: string): Restaurant | undefined {
  return mockRestaurants.find((restaurant) => restaurant.id === id);
}

export function getMenuItems(restaurantId: string): MenuItem[] {
  return mockMenuItems.filter((item) => item.restaurantId === restaurantId);
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return mockMenuItems.find((item) => item.id === id);
}

export function searchMenuItems(query: string): MenuItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return mockMenuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(normalized) ||
      item.category.toLowerCase().includes(normalized)
  );
}

export function getCategories(): string[] {
  return Array.from(new Set(mockRestaurants.map((restaurant) => restaurant.cuisine)));
}

export function getOffers(): Offer[] {
  return mockOffers;
}

/** The order in flight, or `null` when the customer has none. */
export function getHomeCategories(): HomeCategory[] {
  return mockHomeCategories;
}

export function getPromotions(): Promotion[] {
  return mockPromotions;
}

/**
 * Which restaurants each Home section shows, exactly as the board casts them
 * (nodes 48:19830, 48:19857, 48:19896, 48:19910).
 *
 * Deliberately an explicit cast rather than a sort over the catalogue: the
 * board curates these rows, and deriving them from rating or distance put
 * restaurants in them that the design never shows.
 */
const SECTION_CASTING = {
  forYou: ['r4', 'r1'],
  popularNearby: ['r3', 'r5'],
  nearby: 'r2',
} as const;

function byIds(ids: readonly string[]): Restaurant[] {
  return ids.flatMap((id) => {
    const restaurant = getRestaurantById(id);
    return restaurant ? [restaurant] : [];
  });
}

/** "Para ti" (node 48:19826). */
export function getForYouRestaurants(): Restaurant[] {
  return byIds(SECTION_CASTING.forYou);
}

/** "Popular perto de ti" (node 48:19853). */
export function getPopularNearbyRestaurants(): Restaurant[] {
  return byIds(SECTION_CASTING.popularNearby);
}

/** "Perto de ti" (node 48:19896) — one full-width card. */
export function getNearestRestaurant(): Restaurant | undefined {
  return getRestaurantById(SECTION_CASTING.nearby);
}

/**
 * "Pedir novamente" (node 48:19910) — the last order's restaurant plus the
 * total to show in place of the usual delivery meta.
 */
export function getLastOrder(): { restaurant: Restaurant; total: number } | null {
  const restaurant = getRestaurantById(mockLastOrder.restaurantId);
  return restaurant ? { restaurant, total: mockLastOrder.total } : null;
}
