import styled from 'styled-components/native';

/** The same 20pt margin the rest of the app sits on (node 48:20172). */
export const GUTTER = 20;

/** Gap between the bands of the results screen (node 48:20171). */
export const CONTENT_GAP = 20;

/** Gap between the count and the cards, and between the cards (node 48:20193). */
export const RESULTS_GAP = 14;

/** The field that holds the query (node 48:20173). */
export const FIELD_HEIGHT = 52;

export const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

export const Gutter = styled.View`
  padding-horizontal: ${GUTTER}px;
`;

export const Results = styled.View`
  gap: ${RESULTS_GAP}px;
`;

/**
 * The room `SearchEmptyState` sits in, where the cards would have been.
 *
 * The board centres the block in the whole screen (node 62:335); here it is
 * centred in what the feed leaves, because the chrome above it — the field,
 * the tabs, the filters — is what the customer has to change to fill the
 * screen again, and pushing that off the top to centre two lines would hide
 * the way out.
 */
export const EmptySlot = styled.View`
  padding-vertical: ${({ theme }) => theme.spacing[48]}px;
`;
