import { Pressable } from 'react-native';
import { Icon } from '@/components/design-system/atoms';
import type { CartSelection } from '@/hooks/CartProvider';
import { formatKwanza } from '../../../home/format';
import { content } from '../../content';
import { computeTotal, computeUnitPrice, formatBreakdown } from '../../pricing';
import type { Product } from '../../types';
import { canAdd } from '../../validation';
import {
  Banner,
  BannerBody,
  BannerText,
  BannerTitle,
  Bar,
  Breakdown,
  CartBar,
  CartBarLabel,
  Cta,
  CtaLabel,
  SummaryRow,
  Total,
} from './ProductFooter.styles';

export type CtaState =
  | 'ready'
  | 'needsChoices'
  | 'unavailable'
  | 'added'
  | 'adding'
  | 'failed'
  | 'paused';

/** Where a submission has got to, as far as the footer needs to know. */
export type SubmissionState =
  | { kind: 'idle' }
  | { kind: 'adding' }
  | {
      kind: 'failed';
      reason: 'failed' | 'offline' | 'pricing' | 'priceChanged';
      newPrice?: number;
      previousPrice?: number;
    };

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
  submission?: SubmissionState;
  /** The sheet presentation, which has less width for the action's label. */
  compact?: boolean;
  /** What the offline message names as surviving — the chosen option labels. */
  preservedLabels?: string[];
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
  submission = { kind: 'idle' },
  preservedLabels = [],
  compact = false,
}: ProductFooterProps) {
  const addLabel = compact ? content.addShort : content.addToCart;
  const resolved = resolveCtaState(product, selections);

  /*
   * What the submission is doing outranks what the product allows, but only
   * while it is doing something. A product that is unavailable or
   * unconfigured never reaches a submission in the first place.
   */
  const state: CtaState =
    resolved !== 'ready'
      ? resolved
      : submission.kind === 'adding'
        ? 'adding'
        : submission.kind === 'failed'
          ? submission.reason === 'offline'
            ? 'paused'
            : 'failed'
          : justAdded
            ? 'added'
            : 'ready';
  const total = computeTotal(computeUnitPrice(product, selections), quantity);

  const label =
    state === 'unavailable'
      ? content.ctaUnavailable
      : state === 'needsChoices'
        ? content.ctaNeedsChoices
        : state === 'added'
          ? content.ctaAdded
          : state === 'adding'
            ? content.ctaAdding
            : state === 'failed'
                ? content.ctaRetry
                : addLabel(total);

  const announcement = state === 'ready' ? content.addToCartAnnouncement(total) : label;

  // 'needsChoices' is pressable even though it cannot add: pressing it is how
  // the customer is taken to what is missing. 'unavailable' is genuinely
  // inert — there is nothing to take them to. 'added' is held briefly so a
  // second press cannot double-add during the confirmation.
  const handlePress =
    state === 'ready' || state === 'failed'
      ? onAdd
      : state === 'needsChoices'
        ? onNeedsChoices
        : undefined;

  // The press is refused outright while a submission is in flight, which is
  // the other half of the idempotency guarantee: the key cannot be reused
  // before its own answer arrives.
  const inert = state === 'unavailable' || state === 'adding' || state === 'paused';

  const banner = (() => {
    if (submission.kind !== 'failed') return null;
    switch (submission.reason) {
      case 'offline':
        return {
          tone: 'neutral' as const,
          icon: { name: 'cloud-offline-outline' as const, sf: 'wifi.slash' as const },
          title: content.offlineTitle,
          body: content.offlineBody(preservedLabels),
        };
      case 'pricing':
        return {
          tone: 'error' as const,
          icon: { name: 'alert-circle-outline' as const, sf: 'exclamationmark.circle' as const },
          title: content.errorPricingTitle,
          body: content.errorPricingBody,
        };
      case 'priceChanged':
        return {
          tone: 'positive' as const,
          icon: { name: 'refresh-outline' as const, sf: 'arrow.triangle.2.circlepath' as const },
          title: content.priceChangedTitle,
          body: content.priceChangedBody(submission.previousPrice ?? 0, submission.newPrice ?? 0),
        };
      default:
        return {
          tone: 'error' as const,
          icon: { name: 'alert-circle-outline' as const, sf: 'exclamationmark.circle' as const },
          title: content.errorAddTitle,
          body: content.errorAddBody,
        };
    }
  })();

  return (
    <Bar bottomInset={bottomInset}>
      {banner ? (
        <Banner tone={banner.tone} accessible accessibilityRole="alert">
          <Icon
            name={banner.icon.name}
            sf={banner.icon.sf}
            size={16}
            color={banner.tone === 'error' ? 'error' : banner.tone === 'positive' ? 'success' : 'muted'}
          />
          <BannerText>
            <BannerTitle tone={banner.tone}>{banner.title}</BannerTitle>
            <BannerBody>{banner.body}</BannerBody>
          </BannerText>
        </Banner>
      ) : null}

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
        onPress={inert ? undefined : handlePress}
        disabled={inert}
        accessibilityRole="button"
        accessibilityLabel={announcement}
        accessibilityState={{ disabled: inert, busy: state === 'adding' }}
      >
        <Cta enabled={state === 'ready' || state === 'added' || state === 'failed'}>
          <CtaLabel enabled={state === 'ready' || state === 'added' || state === 'failed'}>
            {label}
          </CtaLabel>
        </Cta>
      </Pressable>
    </Bar>
  );
}
