import type { ModifierGroup, Product } from './types';

/**
 * What the product screen knows that a menu row does not — availability,
 * selection limits, attributes, offer wording.
 *
 * An enrichment keyed by menu-item id rather than a catalogue of its own:
 * a second catalogue would let a product's name or price drift between the
 * restaurant list and its detail screen, and would leave these fixtures
 * unreachable from any real menu. `data.ts` composes the two.
 */
export type ProductEnrichment = Partial<Omit<Product, 'id' | 'restaurantId'>>;

/** `Extras` — board 02, the multi-select card with its 2/3 counter. */
const BURGER_EXTRAS: ModifierGroup = {
  id: 'extras',
  label: 'Extras',
  minSelections: 0,
  maxSelections: 3,
  pricing: 'delta',
  errorNoun: 'os extras',
  options: [
    { id: 'extra-bacon', label: 'Bacon', price: 700 },
    { id: 'extra-queijo', label: 'Extra queijo', price: 500 },
    { id: 'extra-cogumelos', label: 'Cogumelos', price: 400 },
    // The board keeps a sold-out option on the card, dimmed, rather than
    // removing it — a missing row reads as a product that changed.
    { id: 'extra-abacate', label: 'Abacate', price: 600, available: false, unavailableNote: 'Indisponível hoje' },
  ],
};

/** `Escolha o pão` — board 02, the radio card with no counter. */
const BREAD: ModifierGroup = {
  id: 'pao',
  label: 'Escolha o pão',
  minSelections: 1,
  maxSelections: 1,
  pricing: 'delta',
  errorNoun: 'o pão',
  options: [
    { id: 'pao-tradicional', label: 'Tradicional', price: 0 },
    { id: 'pao-brioche', label: 'Brioche', price: 300 },
  ],
};

/**
 * `Tamanho` — board 06, the pizza. The only group that prices absolutely:
 * "Grande 7.500 Kz" replaces the base rather than adding to it, which is
 * what makes "A partir de" meaningful until it is decided.
 */
const PIZZA_SIZE: ModifierGroup = {
  id: 'tamanho',
  label: 'Tamanho',
  minSelections: 1,
  maxSelections: 1,
  pricing: 'absolute',
  errorNoun: 'o tamanho',
  options: [
    { id: 'tamanho-media', label: 'Média', price: 4000 },
    { id: 'tamanho-grande', label: 'Grande', price: 6000 },
  ],
};

const PIZZA_EXTRAS: ModifierGroup = {
  id: 'extras',
  label: 'Extras',
  minSelections: 0,
  maxSelections: 3,
  pricing: 'delta',
  errorNoun: 'os extras',
  options: [
    { id: 'extra-queijo', label: 'Queijo extra', price: 700 },
    { id: 'extra-bacon', label: 'Bacon', price: 1000 },
    { id: 'extra-cogumelos', label: 'Cogumelos', price: 500 },
  ],
};

export const productEnrichment: Record<string, ProductEnrichment> = {
  /** Board 04 — the customizable product the whole flow is drawn against. */
  'r4-1': {
    modifierGroups: [BREAD, BURGER_EXTRAS],
  },

  /** Board 05 — "Desconto transparente". */
  'r4-2': {
    offerLabel: '−17% hoje',
    modifierGroups: [BREAD, BURGER_EXTRAS],
  },

  /** Board 05 — "Produto ainda compreensível": visible, priced, unbuyable. */
  'r4-3': {
    availability: 'unavailable',
    unavailableNote: 'Volte a consultar mais tarde',
  },

  /** Board 03 — the simple product: one decision, an attribute row, a cap. */
  'r4-4': {
    attributeLayout: 'inline',
    maxQuantity: 6,
    attributes: [
      { id: 'sabor', label: 'Sabor', value: 'Chocolate', icon: { name: 'pricetag-outline', sf: 'tag' } },
      { id: 'volume', label: 'Volume', value: '400 ml', icon: { name: 'cube-outline', sf: 'shippingbox' } },
      {
        id: 'disponibilidade',
        label: 'Disponibilidade',
        value: 'Disponível',
        icon: { name: 'checkmark-circle-outline', sf: 'checkmark.circle' },
        tone: 'positive',
      },
    ],
  },

  /** Board 06 — the long page, and the only absolute-priced variation. */
  'r3-1': {
    modifierGroups: [PIZZA_SIZE, PIZZA_EXTRAS],
  },
};
