import { useLocalSearchParams } from 'expo-router';
import { ProductScreen } from '@/features/product/components/ProductScreen';

/**
 * The same product screen, presented as a sheet — board 06, "bottom sheet
 * quando a tarefa é curta".
 *
 * A route of its own rather than an option on the full-screen one, because
 * presentation is fixed when a route is pushed: the menu decides which of the
 * two a product deserves, and a screen cannot change its own presentation
 * after it has mounted.
 */
export default function ProductSheet() {
  const { itemId, lineId } = useLocalSearchParams<{ itemId: string; lineId?: string }>();
  return <ProductScreen productId={itemId} editingLineId={lineId} compact />;
}
