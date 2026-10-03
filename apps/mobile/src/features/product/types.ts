import type { Ionicons } from '@expo/vector-icons';
import type { SFSymbol } from 'expo-symbols';
import type { MenuItem } from '../home/types';

/**
 * The customization model, transcribed from Figma page 64:2470
 * (`PRODUCT & CUSTOMIZATION`), board 02 — the UI kit that draws every state.
 *
 * It lives here rather than in `features/home` because the board treats
 * product as a domain of its own, and the list screens that `features/home`
 * owns never need to know how a product is configured.
 */

export type ModifierOption = {
  id: string;
  label: string;
  /**
   * A delta when the group prices by 'delta' — "+1.000 Kz" — and the whole
   * base price when it prices by 'absolute', the way the pizza's "Grande
   * 7.500 Kz" replaces rather than adds.
   */
  price: number;
  /** Defaults to true. False keeps the row visible and dimmed — never removed. */
  available?: boolean;
  /** "Indisponível hoje" — rendered under the label when unavailable. */
  unavailableNote?: string;
};

/**
 * `required` and `type` are deliberately absent: both are derived from the
 * limits, and the derivation covers every group the board draws.
 *
 *   min 1 / max 1  → radio,    no counter   ("Escolha o pão")
 *   min 0 / max n  → checkbox, counter n/m  ("Extras", "Adicionar")
 *
 * Deriving them is what keeps the wording, the control and the validation
 * from disagreeing — three places that each had their own flag before.
 */
export type ModifierGroup = {
  id: string;
  label: string;
  minSelections: number;
  maxSelections: number;
  /** 'absolute' replaces the base price (pizza size); 'delta' adds to it. */
  pricing: 'delta' | 'absolute';
  /**
   * The noun the validation message borrows — "o pão" gives "Falta escolher
   * o pão." Carried rather than cut out of `label`, because "Escolha o pão"
   * and "Tamanho" do not yield it by the same rule.
   */
  errorNoun: string;
  options: ModifierOption[];
};

export type ProductAttribute = {
  id: string;
  /** Rendered only by the 'table' layout; the chip row shows values alone. */
  label: string;
  value: string;
  icon?: { name: keyof typeof Ionicons.glyphMap; sf?: SFSymbol };
  tone?: 'default' | 'positive';
};

/**
 * `Omit` is scaffolding, not design: `MenuItem` still carries the retired
 * `ModifierGroup` shape, and intersecting the two would collide. The cutover
 * task removes the field from `MenuItem` and this becomes a plain
 * intersection.
 */
export type Product = Omit<MenuItem, 'modifierGroups'> & {
  availability: 'available' | 'unavailable';
  /** "Volte a consultar mais tarde" — the board promises no return time. */
  unavailableNote?: string;
  maxQuantity?: number;
  attributes?: ProductAttribute[];
  /** 'table' is the pharmacy layout; it ships with the categories spec. */
  attributeLayout?: 'inline' | 'table';
  /** "−17% hoje". `previousPrice` is inherited from `MenuItem`. */
  offerLabel?: string;
  modifierGroups?: ModifierGroup[];
};
