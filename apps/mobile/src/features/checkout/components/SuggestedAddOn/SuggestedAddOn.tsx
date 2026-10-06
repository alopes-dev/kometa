import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import styled, { useTheme } from 'styled-components/native';
import { Icon } from '@/components/design-system/atoms';
import { formatKwanza } from '@/features/home/format';
import type { MenuItem } from '@/features/home/types';
import { checkoutTextStyle, continuousCorners } from '@/theme';

const Card = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.checkout.metrics.itemGap}px;
  padding: ${({ theme }) => theme.checkout.metrics.suggestionPadding}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.suggestionRadius}px;
  ${continuousCorners}
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border.subtle};
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const Thumbnail = styled(Image)`
  width: ${({ theme }) => theme.checkout.metrics.suggestionImage}px;
  height: ${({ theme }) => theme.checkout.metrics.suggestionImage}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.suggestionImageRadius}px;
  background-color: ${({ theme }) => theme.colors.media.placeholder};
`;

const Copy = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing[2]}px;
`;

const Name = styled.Text`
  ${checkoutTextStyle('rowTitle')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Price = styled.Text`
  ${checkoutTextStyle('rowSubtitle')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const AddButton = styled.View`
  width: ${({ theme }) => theme.checkout.metrics.suggestionAddSize}px;
  height: ${({ theme }) => theme.checkout.metrics.suggestionAddSize}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.suggestionAddSize / 2}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.brand.base};
`;

export type SuggestedAddOnProps = {
  item: MenuItem;
  onAdd: () => void;
};

/**
 * Board 08's optional add-on beside the minimum-order block.
 *
 * Offered, never automatic: board 07 is explicit that the checkout "nunca
 * inventa recomendações automáticas". It exists to make the gap closable in
 * one tap, not to merchandise.
 */
export function SuggestedAddOn({ item, onAdd }: SuggestedAddOnProps) {
  const theme = useTheme();

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onAdd();
  };

  return (
    <Card>
      <Thumbnail source={item.imageUrl} contentFit="cover" transition={150} />
      <Copy>
        <Name numberOfLines={1}>{item.name}</Name>
        <Price>{formatKwanza(item.price)}</Price>
      </Copy>
      <Pressable
        onPress={handleAdd}
        accessibilityRole="button"
        accessibilityLabel={`Adicionar ${item.name}`}
        hitSlop={8}
        style={({ pressed }) => ({ opacity: pressed ? theme.pressed.opacity : 1 })}
      >
        <AddButton>
          <Icon name="add" sf="plus" size={18} color="onBrand" />
        </AddButton>
      </Pressable>
    </Card>
  );
}
