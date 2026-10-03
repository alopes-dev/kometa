import { Pressable } from 'react-native';
import { Icon } from '../Icon';
import { Box } from './Checkbox.styles';

export type CheckboxProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export function Checkbox({ checked = false, onChange, disabled = false }: CheckboxProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : () => onChange?.(!checked)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      hitSlop={11}
    >
      <Box checked={checked} disabled={disabled}>
        {checked ? <Icon name="checkmark" sf="checkmark" size={16} color="onBrand" /> : null}
      </Box>
    </Pressable>
  );
}
