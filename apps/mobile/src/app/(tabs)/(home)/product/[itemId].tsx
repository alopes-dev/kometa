import { useLocalSearchParams } from 'expo-router';
import { ProductScreen } from '@/features/product/components/ProductScreen';

/** `Produto` — Figma page 64:2470. The screen itself lives in the feature. */
export default function ProductDetail() {
  // `lineId` is present when the screen was opened from "Editar" in the cart:
  // it names the configuration to load and, on confirmation, to replace.
  const { itemId, lineId } = useLocalSearchParams<{ itemId: string; lineId?: string }>();
  return <ProductScreen productId={itemId} editingLineId={lineId} />;
}
