import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { QuantityStepper, Text } from '@/components/design-system/atoms';
import { formatKwanza } from '@/features/home/format';
import type { CartItem } from '@/hooks/CartProvider';
import { describeCartLine } from '../../cartDisplay';
import { Container, Thumbnail, Info, PriceText } from './OrderItemRow.styles';

export type OrderItemRowProps = {
  entry: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  /**
   * Reopens the product with this configuration loaded. Omitted where there
   * is nowhere to go back to — the row then simply states what was chosen.
   */
  onEdit?: () => void;
};

export function OrderItemRow({ entry, onIncrement, onDecrement, onEdit }: OrderItemRowProps) {
  const { item, quantity, selections, notes, unitPrice } = entry;
  return (
    <Container>
      <Thumbnail>
        <Image source={item.imageUrl} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      </Thumbnail>
      <Info>
        <Text variant="title" numberOfLines={1}>
          {item.name}
        </Text>
        <Text variant="caption" color="secondary" numberOfLines={2}>
          {describeCartLine(item, selections, notes)}
        </Text>
        <PriceText>{formatKwanza(unitPrice)}</PriceText>
        {onEdit ? (
          <Pressable
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel={`Editar ${item.name}`}
            hitSlop={8}
          >
            <Text variant="caption" color="brand">
              Editar
            </Text>
          </Pressable>
        ) : null}
      </Info>
      <QuantityStepper quantity={quantity} onIncrement={onIncrement} onDecrement={onDecrement} />
    </Container>
  );
}
