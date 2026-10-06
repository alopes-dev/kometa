import { getMenuItems } from '@/features/home/data';
import { getProductById } from '@/features/product/data';
import type { CatalogueEntry } from './availability';

/**
 * What the merchant currently sells, in the shape revalidation checks against.
 *
 * Board 19 · 04 asks that availability and price be re-checked every time the
 * cart is returned to. There is no network in this build, so the "current"
 * catalogue is read from the same fixtures the menu renders — which is enough
 * to make the revalidation path real: a product marked unavailable in the
 * fixtures produces exactly the banner board 15 draws.
 */
export function readCatalogue(merchantId: string): Record<string, CatalogueEntry> {
  return Object.fromEntries(
    getMenuItems(merchantId).map((item) => {
      const product = getProductById(item.id);
      return [item.id, { price: item.price, available: product?.availability !== 'unavailable' }];
    })
  );
}
