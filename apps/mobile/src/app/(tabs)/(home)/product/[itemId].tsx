import { useLocalSearchParams } from 'expo-router';
import { ProductScreen } from '@/features/product/components/ProductScreen';

/** `Produto` — Figma page 64:2470. The screen itself lives in the feature. */
export default function ProductDetail() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  return <ProductScreen productId={itemId} />;
}
