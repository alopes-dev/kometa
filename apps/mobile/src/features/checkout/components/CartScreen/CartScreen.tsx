import { Fragment, useCallback, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getMenuItems, getRestaurantById } from '@/features/home/data';
import { describeCartLine } from '@/features/checkout/cartDisplay';
import { useCart } from '@/hooks/useCart';
import { useCheckoutFlow } from '@/hooks/useCheckoutFlow';
import { useCheckoutSession } from '@/hooks/useCheckoutSession';
import { useTabBarVisibility } from '@/hooks/useTabBarVisibility';
import type { MenuItem } from '@/features/home/types';
import type { CartItem } from '@/hooks/CartProvider';
import {
  acceptChanges,
  revalidateCart,
  unavailableLineIds,
  type CartChange,
} from '../../availability';
import { readCatalogue } from '../../catalogue';
import { deriveCartStatus, deriveCtaContract } from '../../checkoutState';
import { content } from '../../content';
import { evaluateMinimum } from '../../minimum';
import { mockAddresses } from '../../mockData';
import { computeOrderSummary } from '../../pricing';
import { evaluatePromo, promoDiscount } from '../../promotions';
import { CartItemRow } from '../CartItemRow';
import { CartSkeleton } from '../CartSkeleton';
import { CheckoutAction } from '../CheckoutAction';
import { ConfirmDialog } from '../ConfirmDialog';
import { EmptyCart } from '../EmptyCart';
import { FeedbackBanner } from '../FeedbackBanner';
import { MerchantContext } from '../MerchantContext';
import { MinimumProgress } from '../MinimumProgress';
import { OrderSummaryCard } from '../OrderSummaryCard';
import { ScreenHeader } from '../ScreenHeader';
import { SelectionRow } from '../SelectionRow';
import { SuggestedAddOn } from '../SuggestedAddOn';
import { Body, Divider, List, Screen } from './CartScreen.styles';

/**
 * Boards 04–08, 15 and 16 are one screen with six states.
 *
 * They are assembled here rather than split into six routes because the cart
 * does not navigate between them — a quantity change moves it from `ready` to
 * `updating` to `below-minimum` without leaving the page, and board 16 asks
 * that the structure stay put while the state changes underneath it.
 */
export function CartScreen() {
  const router = useRouter();
  const { setIsTabBarHidden } = useTabBarVisibility();
  const {
    items,
    restaurantId,
    subtotal,
    setQuantity,
    removeItem,
    setUnavailable,
    conflict,
    resolveConflict,
  } = useCart();
  const { promoCode } = useCheckoutFlow();
  const { restored, discard } = useCheckoutSession();

  const [isLoading, setIsLoading] = useState(true);
  const [changes, setChanges] = useState<CartChange[]>([]);
  const [updatingLineId, setUpdatingLineId] = useState<string | null>(null);
  const [showQuantityToast, setShowQuantityToast] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<CartItem | null>(null);

  const merchant = restaurantId ? getRestaurantById(restaurantId) : undefined;

  /**
   * Board 19 · 04: every return to the cart revalidates. The skeleton is shown
   * only for the first pass, because board 16 asks that an already-loaded
   * structure stay on screen while the rest updates.
   */
  useFocusEffect(
    useCallback(() => {
      setIsTabBarHidden(true);
      if (!restaurantId) {
        setIsLoading(false);
        return () => setIsTabBarHidden(false);
      }

      const found = revalidateCart(
        items.map((entry) => ({
          lineId: entry.lineId,
          productId: entry.item.id,
          name: entry.item.name,
          unitPrice: entry.unitPrice,
          quantity: entry.quantity,
        })),
        { catalogue: readCatalogue(restaurantId) }
      );
      setChanges(found);
      setUnavailable(unavailableLineIds(found));
      setIsLoading(false);

      return () => setIsTabBarHidden(false);
      // `items` is intentionally read at focus time only: re-running on every
      // quantity change would re-raise an accepted change mid-edit.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restaurantId, setIsTabBarHidden, setUnavailable])
  );

  const promo = useMemo(
    () => (promoCode ? evaluatePromo(promoCode, subtotal) : { state: 'idle' as const }),
    [promoCode, subtotal]
  );
  const summary = computeOrderSummary({
    subtotal,
    deliveryFee: merchant?.deliveryFee ?? 0,
    discount: promoDiscount(promo),
  });
  const minimum = evaluateMinimum(subtotal, merchant?.minOrderValue);

  const onlyUnavailable =
    changes.length > 0 && changes.every((change) => change.kind === 'unavailable');
  const cartStatus = deriveCartStatus({
    isLoading,
    isEmpty: items.length === 0,
    hasOutstandingChanges: changes.length > 0,
    isUpdating: updatingLineId !== null,
    minimumMet: minimum.met,
  });

  const contract = deriveCtaContract({
    step: 'cart',
    cart: cartStatus,
    delivery: 'missing',
    payment: 'unselected',
    order: 'draft',
    total: summary.total,
    remainingToMinimum: minimum.remaining,
    onlyUnavailable,
  });

  const addOn = minimum.met ? undefined : suggestion(merchant?.id ?? '', items);

  const handleQuantity = (entry: CartItem, quantity: number) => {
    setUpdatingLineId(entry.lineId);
    setQuantity(entry.lineId, quantity);
    setShowQuantityToast(true);
    setUpdatingLineId(null);
  };

  const handleDecrement = (entry: CartItem) => {
    // At one, the control is a trash can, and board 06 confirms before it empties.
    if (entry.quantity <= 1) {
      setPendingRemoval(entry);
      return;
    }
    handleQuantity(entry, entry.quantity - 1);
  };

  const confirmRemoval = () => {
    if (!pendingRemoval) return;
    removeItem(pendingRemoval.lineId);
    setChanges((current) =>
      current.filter((change) => !('lineId' in change) || change.lineId !== pendingRemoval.lineId)
    );
    setPendingRemoval(null);
  };

  const handlePrimary = () => {
    if (cartStatus === 'empty') {
      router.replace('/restaurants');
      return;
    }
    if (cartStatus === 'invalid') {
      // Board 05: dropping what cannot be ordered is the acceptance.
      unavailableLineIds(changes).forEach(removeItem);
      setChanges(acceptChanges(changes));
      return;
    }
    router.push('/checkout/address');
  };

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader title={content.cartTitle} />
        <Body>
          <CartSkeleton />
        </Body>
        <CheckoutAction contract={contract} onPress={() => {}} />
      </Screen>
    );
  }

  if (items.length === 0 || !merchant) {
    // Board 15, third screen. A saved session is offered before the empty
    // state, because an empty cart that silently forgets a saved order is the
    // one failure flow H exists to prevent.
    const savedMerchant = restored ? getRestaurantById(restored.merchantId) : undefined;
    if (restored && savedMerchant) {
      return (
        <Screen>
          <ScreenHeader title={content.resumeTitle} caption={content.resumeCaption} />
          <Body>
            <MerchantContext merchant={savedMerchant} />
            <FeedbackBanner
              tone="info"
              icon={{ name: 'time-outline', sf: 'clock.arrow.circlepath' }}
              title={content.sessionTitle}
              body={content.sessionBody(
                restored.lines.length,
                mockAddresses.find((address) => address.id === restored.addressId)?.label ?? '',
                restored.promoCode
              )}
            />
          </Body>
          <CheckoutAction
            contract={{ label: content.resumeOrder, tone: 'brand', enabled: true }}
            onPress={() => router.push(`/restaurant/${restored.merchantId}`)}
            secondary={[{ label: content.startOver, onPress: discard }]}
          />
        </Screen>
      );
    }

    return (
      <Screen>
        <ScreenHeader title={content.cartTitle} />
        <EmptyCart onExplore={() => router.replace('/restaurants')} />
      </Screen>
    );
  }

  const needsAttention = changes.length > 0;

  return (
    <Screen>
      <ScreenHeader
        title={needsAttention ? content.cartReviewTitle : content.cartTitle}
        caption={
          needsAttention
            ? content.cartAttentionCaption
            : content.cartCaption(items.length, merchant.name)
        }
      />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Body>
          <MerchantContext merchant={merchant} />

          {changes.map((change) => (
            <ChangeBanner key={changeKey(change)} change={change} merchantName={merchant.name} />
          ))}

          {showQuantityToast && !needsAttention ? (
            <FeedbackBanner
              tone="success"
              title={content.quantityUpdatedTitle}
              body={content.quantityUpdatedBody}
            />
          ) : null}

          <List>
            {items.map((entry, index) => (
              <Fragment key={entry.lineId}>
                {index > 0 ? <Divider /> : null}
                <CartItemRow
                  entry={entry}
                  description={describeCartLine(entry.item, entry.selections, entry.notes)}
                  state={
                    entry.availability === 'unavailable'
                      ? 'unavailable'
                      : updatingLineId === entry.lineId
                        ? 'updating'
                        : 'default'
                  }
                  onEdit={() =>
                    router.push(
                      `/product/${entry.item.id}?lineId=${encodeURIComponent(entry.lineId)}`
                    )
                  }
                  onIncrement={() => handleQuantity(entry, entry.quantity + 1)}
                  onDecrement={() => handleDecrement(entry)}
                />
              </Fragment>
            ))}
          </List>

          <SelectionRow
            icon={{ name: 'pricetag-outline', sf: 'tag' }}
            title={promo.state === 'applied' ? promo.promo.code : content.promoRowTitle}
            subtitle={
              promo.state === 'applied'
                ? content.promoAppliedBody(promo.discount)
                : content.promoRowSubtitle
            }
            state={promo.state === 'applied' ? 'selected' : 'default'}
            onPress={() => router.push('/cart/promo')}
          />

          {!minimum.met ? (
            <MinimumProgress
              evaluation={minimum}
              subtotal={subtotal}
              merchantName={merchant.name}
            />
          ) : null}

          {addOn ? (
            <SuggestedAddOn item={addOn} onAdd={() => router.push(`/restaurant/${merchant.id}`)} />
          ) : null}

          <OrderSummaryCard summary={summary} />
        </Body>
      </ScrollView>

      <CheckoutAction
        contract={contract}
        onPress={handlePrimary}
        secondary={
          onlyUnavailable
            ? [
                {
                  label: content.seeSubstitutes,
                  onPress: () => router.push(`/restaurant/${merchant.id}`),
                },
                {
                  label: content.remove,
                  destructive: true,
                  onPress: () => unavailableLineIds(changes).forEach(removeItem),
                },
              ]
            : undefined
        }
      >
        {!minimum.met ? (
          <FeedbackBanner
            tone="warning"
            title={content.checkoutBlockedTitle}
            body={content.minimumBlockedBody(minimum.remaining)}
          />
        ) : null}
      </CheckoutAction>

      <ConfirmDialog
        visible={pendingRemoval !== null}
        destructive
        title={pendingRemoval ? content.removeItemTitle(pendingRemoval.item.name) : ''}
        body={content.removeItemBody}
        confirmLabel={content.removeItemAction}
        dismissLabel={content.keepInCart}
        onConfirm={confirmRemoval}
        onDismiss={() => setPendingRemoval(null)}
      />

      <ConfirmDialog
        visible={conflict !== null}
        destructive
        icon={{ name: 'swap-horizontal-outline', sf: 'arrow.left.arrow.right' }}
        title={content.replaceCartTitle}
        body={
          conflict
            ? content.replaceCartBody(
                getRestaurantById(conflict.item.restaurantId)?.name ?? conflict.item.restaurantId,
                getRestaurantById(conflict.currentMerchantId)?.name ?? conflict.currentMerchantId
              )
            : ''
        }
        confirmLabel={content.replaceCartAction}
        dismissLabel={content.keepMerchant(merchant.name)}
        onConfirm={() => resolveConflict('replace')}
        onDismiss={() => resolveConflict('keep')}
      />
    </Screen>
  );
}

/** Board 15 gives each change its own banner, in the tone its severity earns. */
function ChangeBanner({ change, merchantName }: { change: CartChange; merchantName: string }) {
  if (change.kind === 'unavailable') {
    return (
      <FeedbackBanner
        tone="error"
        title={content.itemUnavailableTitle}
        body={content.itemUnavailableBody(change.name)}
      />
    );
  }
  if (change.kind === 'price-changed') {
    return (
      <FeedbackBanner
        tone="warning"
        title={content.errorPriceChangedTitle}
        body={content.priceChangedBody(change.name, change.from, change.to)}
      />
    );
  }
  if (change.kind === 'merchant-closed') {
    return (
      <FeedbackBanner
        tone="error"
        icon={{ name: 'storefront-outline', sf: 'storefront' }}
        title={content.errorClosedTitle}
        body={content.closedBody(merchantName, change.reopensAt ?? 'em breve')}
      />
    );
  }
  return (
    <FeedbackBanner
      tone="error"
      icon={{ name: 'location-outline', sf: 'location.slash' }}
      title={content.errorOutOfAreaTitle}
      body={content.outOfAreaBody(change.zone, merchantName)}
    />
  );
}

function changeKey(change: CartChange): string {
  return 'lineId' in change ? `${change.kind}:${change.lineId}` : change.kind;
}

/**
 * The one add-on board 08 offers beside the minimum block: the cheapest thing
 * on the menu that is not already in the cart. Chosen rather than recommended
 * — board 07 rules out invented recommendations, and the cheapest item is the
 * one that closes the gap with the least spend.
 */
function suggestion(merchantId: string, items: CartItem[]): MenuItem | undefined {
  const inCart = new Set(items.map((entry) => entry.item.id));
  return getMenuItems(merchantId)
    .filter((item) => !inCart.has(item.id))
    .sort((a, b) => a.price - b.price)[0];
}
