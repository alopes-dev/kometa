import { getMenuItemById } from '../home/data';
import { productEnrichment } from './mockData';
import type { Product } from './types';

/**
 * The only module anything outside this feature reads product data from.
 * Swapping the mock catalogue for an API means rewriting this function's
 * internals and nothing else.
 */
export function getProductById(id: string): Product | undefined {
  const item = getMenuItemById(id);
  if (!item) return undefined;

  // The retired groups on `MenuItem` are dropped here rather than merged:
  // they carry the old shape, and the enrichment is the only source of the
  // new one. The cutover task removes the field from `MenuItem` entirely.
  const { modifierGroups: _retired, ...base } = item;

  return {
    ...base,
    // A product with no enrichment is an ordinary, available one — the
    // common case stays silent in the fixture table.
    availability: 'available',
    ...productEnrichment[id],
  };
}
