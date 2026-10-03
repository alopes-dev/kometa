import { View } from 'react-native';
import { Text, TextField } from '@/components/design-system/atoms';
import { content } from '../../content';
import { NOTE_MAX_LENGTH } from '../../constants';

export type ProductNoteFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

/**
 * `Observação` — board 02.
 *
 * The helper is not decoration: a free-text note is where customers try to
 * place an order the choices above already cover, so the field says plainly
 * that it does not replace them.
 */
export function ProductNoteField({ value, onChangeText }: ProductNoteFieldProps) {
  return (
    <View>
      <TextField
        label={content.noteLabel}
        helperText={content.noteHelper}
        placeholder={content.notePlaceholder}
        value={value}
        onChangeText={onChangeText}
        maxLength={NOTE_MAX_LENGTH}
        multiline
        height={88}
        accessibilityLabel={content.noteLabel}
      />
      {/* The counter is visible rather than appearing near the limit: board
          07 asks for "contador visível", so the ceiling is never a surprise. */}
      <Text variant="caption" color="muted" style={{ alignSelf: 'flex-end', marginTop: 4 }}>
        {content.noteCounter(value.length, NOTE_MAX_LENGTH)}
      </Text>
    </View>
  );
}
