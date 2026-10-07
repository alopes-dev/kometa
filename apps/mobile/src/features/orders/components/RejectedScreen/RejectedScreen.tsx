import { content } from '../../content';
import { ResultScreen } from '../ResultScreen';

/**
 * Board 13's refusal.
 *
 * The merchant could not accept — not the customer did something wrong. The
 * first fact after the headline is that nothing was charged, and the chip
 * repeats it so it survives a glance.
 */
export type RejectedScreenProps = {
  merchantName: string;
  onReviewCart: () => void;
  onExplore: () => void;
};

export function RejectedScreen({ merchantName, onReviewCart, onExplore }: RejectedScreenProps) {
  return (
    <ResultScreen
      tone="error"
      icon={{ name: 'close-circle-outline', sf: 'xmark.circle' }}
      title={content.rejectedHeadline(merchantName)}
      body={content.rejectedBody}
      chip={content.noChargeChip}
      primary={{ label: content.reviewCart, onPress: onReviewCart }}
      secondary={{ label: content.exploreRestaurants, onPress: onExplore }}
    />
  );
}
