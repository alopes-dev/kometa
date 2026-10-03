import { getProductById } from '@/features/product/data';
import type { MenuItem } from '@/features/home/types';
import type { CartSelection } from '@/hooks/CartProvider';

/**
 * "Pão Sesame · Bacon + Extra queijo" — what a cart line was configured as.
 *
 * The option labels are looked up rather than carried on the line: a cart
 * item stores the ids it was built from, and the names those ids mean belong
 * to the product catalogue. Resolving them here is what keeps two
 * configurations of one product legible as two different things.
 */
export function describeSelections(item: MenuItem, selections: CartSelection[]): string {
  const groups = getProductById(item.id)?.modifierGroups ?? [];
  const labels = selections.flatMap((selection) => {
    const group = groups.find((candidate) => candidate.id === selection.groupId);
    if (!group) return [];
    return selection.optionIds
      .map((optionId) => group.options.find((option) => option.id === optionId)?.label)
      .filter((label): label is string => Boolean(label));
  });
  return labels.join(', ');
}

export function describeCartLine(item: MenuItem, selections: CartSelection[], notes?: string): string {
  const parts = [describeSelections(item, selections), notes].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(' · ') : item.description;
}
