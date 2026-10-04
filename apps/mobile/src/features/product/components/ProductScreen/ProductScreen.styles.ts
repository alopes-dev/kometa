import styled from 'styled-components/native';

export const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

/** `Detalhe` — the content column under the hero, at one rhythm throughout. */
export const Detail = styled.View`
  padding-horizontal: ${({ theme }) => theme.product.metrics.detailPaddingHorizontal}px;
  padding-vertical: ${({ theme }) => theme.product.metrics.detailPaddingVertical}px;
  gap: ${({ theme }) => theme.product.metrics.detailGap}px;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

/** `Personalizar` — the stack of group cards. */
export const Groups = styled.View`
  gap: ${({ theme }) => theme.product.metrics.cardGap}px;
`;

export const NotFoundScreen = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

/**
 * The sheet's own top row. The photograph is already behind the sheet, so
 * there is no hero here — only the control board 07 insists on keeping,
 * since a sheet that is dismissed by dragging alone strands anyone who
 * cannot drag.
 */
export const SheetHeader = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  padding-horizontal: ${({ theme }) => theme.product.metrics.detailPaddingHorizontal}px;
  padding-top: ${({ theme }) => theme.spacing[8]}px;
`;

export const SheetCloseButton = styled.View`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;
