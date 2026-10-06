import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from 'styled-components/native';
import { Icon } from '@/components/design-system/atoms';
import { formatKwanza } from '@/features/home/format';
import type { CartItem } from '@/hooks/CartProvider';
import { content } from '../../content';
import {
  ActionLabel,
  Controls,
  Details,
  Heading,
  Name,
  Options,
  Price,
  Quantity,
  Row,
  Stepper,
  Thumbnail,
  type LineState,
} from './CartItemRow.styles';

export type { LineState };

export type CartItemRowProps = {
  entry: CartItem;
  /** What it was configured as — "Carne · queijo · molho da casa". */
  description: string;
  state?: LineState;
  onEdit?: () => void;
  onIncrement?: () => void;
  /** Called at quantity 1 as well, where the control is a trash can. */
  onDecrement?: () => void;
};

/**
 * One line of the cart.
 *
 * The left-hand stepper control is a trash can at quantity 1 and a minus above
 * it — board 03 draws both, and the distinction matters: at one, pressing it
 * removes the line, and the icon has to say so before the press rather than
 * after it.
 *
 * The line price is the configured unit price times the quantity, so a line of
 * two reads as what it costs rather than as what one of them costs.
 */
export function CartItemRow({
  entry,
  description,
  state = 'default',
  onEdit,
  onIncrement,
  onDecrement,
}: CartItemRowProps) {
  const theme = useTheme();
  const isUnavailable = state === 'unavailable';
  const removesOnDecrement = entry.quantity <= 1;
  const lineTotal = entry.unitPrice * entry.quantity;

  const actionLabel =
    state === 'editing'
      ? content.editingOptions
      : state === 'updating'
        ? content.updatingItem
        : content.edit;

  const press = (handler?: () => void) => () => {
    if (!handler) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    handler();
  };

  return (
    <Row accessible={false}>
      <Thumbnail
        source={entry.item.imageUrl}
        contentFit="cover"
        transition={150}
        dimmed={isUnavailable}
      />
      <Details>
        <Heading>
          <Name state={state} numberOfLines={2}>
            {entry.item.name}
          </Name>
          <Price state={state}>{formatKwanza(lineTotal)}</Price>
        </Heading>
        <Options state={state} numberOfLines={2}>
          {isUnavailable ? content.unavailableItem : description}
        </Options>
        <Controls>
          {onEdit && !isUnavailable ? (
            <Pressable onPress={onEdit} accessibilityRole="button" hitSlop={8}>
              <ActionLabel state={state}>{actionLabel}</ActionLabel>
            </Pressable>
          ) : (
            <ActionLabel state={state}>{actionLabel}</ActionLabel>
          )}
          <Stepper>
            <Pressable
              onPress={press(onDecrement)}
              disabled={isUnavailable || !onDecrement}
              accessibilityRole="button"
              accessibilityLabel={removesOnDecrement ? content.remove : 'Menos'}
              hitSlop={10}
            >
              <Icon
                name={removesOnDecrement ? 'trash-outline' : 'remove'}
                sf={removesOnDecrement ? 'trash' : 'minus'}
                size={theme.checkout.metrics.stepperIcon}
                color={isUnavailable ? 'disabled' : removesOnDecrement ? 'error' : 'primary'}
              />
            </Pressable>
            <Quantity accessibilityLabel={`${content.reviewLine(entry.quantity, entry.item.name)}`}>
              {entry.quantity}
            </Quantity>
            <Pressable
              onPress={press(onIncrement)}
              disabled={isUnavailable || !onIncrement}
              accessibilityRole="button"
              accessibilityLabel="Mais"
              hitSlop={10}
            >
              <Icon
                name="add"
                sf="plus"
                size={theme.checkout.metrics.stepperIcon}
                color={isUnavailable ? 'disabled' : 'primary'}
              />
            </Pressable>
          </Stepper>
        </Controls>
      </Details>
    </Row>
  );
}
