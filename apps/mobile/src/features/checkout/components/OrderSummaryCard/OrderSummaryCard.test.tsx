import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { OrderSummaryCard } from './OrderSummaryCard';
import type { OrderSummary } from '../../types';

const base: OrderSummary = {
  subtotal: 12700,
  delivery: 1200,
  deliveryMode: 'normal',
  discount: 0,
  total: 13900,
};

function renderCard(summary: OrderSummary) {
  return render(
    <ThemeProvider>
      <OrderSummaryCard summary={summary} />
    </ThemeProvider>
  );
}

describe('OrderSummaryCard', () => {
  it('states subtotal, delivery and total', () => {
    renderCard(base);
    expect(screen.getByText('Subtotal')).toBeTruthy();
    expect(screen.getByText('12.700 Kz')).toBeTruthy();
    expect(screen.getByText('1.200 Kz')).toBeTruthy();
    expect(screen.getByText('13.900 Kz')).toBeTruthy();
  });

  /** Board 03: a discount is a negative line, not a reduced subtotal. */
  it('writes a discount as a negative line and leaves the subtotal alone', () => {
    renderCard({ ...base, discount: 1500, total: 12400 });
    expect(screen.getByText('12.700 Kz')).toBeTruthy();
    expect(screen.getByText('-1.500 Kz')).toBeTruthy();
    expect(screen.getByText('12.400 Kz')).toBeTruthy();
  });

  it('omits the discount line when there is nothing to discount', () => {
    renderCard(base);
    expect(screen.queryByText('Desconto')).toBeNull();
  });

  it('writes free delivery as a word rather than as a zero', () => {
    renderCard({ ...base, delivery: 0, deliveryMode: 'free', total: 12700 });
    expect(screen.getByText('Grátis')).toBeTruthy();
    expect(screen.queryByText('0 Kz')).toBeNull();
  });

  /** Board 09: a surged fee never appears without its cause. */
  it('explains a dynamic fee', () => {
    renderCard({ ...base, delivery: 1600, deliveryMode: 'dynamic', total: 14300 });
    expect(screen.getByText('1.600 Kz')).toBeTruthy();
    expect(
      screen.getByText('Entrega ajustada por procura elevada. Vês sempre o preço antes de pagar.')
    ).toBeTruthy();
  });

  it('says nothing extra about an ordinary fee', () => {
    renderCard(base);
    expect(screen.queryByText(/procura elevada/)).toBeNull();
  });
});
