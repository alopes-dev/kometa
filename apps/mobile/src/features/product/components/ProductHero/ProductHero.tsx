import { Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from 'styled-components/native';
import { FavoriteButton, Icon, Text } from '@/components/design-system/atoms';
import { product } from '@/theme';
import { content } from '../../content';
import type { Product } from '../../types';
import {
  ActionButton,
  ActionGroup,
  ActionShadow,
  Actions,
  CompactTitleWrapper,
  UnavailableLabel,
  UnavailableOverlay,
} from './ProductHero.styles';

export const HERO_MAX_HEIGHT = product.metrics.heroHeight;
export const HEADER_COMPACT_HEIGHT = product.metrics.heroCompact;
export const COLLAPSE_RANGE = HERO_MAX_HEIGHT - HEADER_COMPACT_HEIGHT;

/** How far the photograph stretches when the list is pulled past its top. */
const BOUNCE_STRETCH = 200;

export type ProductHeroProps = {
  product: Product;
  topInset: number;
  scrollY: SharedValue<number>;
  /** 'detail' trails a share button; 'customize' trails a close button. */
  mode: 'detail' | 'customize';
  onBack: () => void;
  onShare?: () => void;
  onClose?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

const heroPositionStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  overflow: 'hidden' as const,
};

/**
 * `Imagem do produto` — the photograph, and what it becomes.
 *
 * The board draws a static white bar above a static image. This runs the
 * photograph to the top edge and collapses it into that bar instead, the way
 * the restaurant screen already does — a deliberate deviation, recorded in
 * the spec. The compact title carries the product's name rather than a
 * generic "Detalhes", which is also what board 07 asks VoiceOver to hear.
 */
export function ProductHero({
  product: item,
  topInset,
  scrollY,
  mode,
  onBack,
  onShare,
  onClose,
  isFavorite = false,
  onToggleFavorite,
}: ProductHeroProps) {
  const theme = useTheme();
  const maxHeight = HERO_MAX_HEIGHT + topInset;
  const compactHeight = HEADER_COMPACT_HEIGHT + topInset;

  const containerStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [-BOUNCE_STRETCH, 0, COLLAPSE_RANGE],
      [maxHeight + BOUNCE_STRETCH, maxHeight, compactHeight],
      Extrapolation.CLAMP
    ),
  }));

  const mediaStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE_RANGE], [1, 0], Extrapolation.CLAMP),
  }));

  const solidStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE_RANGE], [0, 1], Extrapolation.CLAMP),
  }));

  // Held back until the photograph is half gone, so the name never reads as
  // one title sliding over another.
  const compactTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [COLLAPSE_RANGE * 0.5, COLLAPSE_RANGE],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <Animated.View
      style={[
        heroPositionStyle,
        { backgroundColor: theme.colors.background.primary },
        containerStyle,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme.colors.background.primary },
          solidStyle,
        ]}
      />

      <Animated.View style={[StyleSheet.absoluteFill, mediaStyle]}>
        <Image source={item.imageUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={product.heroScrim.colors}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: product.metrics.scrimHeight + topInset,
          }}
        />
        {item.availability === 'unavailable' ? (
          <UnavailableOverlay>
            <UnavailableLabel>{content.unavailableBadge}</UnavailableLabel>
          </UnavailableOverlay>
        ) : null}
      </Animated.View>

      <Animated.View style={compactTitleStyle} pointerEvents="none">
        <CompactTitleWrapper topInset={topInset}>
          <Text variant="title" numberOfLines={1}>
            {item.name}
          </Text>
        </CompactTitleWrapper>
      </Animated.View>

      <Actions topInset={topInset}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={content.back}
          hitSlop={8}
        >
          <ActionShadow>
            <ActionButton>
              <Icon
                name="chevron-back"
                sf="chevron.left"
                size={product.metrics.actionIconSize}
                color="primary"
              />
            </ActionButton>
          </ActionShadow>
        </Pressable>

        <ActionGroup>
          {mode === 'detail' && onShare ? (
            <Pressable
              onPress={onShare}
              accessibilityRole="button"
              accessibilityLabel={content.share}
              hitSlop={8}
            >
              <ActionShadow>
                <ActionButton>
                  <Icon
                    name="share-outline"
                    sf="square.and.arrow.up"
                    size={product.metrics.actionIconSize}
                    color="primary"
                  />
                </ActionButton>
              </ActionShadow>
            </Pressable>
          ) : null}

          {mode === 'customize' && onClose ? (
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={content.close}
              hitSlop={8}
            >
              <ActionShadow>
                <ActionButton>
                  <Icon
                    name="close"
                    sf="xmark"
                    size={product.metrics.actionIconSize}
                    color="primary"
                  />
                </ActionButton>
              </ActionShadow>
            </Pressable>
          ) : null}

          {/*
            The heart stays in the error ramp and never in brand green — board
            07: favouriting must not compete with the CTA for the same colour.
            The atom already draws it that way.
          */}
          {onToggleFavorite ? (
            <ActionShadow>
              <FavoriteButton
                size={product.metrics.actionSize}
                isFavorite={isFavorite}
                onToggle={onToggleFavorite}
              />
            </ActionShadow>
          ) : null}
        </ActionGroup>
      </Actions>
    </Animated.View>
  );
}
