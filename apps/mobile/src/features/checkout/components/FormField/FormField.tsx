import { forwardRef } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { checkoutTextStyle, continuousCorners } from '@/theme';

const Field = styled.View`
  gap: ${({ theme }) => theme.checkout.metrics.fieldGap}px;
`;

const Label = styled.Text`
  ${checkoutTextStyle('fieldLabel')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Box = styled.View<{ tone: 'default' | 'focus' | 'error' }>`
  min-height: ${({ theme }) => theme.checkout.metrics.fieldMinHeight}px;
  justify-content: center;
  padding-horizontal: ${({ theme }) => theme.checkout.metrics.fieldPaddingH}px;
  padding-vertical: ${({ theme }) => theme.checkout.metrics.fieldPaddingV}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.fieldRadius}px;
  ${continuousCorners}
  border-width: 1px;
  border-color: ${({ theme, tone }) =>
    tone === 'error'
      ? theme.colors.border.error
      : tone === 'focus'
        ? theme.colors.border.focus
        : theme.colors.border.default};
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const Input = styled(TextInput)`
  ${checkoutTextStyle('fieldValue')}
  padding: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Message = styled.Text<{ tone: 'error' | 'muted' }>`
  ${checkoutTextStyle('fieldError')}
  color: ${({ theme, tone }) => (tone === 'error' ? theme.colors.text.error : theme.colors.text.secondary)};
`;

export type FormFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  /** Shown under the box, in red. Takes precedence over `helper`. */
  error?: string;
  /** A counter or a privacy note — board 11 puts both here. */
  helper?: string;
  focused?: boolean;
};

/**
 * Board 09's promo field and board 10/11's address and contact fields.
 *
 * The error never clears the value: board 09 is explicit that "a mensagem
 * mantém o código no campo para correção", so correcting a typo is one
 * keystroke rather than a retype.
 */
export const FormField = forwardRef<TextInput, FormFieldProps>(function FormField(
  { label, error, helper, focused = false, ...inputProps },
  ref
) {
  const theme = useTheme();
  const tone = error ? 'error' : focused ? 'focus' : 'default';

  return (
    <Field>
      <Label>{label}</Label>
      <Box tone={tone}>
        <Input
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={theme.colors.text.muted}
          {...inputProps}
        />
      </Box>
      {error ? (
        <Message tone="error">{error}</Message>
      ) : helper ? (
        <Message tone="muted">{helper}</Message>
      ) : null}
    </Field>
  );
});
