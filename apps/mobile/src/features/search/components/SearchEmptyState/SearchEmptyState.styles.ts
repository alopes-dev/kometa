import styled from 'styled-components/native';
import { Text } from '@/components/design-system/atoms';

/** The disc behind the glyph (nodes 62:315, 62:336). */
export const DISC_SIZE = 72;

/** The glyph inside it (nodes 62:1340, 62:1358). */
export const ICON_SIZE = 32;

/** Gap between the disc, the two lines and the action (node 62:335). */
export const STATE_GAP = 14;

/**
 * What keeps the body from running the full width of the screen
 * (node 62:335) — the lines wrap at roughly forty characters, which is what
 * makes a centred paragraph read as one block instead of a stretched line.
 */
export const SIDE_PADDING = 36;

export const Root = styled.View`
  align-items: center;
  justify-content: center;
  gap: ${STATE_GAP}px;
  padding-horizontal: ${SIDE_PADDING}px;
`;

/**
 * The board fills the disc with #e8f7ed over its old green. Here it takes
 * `brand.subtle`, the role that fill plays, so the circle follows the palette
 * into dark mode instead of staying a light-mode mint.
 */
export const Disc = styled.View`
  width: ${DISC_SIZE}px;
  height: ${DISC_SIZE}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.brand.subtle};
`;

/**
 * Centred text, which `Text` has no prop for and every call site would
 * otherwise repeat as an inline style.
 */
export const Centered = styled(Text)`
  text-align: center;
`;
