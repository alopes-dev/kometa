import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

/**
 * A stand-in for `@gorhom/bottom-sheet` in tests.
 *
 * The real `BottomSheetScrollView` builds a Reanimated scroll handler, and
 * Reanimated rejects non-worklet handlers under Jest — a failure of the test
 * environment, not of the component. The stand-in renders children plainly so
 * a suite can assert what the sheet contains; the detents and the no-library
 * fallback are asserted directly against the component's own exports.
 */
const BottomSheet = ({ children }: { children: ReactNode }) => <View>{children}</View>;

export default BottomSheet;
export const BottomSheetScrollView = ({ children }: { children: ReactNode }) => (
  <ScrollView>{children}</ScrollView>
);
export const BottomSheetView = ({ children }: { children: ReactNode }) => <View>{children}</View>;
