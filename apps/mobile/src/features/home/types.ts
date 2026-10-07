/**
 * Either a bundled asset from `require(...)` (a module id) or a remote URL.
 * `expo-image` accepts both directly, so a slot can take whichever it has.
 */
export type ImageRef = string | number;

/**
 * One customer review, as the business board shows it (node 48:20689) — an
 * author, the stars they gave, and what they wrote. No date: the board does
 * not draw one, and an invented timestamp would read as real data.
 */
export type Review = {
  id: string;
  author: string;
  /** Whole stars, 1–5. */
  rating: number;
  comment: string;
};

export type Restaurant = {
  id: string;
  name: string;
  imageUrl: ImageRef;
  rating: number;
  cuisine: string;
  deliveryTimeMinutes: number;
  deliveryFee: number;
  description: string;
  distanceKm: number;
  /** How many reviews the rating averages — "(1.248 avaliações)" (node 48:20620). */
  reviewCount: number;
  /** Smallest basket the merchant accepts — "Mín. 4.500 Kz" (node 48:20630). */
  minOrderValue: number;
  /** What customers wrote, for the "Avaliações" section (node 48:20688). */
  reviews: Review[];
  /** Locality shown beside the cuisine — "Hambúrgueres · Talatona" (node 48:19841). */
  neighbourhood?: string;
  hasPromotion?: boolean;
  /**
   * Copy for the badge over the card media (node 48:19834) — "-20%",
   * "Entrega grátis". `hasPromotion` says a promotion exists; this says what
   * it is, so the badge never has to invent its own wording.
   */
  promotionLabel?: string;
};

export type MenuItem = {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: ImageRef;
  category: string;
  /**
   * What the item cost before the current promotion (node 48:20660). Present
   * only on discounted items; the struck-through price and the "-17%" badge
   * are both derived from it, so there is one number to keep honest.
   */
  previousPrice?: number;
};

export type Offer = {
  id: string;
  imageUrl: string;
  badgeLabel: string;
  title: string;
  subtitle: string;
};

/** An order still in flight, surfaced at the top of Home (node 48:19785). */
/**
 * A merchandised banner (nodes 48:19819, 48:19885).
 *
 * `tone` picks a promo role rather than a colour: `featured` is the brand
 * fill the board draws green, `limited` the amber one it draws for
 * time-boxed combos.
 */
export type PromotionTone = 'featured' | 'limited';

export type Promotion = {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  imageUrl: ImageRef;
  tone: PromotionTone;
};

/** One tile in the "O que te apetece?" row (node 48:19802). */
export type HomeCategory = {
  id: string;
  label: string;
  /**
   * Lowercase terms that place a restaurant under this craving. A craving is
   * broader than a cuisine, so it matches across name, cuisine and
   * description rather than on one field.
   */
  keywords: string[];
};
