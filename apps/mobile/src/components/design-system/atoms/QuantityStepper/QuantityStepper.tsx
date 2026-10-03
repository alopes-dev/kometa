import { Pressable } from 'react-native';
import { Icon } from '../Icon';
import {
  Container,
  InlineButton,
  InlineContainer,
  InlineSign,
  InlineValue,
  StepButton,
  Value,
} from './QuantityStepper.styles';

/**
 * `pill` is the compact control used inside a cart row. `inline` is the
 * product board's: its own row, a bare minus and a filled plus.
 */
export type QuantityStepperVariant = 'pill' | 'inline';

export type QuantityStepperProps = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  variant?: QuantityStepperVariant;
  /**
   * Default true. False dims the sign and swallows the press, so a cap is
   * visible before it is discovered — board 07 asks that a limit never
   * depend on the press failing silently.
   */
  canIncrement?: boolean;
  canDecrement?: boolean;
};

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  variant = 'pill',
  canIncrement = true,
  canDecrement = true,
}: QuantityStepperProps) {
  if (variant === 'inline') {
    return (
      <InlineContainer>
        <Pressable
          onPress={canDecrement ? onDecrement : undefined}
          disabled={!canDecrement}
          accessibilityRole="button"
          accessibilityLabel="Diminuir quantidade"
          accessibilityState={{ disabled: !canDecrement }}
          hitSlop={8}
        >
          <InlineButton accent={false} disabled={!canDecrement}>
            {/* U+2212, the typographic minus the board sets — not a hyphen. */}
            <InlineSign onAccent={false} disabled={!canDecrement}>
              −
            </InlineSign>
          </InlineButton>
        </Pressable>
        <InlineValue>{quantity}</InlineValue>
        <Pressable
          onPress={canIncrement ? onIncrement : undefined}
          disabled={!canIncrement}
          accessibilityRole="button"
          accessibilityLabel="Aumentar quantidade"
          accessibilityState={{ disabled: !canIncrement }}
          hitSlop={8}
        >
          <InlineButton accent disabled={!canIncrement}>
            <InlineSign onAccent disabled={!canIncrement}>
              +
            </InlineSign>
          </InlineButton>
        </Pressable>
      </InlineContainer>
    );
  }


  return (
    <Container>
      <Pressable onPress={onDecrement} accessibilityRole="button" accessibilityLabel="Diminuir quantidade" hitSlop={8}>
        <StepButton variant="decrement">
          <Icon name="remove" sf="minus" size={14} color="primary" />
        </StepButton>
      </Pressable>
      <Value>{quantity}</Value>
      <Pressable onPress={onIncrement} accessibilityRole="button" accessibilityLabel="Aumentar quantidade" hitSlop={8}>
        <StepButton variant="increment">
          <Icon name="add" sf="plus" size={14} color="onBrand" />
        </StepButton>
      </Pressable>
    </Container>
  );
}
