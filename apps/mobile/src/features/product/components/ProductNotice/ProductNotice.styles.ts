import styled from 'styled-components/native';
import { continuousCorners, productTextStyle } from '@/theme';

export type NoticeTone = 'neutral' | 'positive' | 'warning' | 'unavailable';

/**
 * A quiet, non-interactive strip of context — board 05's "Temporariamente
 * indisponível" and "Poupa 450 Kz", board 06's health line.
 *
 * Not the `Chip` atom: that is an interactive filter control with a press
 * scale and a selected state, and borrowing it here would make a statement
 * look tappable.
 */
export const Container = styled.View<{ tone: NoticeTone }>`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  ${continuousCorners}
  background-color: ${({ theme, tone }) =>
    tone === 'positive'
      ? theme.colors.status.success.bg
      : tone === 'warning'
        ? theme.colors.status.warning.bg
        : tone === 'unavailable'
          ? theme.colors.status.error.bg
          : theme.colors.background.secondary};
`;

export const Label = styled.Text<{ tone: NoticeTone }>`
  ${productTextStyle('notice')}
  flex-shrink: 1;
  color: ${({ theme, tone }) =>
    tone === 'positive'
      ? theme.colors.status.success.fg
      : tone === 'warning'
        ? theme.colors.status.warning.fg
        : tone === 'unavailable'
          ? theme.colors.status.error.fg
          : theme.colors.text.secondary};
`;
