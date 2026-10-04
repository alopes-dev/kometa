import { Pressable } from 'react-native';
import { Icon } from '@/components/design-system/atoms';
import type { CartSelection } from '@/hooks/CartProvider';
import { formatKwanza } from '../../../home/format';
import { content } from '../../content';
import { computeTotal, computeUnitPrice, formatBreakdown } from '../../pricing';
import type { Product } from '../../types';
import { canAdd } from '../../validation';
import {
  Bar,
  Breakdown,
  CartBar,
  CartBarLabel,
  Cta,
  CtaLabel,
  SummaryRow,
  Total,
} from './ProductFooter.styles';

/**
 * The CTA states that need no network. 'adding' and 'failed' arrive with the
 * asynchronous add, which is the next spec; 'added' does not wait for it,
 * because confirming a local state change is itself local.
 */
export type CtaState = 'ready' | 'needsChoices' | 'unavailable' | 'added';

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
  /** Holds the CTA at "Adicionado ✓" for a moment after a successful add. */
  justAdded?: boolean;
  cartCount?: number;
  cartTotal?: number;
  onOpenCart?: () => void;
};

/** `Rodapé` — the sum and the one action, pinned above the safe area. */
export function ProductFooter({
  product,
  selections,
  quantity,
  bottomInset,
  onAdd,
  onNeedsChoices,
  justAdded = false,
  cartCount = 0,
  cartTotal = 0,
  onOpenCart,
}: ProductFooterProps) {
  const resolved = resolveCtaState(product, selections);
  // The confirmation outranks 'ready' while it lasts, but never 'unavailable'
  // or 'needsChoices' — those describe the product, not the last press.
  const state: CtaState = justAdded && resolved === 'ready' ? 'added' : resolved;
  const total = computeTotal(computeUnitPrice(product, selections), quantity);

  const label =
    state === 'unavailable'
      ? content.ctaUnavailable
      : state === 'needsChoices'
        ? content.ctaNeedsChoices
        : state === 'added'
          ? content.ctaAdded
          : content.addToCart(total);

  const announcement = state === 'ready' ? content.addToCartAnnouncement(total) : label;

  // 'needsChoices' is pressable even though it cannot add: pressing it is how
  // the customer is taken to what is missing. 'unavailable' is genuinely
  // inert — there is nothing to take them to. 'added' is held briefly so a
  // second press cannot double-add during the confirmation.
  const handlePress =
    state === 'ready' ? onAdd : state === 'needsChoices' ? onNeedsChoices : undefined;

  return (
    <Bar bottomInset={bottomInset}>
      {cartCount > 0 && onOpenCart ? (
        <Pressable
          onPress={onOpenCart}
          accessibilityRole="button"
          accessibilityLabel={content.cartBarAnnouncement(cartCount, cartTotal)}
        >
          <CartBar>
            <Icon name="bag-outline" sf="bag" size={16} color="brand" />
            <CartBarLabel>{content.cartBar(cartCount, cartTotal)}</CartBarLabel>
            <Icon name="chevron-forward" sf="chevron.right" size={14} color="brand" />
          </CartBar>
        </Pressable>
      ) : null}

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
        <Cta enabled={state === 'ready' || state === 'added'}>
          <CtaLabel enabled={state === 'ready' || state === 'added'}>{label}</CtaLabel>
        </Cta>
      </Pressable>
    </Bar>
  );
}
