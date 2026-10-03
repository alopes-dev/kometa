import styled from 'styled-components/native';
import { continuousCorners } from '@/theme';

/** Search sits on the same 20pt margin Home and Discovery do (node 48:20088). */
export const GUTTER = 20;

/** Gap between a section's header and its rows (node 48:20095). */
export const SECTION_GAP = 4;

/** Gap between sections (node 48:20094). */
export const CONTENT_GAP = 24;

/** The field the board draws at 52 (node 48:20090). */
export const FIELD_HEIGHT = 52;

/** The chevron that leaves (node 48:21780). */
export const BACK_ICON_SIZE = 22;

export const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

/**
 * The board's top bar (node 48:20088): a bare chevron beside the field, not a
 * disc. Nothing competes with the field here — it is the only thing on the
 * screen the customer came to use.
 */
export const TopBar = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[12]}px;
  padding-horizontal: ${GUTTER}px;
  padding-vertical: ${({ theme }) => theme.spacing[12]}px;
`;

export const Field = styled.View`
  flex: 1;
`;

export const Section = styled.View`
  gap: ${SECTION_GAP}px;
`;

/** "Categorias sugeridas" breathes more than a list of rows (node 48:20133). */
export const WideSection = styled.View`
  gap: ${({ theme }) => theme.spacing[12]}px;
`;

/**
 * Node 48:20153 — the board's note on how the screen answers a keystroke,
 * drawn as a card at the foot of the content.
 */
export const HintCard = styled.View`
  padding: ${({ theme }) => theme.spacing[12]}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  ${continuousCorners}
`;

/**
 * The room the opening sits in — node 62:313, which pads the block 28 from
 * the field. The scroll's own gap carries the space below it, so only the
 * top is set here.
 */
export const Opening = styled.View`
  padding-top: ${({ theme }) => theme.spacing[24]}px;
`;
