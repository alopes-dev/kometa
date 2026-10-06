import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import styled from 'styled-components/native';
import { continuousCorners } from '@/theme';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const Block = styled.View<{ width?: string; height?: number; radius?: number }>`
  width: ${({ width }) => width ?? '100%'};
  height: ${({ theme, height }) => height ?? theme.checkout.metrics.skeletonLineHeight}px;
  border-radius: ${({ theme, radius }) => radius ?? theme.checkout.metrics.skeletonRadius}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.tertiary};
`;

const Group = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.checkout.metrics.itemGap}px;
  padding-vertical: ${({ theme }) => theme.checkout.metrics.itemPaddingV}px;
`;

const Lines = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing[8]}px;
`;

const Card = styled.View`
  gap: ${({ theme }) => theme.spacing[8]}px;
  padding: ${({ theme }) => theme.checkout.metrics.summaryPadding}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.summaryRadius}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

const Screen = styled.View`
  gap: ${({ theme }) => theme.checkout.metrics.bodyGap}px;
`;

/**
 * Board 16, "Skeletons com dimensões finais para eliminar layout jump".
 *
 * Every block here is the size of the thing it stands in for — a 64pt
 * thumbnail, a 52pt merchant tile, a four-line summary card — so nothing moves
 * when the data lands. The shimmer is a slow opacity cycle, and Reduce Motion
 * replaces it with a static block rather than a faster one.
 */
export function CartSkeleton() {
  const reducedMotion = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) return;
    pulse.value = withRepeat(withTiming(0.45, { duration: 700 }), -1, true);
  }, [pulse, reducedMotion]);

  const shimmer = useAnimatedStyle(() => ({ opacity: reducedMotion ? 1 : pulse.value }));

  return (
    <Animated.View
      style={shimmer}
      accessibilityRole="progressbar"
      accessibilityLabel="A carregar o carrinho"
    >
      <Screen>
        <Card>
          <Group>
            <Block width="52px" height={52} radius={14} />
            <Lines>
              <Block width="60%" />
              <Block width="80%" />
            </Lines>
          </Group>
        </Card>
        {[0, 1, 2].map((index) => (
          <Group key={index}>
            <Block width="64px" height={64} radius={14} />
            <Lines>
              <Block width="55%" />
              <Block width="85%" />
              <Block width="40%" />
            </Lines>
          </Group>
        ))}
        <Card>
          <Block width="70%" />
          <Block width="55%" />
          <Block width="80%" />
          <Block width="35%" />
        </Card>
      </Screen>
    </Animated.View>
  );
}
