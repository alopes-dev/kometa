import { useMemo, type ReactNode } from 'react';
import { ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { elevate } from '@/theme';
import {
  BottomSheet,
  BottomSheetScrollView,
  isBottomSheetAvailable,
} from '@/features/tracking/bottomSheet';

/**
 * The sheet half of the tracking screen.
 *
 * Board 03 labels three detents in points — 92, 220 and 350 — so they are
 * declared in points here rather than as percentages: the board sized them
 * against content (a status line, a status line plus courier, the whole
 * order), not against a viewport.
 *
 * Falls back to a static sheet where the gesture library is not linked, the
 * same guard the rest of the tracking code uses: a sheet that cannot be
 * dragged still has to show what it contains.
 */
export const SHEET_DETENTS = [92, 220, 350];

const StaticSheet = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: ${SHEET_DETENTS[2]}px;
  border-top-left-radius: ${({ theme }) => theme.radius.xl}px;
  border-top-right-radius: ${({ theme }) => theme.radius.xl}px;
  background-color: ${({ theme }) => theme.colors.background.primary};
  ${elevate('lg')}
`;

const Handle = styled.View`
  align-self: center;
  width: 36px;
  height: 4px;
  border-radius: 2px;
  margin-top: ${({ theme }) => theme.spacing[8]}px;
  margin-bottom: 4px;
  background-color: ${({ theme }) => theme.colors.border.subtle};
`;

export type TrackingSheetProps = {
  children: ReactNode;
  /** Which detent to open at. Board 07 opens at the middle one. */
  index?: number;
};

export function TrackingSheet({ children, index = 1 }: TrackingSheetProps) {
  const snapPoints = useMemo(() => SHEET_DETENTS, []);

  if (!isBottomSheetAvailable) {
    return (
      <StaticSheet>
        <Handle />
        <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
      </StaticSheet>
    );
  }

  return (
    <BottomSheet index={index} snapPoints={snapPoints} enablePanDownToClose={false}>
      <BottomSheetScrollView showsVerticalScrollIndicator={false}>{children}</BottomSheetScrollView>
    </BottomSheet>
  );
}
