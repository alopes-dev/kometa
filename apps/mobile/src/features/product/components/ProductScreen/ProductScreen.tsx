import { useCallback, useMemo, useRef, useState } from 'react';
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
import { content } from '../../content';
import { getProductById } from '../../data';
import { computeTotal, computeUnitPrice } from '../../pricing';
import { findFirstIncompleteGroup, isRadioGroup, isOptionSelectable } from '../../validation';
import { ModifierGroupCard } from '../ModifierGroupCard';
import { ProductFooter } from '../ProductFooter';
import { ProductHeader } from '../ProductHeader';
import { ProductHero, COLLAPSE_RANGE, HERO_MAX_HEIGHT } from '../ProductHero';
import { ProductNoteField } from '../ProductNoteField';
import { ProductQuantityRow } from '../ProductQuantityRow';
import { Detail, Groups, NotFoundScreen, Screen } from './ProductScreen.styles';

export type ProductScreenProps = {
  productId: string;
};

/** The product detail screen — Figma page 64:2470. */
export function ProductScreen({ productId }: ProductScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addItem } = useCart();
  const { setIsTabBarHidden } = useTabBarVisibility();
  const reducedMotion = useReducedMotion();

  const product = useMemo(() => getProductById(productId), [productId]);
  const groups = useMemo(() => product?.modifierGroups ?? [], [product]);

  /*
   * Nothing is pre-selected, including required single-choice groups. The
   * board's whole validation story — "Escolher opções", "Falta escolher o
   * pão" — only exists if a required group can start empty, and choosing on
   * the customer's behalf quietly commits them to an option they never read.
   */
  const [selections, setSelections] = useState<CartSelection[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [errorGroupId, setErrorGroupId] = useState<string | null>(null);

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

  const handleAdd = useCallback(() => {
    if (!product) return;
    const unitPrice = computeUnitPrice(product, selections);
    const trimmed = notes.trim() || undefined;
    for (let index = 0; index < quantity; index += 1) {
      addItem(product, { selections, notes: trimmed, unitPrice });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [product, selections, notes, quantity, addItem]);

  if (!product) {
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
          <ProductHeader product={product} selections={selections} />

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
        product={product}
        selections={selections}
        quantity={quantity}
        bottomInset={insets.bottom}
        onAdd={handleAdd}
        onNeedsChoices={handleNeedsChoices}
      />
    </Screen>
  );
}
