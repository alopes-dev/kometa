import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { TrackingSheet, SHEET_DETENTS } from './TrackingSheet';

describe('TrackingSheet', () => {
  /** Board 03 labels the three detents in points: 92, 220, 350. */
  it('offers exactly the three detents the board draws', () => {
    expect(SHEET_DETENTS).toEqual([92, 220, 350]);
  });

  it('renders its content', () => {
    render(
      <ThemeProvider>
        <TrackingSheet>
          <Text>O teu pedido está a caminho</Text>
        </TrackingSheet>
      </ThemeProvider>
    );
    expect(screen.getByText('O teu pedido está a caminho')).toBeTruthy();
  });
});
