import type { CartSelection } from '@/hooks/CartProvider';
import type { ModifierGroup, ModifierOption, Product } from './types';

/**
 * 'full' means the cap is met and nothing new may be added; it is a
 * presentation state ("3/3", remaining options dimmed) as much as a rule.
 * A group that is merely answered is 'satisfied'.
 */
export type GroupStatus = 'incomplete' | 'satisfied' | 'full';

export function selectedCount(selection: CartSelection | undefined): number {
  return selection?.optionIds.length ?? 0;
}

/** The board's "Escolha 1 · obrigatório" — exactly one, and it is required. */
export function isRadioGroup(group: ModifierGroup): boolean {
  return group.minSelections === 1 && group.maxSelections === 1;
}

export function resolveGroupStatus(
  group: ModifierGroup,
  selection: CartSelection | undefined
): GroupStatus {
  const count = selectedCount(selection);
  if (count < group.minSelections) return 'incomplete';

  // A radio group is never full. Reporting it so would dim the very options
  // the customer needs in order to change their mind, freezing the group on
  // whatever they picked first.
  if (!isRadioGroup(group) && group.maxSelections > 1 && count >= group.maxSelections) {
    return 'full';
  }

  return 'satisfied';
}

export function isOptionSelectable(
  group: ModifierGroup,
  selection: CartSelection | undefined,
  option: ModifierOption
): boolean {
  if (option.available === false) return false;

  // Already chosen, so the press deselects — a cap must never block that, or
  // a full group becomes impossible to edit.
  if (selection?.optionIds.includes(option.id)) return true;

  // Picking a different option replaces the current one rather than adding
  // to it, so the cap does not apply.
  if (isRadioGroup(group)) return true;

  return selectedCount(selection) < group.maxSelections;
}

/**
 * Board order, not severity: the CTA scrolls to the first group the customer
 * has not answered reading down the page, which is where they stopped.
 */
export function findFirstIncompleteGroup(
  product: Product,
  selections: CartSelection[]
): string | null {
  const group = (product.modifierGroups ?? []).find((candidate) => {
    const selection = selections.find((entry) => entry.groupId === candidate.id);
    return resolveGroupStatus(candidate, selection) === 'incomplete';
  });
  return group?.id ?? null;
}

export function canAdd(product: Product, selections: CartSelection[]): boolean {
  if (product.availability === 'unavailable') return false;
  return findFirstIncompleteGroup(product, selections) === null;
}
