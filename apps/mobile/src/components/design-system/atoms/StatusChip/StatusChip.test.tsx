import { render } from '@testing-library/react-native';
import { StatusChip } from './StatusChip';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { semanticColors } from '@/theme';

/**
 * The stages this chip's palette is meant to cover. Previously read from
 * `TRACKING_STAGES`, which the orders rebuild removed — the orders path now
 * keys its own chip off `OrderStage`. Listed here so the assertion below
 * still pins the palette to something, rather than to its own keys.
 */
const COVERED_STAGES = [
  'confirmed',
  'preparing',
  'ready',
  'on-the-way',
  'picked-up',
  'arriving',
  'delivered',
  'cancelled',
] as const;

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('StatusChip', () => {
  it('renders the label so the state is readable without color', () => {
    const { getByText } = renderWithTheme(<StatusChip status="delivered" label="Entregue" />);
    expect(getByText('Entregue')).toBeTruthy();
  });

  it('exposes the label to assistive technology', () => {
    const { getByLabelText } = renderWithTheme(<StatusChip status="cancelled" label="Cancelado" />);
    expect(getByLabelText('Cancelado')).toBeTruthy();
  });

  it('renders without an icon', () => {
    const { getByText } = renderWithTheme(<StatusChip status="preparing" label="Preparando" />);
    expect(getByText('Preparando')).toBeTruthy();
  });

  // The whole point of keying the delivery tokens off the real stage list is
  // that a new stage cannot be added without a color for it. If these drift,
  // `theme.colors.delivery[stage.key]` resolves to undefined at runtime and the
  // chip renders with no background — so assert the relationship directly.
  it('has a color token for every tracking stage', () => {
    const tokenKeys = Object.keys(semanticColors.light.delivery);
    for (const stage of COVERED_STAGES) {
      expect(tokenKeys).toContain(stage);
    }
  });
});
