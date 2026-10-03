import { QuantityStepper, Text } from '@/components/design-system/atoms';
import { content } from '../../content';
import { Labels, Limit, Row } from './ProductQuantityRow.styles';

export type ProductQuantityRowProps = {
  quantity: number;
  /** Absent means unlimited — most products have no stock ceiling to show. */
  maxQuantity?: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

/** `Quantidade` — boards 03, 04 and 06. */
export function ProductQuantityRow({
  quantity,
  maxQuantity,
  onIncrement,
  onDecrement,
}: ProductQuantityRowProps) {
  const canIncrement = maxQuantity === undefined || quantity < maxQuantity;
  // One is the floor, not zero: removing the product is leaving the screen,
  // not stepping the counter down past it.
  const canDecrement = quantity > 1;

  return (
    <Row>
      <Labels>
        <Text variant="h5">{content.quantityLabel}</Text>
        {maxQuantity !== undefined ? <Limit>{content.maxAvailable(maxQuantity)}</Limit> : null}
      </Labels>
      <QuantityStepper
        variant="inline"
        quantity={quantity}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        canIncrement={canIncrement}
        canDecrement={canDecrement}
      />
    </Row>
  );
}
