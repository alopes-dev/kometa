import { ActivityIndicator, Pressable } from 'react-native';
import { useTheme } from 'styled-components/native';
import { Icon, type IconProps } from '@/components/design-system/atoms';
import { Container, Copy, Subtitle, Title, type RowState } from './SelectionRow.styles';

export type { RowState };

export type SelectionRowProps = {
  icon: Pick<IconProps, 'name' | 'sf'>;
  title: string;
  subtitle?: string;
  state?: RowState;
  /** Omitted on a row that only states a fact — the review's address, say. */
  onPress?: () => void;
};

/**
 * One row of a choice: an address, a payment method, a contact, an instruction.
 *
 * The trailing mark is derived from the state rather than passed in, so a
 * selected row can never show a chevron that implies it is still undecided,
 * and an unavailable one always carries the lock board 12 draws.
 */
export function SelectionRow({
  icon,
  title,
  subtitle,
  state = 'default',
  onPress,
}: SelectionRowProps) {
  const theme = useTheme();
  const isDisabled = state === 'unavailable' || state === 'loading' || !onPress;

  const row = (
    <Container state={state}>
      <Icon
        name={icon.name}
        sf={icon.sf}
        size={theme.checkout.metrics.rowIcon}
        color={state === 'selected' ? 'brand' : state === 'unavailable' ? 'disabled' : 'secondary'}
      />
      <Copy>
        <Title state={state}>{title}</Title>
        {subtitle ? <Subtitle state={state}>{subtitle}</Subtitle> : null}
      </Copy>
      <Trailing state={state} hasAction={Boolean(onPress)} />
    </Container>
  );

  if (isDisabled) return row;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: state === 'selected' }}
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      style={({ pressed }) => ({ opacity: pressed ? theme.pressed.opacity : 1 })}
    >
      {row}
    </Pressable>
  );
}

function Trailing({ state, hasAction }: { state: RowState; hasAction: boolean }) {
  const theme = useTheme();
  const size = theme.checkout.metrics.rowTrailing;

  if (state === 'loading')
    return <ActivityIndicator size="small" color={theme.colors.text.secondary} />;
  if (state === 'selected') {
    return <Icon name="checkmark-circle" sf="checkmark.circle.fill" size={size} color="brand" />;
  }
  if (state === 'unavailable') {
    return <Icon name="lock-closed-outline" sf="lock" size={size - 2} color="disabled" />;
  }
  return hasAction ? (
    <Icon name="chevron-forward" sf="chevron.right" size={size} color="muted" />
  ) : null;
}
