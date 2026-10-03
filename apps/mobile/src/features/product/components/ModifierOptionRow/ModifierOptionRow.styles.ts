import styled from 'styled-components/native';
import { productTextStyle } from '@/theme';

/**
 * One option, as board 02 draws it: control on the left, name in the middle,
 * cost on the right. 48pt clears the 44pt minimum target with room for the
 * note that a blocked option carries underneath.
 */
export const Row = styled.View<{ dimmed: boolean }>`
  min-height: ${({ theme }) => theme.product.metrics.optionHeight}px;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.product.metrics.optionGap}px;
  opacity: ${({ dimmed }) => (dimmed ? 0.45 : 1)};
`;

/**
 * Holds the atom at the control's measured size. The wrapper exists so the
 * atom can be mounted with `pointerEvents="none"` — it draws the control, the
 * row above owns the press.
 */
export const Control = styled.View`
  width: ${({ theme }) => theme.product.metrics.controlSize}px;
  height: ${({ theme }) => theme.product.metrics.controlSize}px;
  align-items: center;
  justify-content: center;
`;

export const Labels = styled.View`
  flex: 1;
`;

export const Label = styled.Text`
  ${productTextStyle('optionLabel')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

/** `Indisponível hoje` / `Limite atingido` — why this row cannot be chosen. */
export const Note = styled.Text`
  ${productTextStyle('optionNote')}
  color: ${({ theme }) => theme.colors.text.muted};
`;

export const Cost = styled.Text`
  ${productTextStyle('optionCost')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;
