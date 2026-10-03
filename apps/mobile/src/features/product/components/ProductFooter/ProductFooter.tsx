import { Pressable } from 'react-native';
import type { CartSelection } from '@/hooks/CartProvider';
import { formatKwanza } from '../../../home/format';
import { content } from '../../content';
import { computeTotal, computeUnitPrice, formatBreakdown } from '../../pricing';
import type { Product } from '../../types';
import { canAdd } from '../../validation';
import { Bar, Breakdown, Cta, CtaLabel, SummaryRow, Total } from './ProductFooter.styles';

/**
 * The CTA states that need no network. Loading, success and failure arrive
 * with the asynchronous add, which is the next spec.
 */
export type CtaState = 'ready' | 'needsChoices' | 'unavailable';

export function resolveCtaState(product: Product, selections: CartSelection[]): CtaState {
  // Availability first: an unavailable product is not merely unconfigured,
  // and telling the customer to choose options would send them to fix
  // something that is not the problem.
  if (product.availability === 'unavailable') return 'unavailable';
  return canAdd(product, selections) ? 'ready' : 'needsChoices';
}

export type ProductFooterProps = {
  product: Product;
  selections: CartSelection[];
  quantity: number;
  bottomInset: number;
  onAdd: () => void;
  /** Press of the greyed CTA: scroll to and reveal the first unanswered group. */
  onNeedsChoices: () => void;
};

/** `Rodapé` — the sum and the one action, pinned above the safe area. */
export function ProductFooter({
  product,
  selections,
  quantity,
  bottomInset,
  onAdd,
  onNeedsChoices,
}: ProductFooterProps) {
  const state = resolveCtaState(product, selections);
  const total = computeTotal(computeUnitPrice(product, selections), quantity);

  const label =
    state === 'unavailable'
      ? content.ctaUnavailable
      : state === 'needsChoices'
        ? content.ctaNeedsChoices
        : content.addToCart(total);

  const announcement = state === 'ready' ? content.addToCartAnnouncement(total) : label;

  // 'needsChoices' is pressable even though it cannot add: pressing it is how
  // the customer is taken to what is missing. 'unavailable' is genuinely
  // inert — there is nothing to take them to.
  const handlePress =
    state === 'ready' ? onAdd : state === 'needsChoices' ? onNeedsChoices : undefined;

  return (
    <Bar bottomInset={bottomInset}>
      <SummaryRow>
        <Breakdown>{formatBreakdown(product, selections, quantity)}</Breakdown>
        <Total>{formatKwanza(total)}</Total>
      </SummaryRow>

      <Pressable
        onPress={handlePress}
        disabled={state === 'unavailable'}
        accessibilityRole="button"
        accessibilityLabel={announcement}
        accessibilityState={{ disabled: state === 'unavailable' }}
      >
        <Cta enabled={state === 'ready'}>
          <CtaLabel enabled={state === 'ready'}>{label}</CtaLabel>
        </Cta>
      </Pressable>
    </Bar>
  );
}
