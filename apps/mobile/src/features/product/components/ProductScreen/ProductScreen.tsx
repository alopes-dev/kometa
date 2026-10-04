import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Share } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Animated, {
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/design-system/atoms';
import type { CartSelection } from '@/hooks/CartProvider';
import { useCart } from '@/hooks/useCart';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTabBarVisibility } from '@/hooks/useTabBarVisibility';
import { submitToCart, type CartSubmitter } from '../../cartSubmission';
import { content } from '../../content';
import { getProductById } from '../../data';
import { computeTotal, computeUnitPrice } from '../../pricing';
import { findFirstIncompleteGroup, isRadioGroup, isOptionSelectable } from '../../validation';
import { ModifierGroupCard } from '../ModifierGroupCard';
import { ProductDisclosures } from '../ProductDisclosures';
import { ProductFooter, type SubmissionState } from '../ProductFooter';
import { ProductHeader } from '../ProductHeader';
import { ProductHero, COLLAPSE_RANGE, HERO_MAX_HEIGHT } from '../ProductHero';
import { ProductNoteField } from '../ProductNoteField';
import { ProductQuantityRow } from '../ProductQuantityRow';
import { Detail, Groups, NotFoundScreen, Screen } from './ProductScreen.styles';

/**
 * How long the button holds "Adicionado ✓" before returning to its resting
 * label. The board draws the added state as a frame of its own, not an end
 * state: the screen stays put, so the button has to become addable again for
 * a second helping.
 */
const ADDED_CONFIRMATION_DURATION = 1500;

export type ProductScreenProps = {
  productId: string;
  /**
   * The cart line this screen is editing, if it was opened from "Editar".
   * Its configuration seeds the screen, and confirming replaces it rather
   * than adding a second line.
   */
  editingLineId?: string;
  /** Injected by tests so every failure the board draws can be exercised. */
  submit?: CartSubmitter;
};

/** The product detail screen — Figma page 64:2470. */
export function ProductScreen({
  productId,
  editingLineId,
  submit = submitToCart,
}: ProductScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addItem, replaceItem, items: cartItems, count: cartCount, subtotal: cartSubtotal } = useCart();
  const { setIsTabBarHidden } = useTabBarVisibility();
  const reducedMotion = useReducedMotion();

  const product = useMemo(() => getProductById(productId), [productId]);
  const groups = useMemo(() => product?.modifierGroups ?? [], [product]);

  /** The line being edited, read once so later cart changes cannot reseed. */
  const editedLine = useMemo(
    () => (editingLineId ? cartItems.find((entry) => entry.lineId === editingLineId) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editingLineId]
  );

  /*
   * Nothing is pre-selected, including required single-choice groups. The
   * board's whole validation story — "Escolher opções", "Falta escolher o
   * pão" — only exists if a required group can start empty, and choosing on
   * the customer's behalf quietly commits them to an option they never read.
   */
  const [selections, setSelections] = useState<CartSelection[]>(editedLine?.selections ?? []);
  const [quantity, setQuantity] = useState(editedLine?.quantity ?? 1);
  const [notes, setNotes] = useState(editedLine?.notes ?? '');
  const [isFavorite, setIsFavorite] = useState(false);
  const [errorGroupId, setErrorGroupId] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [submission, setSubmission] = useState<SubmissionState>({ kind: 'idle' });
  /**
   * The base price the server last told us about, once it disagreed with the
   * catalogue. Held so the header and the total can show what will actually
   * be charged before the customer confirms it again.
   */
  const [revisedPrice, setRevisedPrice] = useState<number | null>(null);
  const addedTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  /**
   * The idempotency key of the attempt in progress. A retry reuses it, so a
   * submission that already succeeded server-side cannot be counted twice;
   * it is cleared once the attempt settles.
   */
  const attemptKey = useRef<string | null>(null);

  useEffect(() => () => clearTimeout(addedTimeout.current), []);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);
  const groupOffsets = useRef<Record<string, number>>({});

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // The board draws no tab bar over the product, and the footer would
  // otherwise stack on top of one.
  useFocusEffect(
    useCallback(() => {
      setIsTabBarHidden(true);
      return () => setIsTabBarHidden(false);
    }, [setIsTabBarHidden])
  );

  const toggleOption = useCallback(
    (groupId: string, optionId: string) => {
      const group = groups.find((candidate) => candidate.id === groupId);
      if (!group) return;

      setSelections((current) => {
        const existing = current.find((selection) => selection.groupId === groupId);
        if (!isOptionSelectable(group, existing, group.options.find((o) => o.id === optionId)!)) {
          return current;
        }

        // A single-choice group replaces rather than accumulates: picking a
        // second option is changing your mind, not adding to a set.
        if (isRadioGroup(group)) {
          return [
            ...current.filter((selection) => selection.groupId !== groupId),
            { groupId, optionIds: [optionId] },
          ];
        }

        if (!existing) return [...current, { groupId, optionIds: [optionId] }];

        const optionIds = existing.optionIds.includes(optionId)
          ? existing.optionIds.filter((id) => id !== optionId)
          : [...existing.optionIds, optionId];

        const rest = current.filter((selection) => selection.groupId !== groupId);
        return optionIds.length === 0 ? rest : [...rest, { groupId, optionIds }];
      });

      // Answering the group the message pointed at retires the message; it
      // has done its job and leaving it up would read as a second failure.
      setErrorGroupId((current) => (current === groupId ? null : current));
    },
    [groups]
  );

  const handleNeedsChoices = useCallback(() => {
    if (!product) return;
    const groupId = findFirstIncompleteGroup(product, selections);
    if (!groupId) return;

    setErrorGroupId(groupId);

    // Nothing is cleared: the press takes the customer to what is missing,
    // it does not undo what they already decided.
    const offset = groupOffsets.current[groupId];
    if (offset !== undefined) {
      scrollTo(scrollRef, 0, Math.max(0, offset - COLLAPSE_RANGE / 2), !reducedMotion);
    }
  }, [product, selections, reducedMotion, scrollRef]);

  const handleAdd = useCallback(async () => {
    if (!product || justAdded || submission.kind === 'adding') return;

    const priced = revisedPrice === null ? product : { ...product, price: revisedPrice };
    const unitPrice = computeUnitPrice(priced, selections);

    // A retry reuses the key of the attempt that failed; only a fresh press
    // mints a new one.
    const key = attemptKey.current ?? `${product.id}-${Date.now()}`;
    attemptKey.current = key;

    setSubmission({ kind: 'adding' });
    const result = await submit({ key, productId: product.id, quantity, unitPrice });

    if (!result.ok) {
      if (result.reason === 'priceChanged') {
        // The customer confirms the new price with a fresh attempt, so the
        // old key is retired along with the old number.
        setRevisedPrice(result.newPrice);
        attemptKey.current = null;
        setSubmission({
          kind: 'failed',
          reason: 'priceChanged',
          newPrice: result.newPrice,
          previousPrice: priced.price,
        });
        return;
      }
      setSubmission({ kind: 'failed', reason: result.reason });
      return;
    }

    const trimmed = notes.trim() || undefined;
    if (editingLineId) {
      // One call, carrying the quantity: an edit changes a line, it does not
      // add quantity-many of them.
      replaceItem(editingLineId, priced, { selections, notes: trimmed, unitPrice, quantity });
    } else {
      for (let index = 0; index < quantity; index += 1) {
        addItem(priced, { selections, notes: trimmed, unitPrice });
      }
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    attemptKey.current = null;
    setSubmission({ kind: 'idle' });

    // Without this the press has no visible consequence at all: the cart is
    // a screen away, and the button would go on reading "Adicionar" as if
    // nothing had happened.
    setJustAdded(true);
    addedTimeout.current = setTimeout(() => setJustAdded(false), ADDED_CONFIRMATION_DURATION);
  }, [
    product,
    selections,
    notes,
    quantity,
    addItem,
    replaceItem,
    editingLineId,
    justAdded,
    submission.kind,
    submit,
    revisedPrice,
  ]);

  /** The option labels the offline message names as surviving. */
  const preservedLabels = useMemo(
    () =>
      selections.flatMap((selection) => {
        const group = groups.find((candidate) => candidate.id === selection.groupId);
        if (!group) return [];
        return selection.optionIds.flatMap((optionId) => {
          const option = group.options.find((candidate) => candidate.id === optionId);
          return option ? [option.label] : [];
        });
      }),
    [selections, groups]
  );

  // Everything below prices against the revised figure once the server has
  // corrected us, so the header, the breakdown and the button agree.
  const priced = product && revisedPrice !== null ? { ...product, price: revisedPrice } : product;

  if (!product || !priced) {
    return (
      <NotFoundScreen>
        <Text color="secondary">{content.notFound}</Text>
      </NotFoundScreen>
    );
  }

  return (
    <Screen>
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: HERO_MAX_HEIGHT + insets.top }}
        showsVerticalScrollIndicator={false}
      >
        <Detail>
          <ProductHeader product={priced} selections={selections} />

          {groups.length > 0 ? (
            <Groups>
              {groups.map((group) => (
                <ModifierGroupCard
                  key={group.id}
                  group={group}
                  selection={selections.find((selection) => selection.groupId === group.id)}
                  onToggle={(optionId) => toggleOption(group.id, optionId)}
                  showError={errorGroupId === group.id}
                  onLayout={(y) => {
                    groupOffsets.current[group.id] = y;
                  }}
                />
              ))}
            </Groups>
          ) : null}

          <ProductNoteField value={notes} onChangeText={setNotes} />

          <ProductQuantityRow
            quantity={quantity}
            maxQuantity={product.maxQuantity}
            onIncrement={() => setQuantity((current) => current + 1)}
            onDecrement={() => setQuantity((current) => Math.max(1, current - 1))}
          />

          {/*
            Last, and deliberately so: reference belongs after the decision,
            where it informs without competing with it.
          */}
          {product.disclosures?.length ? (
            <ProductDisclosures disclosures={product.disclosures} />
          ) : null}
        </Detail>
      </Animated.ScrollView>

      <ProductHero
        product={product}
        topInset={insets.top}
        scrollY={scrollY}
        mode={groups.length > 0 ? 'customize' : 'detail'}
        onBack={() => router.back()}
        onClose={() => router.back()}
        onShare={() => {
          Share.share({ message: `${product.name} — ${content.addToCart(product.price)}` }).catch(
            () => {}
          );
        }}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite((current) => !current)}
      />

      <ProductFooter
        product={priced}
        selections={selections}
        quantity={quantity}
        bottomInset={insets.bottom}
        onAdd={handleAdd}
        onNeedsChoices={handleNeedsChoices}
        justAdded={justAdded}
        cartCount={cartCount}
        cartTotal={cartSubtotal}
        onOpenCart={() => router.push('/cart')}
        submission={submission}
        preservedLabels={preservedLabels}
      />
    </Screen>
  );
}
