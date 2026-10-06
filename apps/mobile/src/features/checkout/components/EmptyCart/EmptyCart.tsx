import { Pressable } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Icon } from '@/components/design-system/atoms';
import { checkoutTextStyle, continuousCorners, textStyle } from '@/theme';
import { content } from '../../content';

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[16]}px;
  padding-horizontal: ${({ theme }) => theme.spacing[32]}px;
`;

const Plate = styled.View`
  width: ${({ theme }) => theme.checkout.metrics.stateBadge}px;
  height: ${({ theme }) => theme.checkout.metrics.stateBadge}px;
  border-radius: ${({ theme }) => theme.radius.xxl}px;
  ${continuousCorners}
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

const Title = styled.Text`
  ${textStyle('h4')}
  text-align: center;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Body = styled.Text`
  ${checkoutTextStyle('stateBody')}
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Action = styled.View`
  height: ${({ theme }) => theme.checkout.metrics.ctaHeight}px;
  align-items: center;
  justify-content: center;
  padding-horizontal: ${({ theme }) => theme.spacing[32]}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.ctaRadius}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.brand.base};
`;

const ActionLabel = styled.Text`
  ${checkoutTextStyle('actionLabel')}
  color: ${({ theme }) => theme.colors.text.onBrand};
`;

export type EmptyCartProps = {
  onExplore: () => void;
};

/**
 * Board 07. "Contexto, não erro": the empty cart explains the next step and
 * keeps the way back, rather than apologising for a state the customer chose.
 *
 * It deliberately recommends nothing. Board 07 allows suggesting the last
 * merchant if it is still open, and rules out invented recommendations
 * outright — so the only action here is the one the customer can act on.
 */
export function EmptyCart({ onExplore }: EmptyCartProps) {
  const theme = useTheme();

  return (
    <Container>
      <Plate>
        <Icon name="bag-outline" sf="bag" size={32} color="muted" />
      </Plate>
      <Title>{content.emptyTitle}</Title>
      <Body>{content.emptyBody}</Body>
      <Pressable
        onPress={onExplore}
        accessibilityRole="button"
        style={({ pressed }) => ({ opacity: pressed ? theme.pressed.opacity : 1 })}
      >
        <Action>
          <ActionLabel>{content.emptyAction}</ActionLabel>
        </Action>
      </Pressable>
    </Container>
  );
}
