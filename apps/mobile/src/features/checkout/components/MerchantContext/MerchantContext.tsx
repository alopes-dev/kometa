import { formatDeliveryWindow } from '@/features/home/format';
import type { Restaurant } from '@/features/home/types';
import { content } from '../../content';
import { Card, Chip, ChipLabel, Details, Meta, Name, Thumbnail } from './MerchantContext.styles';

export type MerchantContextProps = {
  merchant: Restaurant;
};

/**
 * Who the order is from, where they are and how long they take.
 *
 * The `1 loja` chip is not decoration: board 19 states "Um merchant por
 * carrinho" as a product principle, and this is where the rule is visible
 * before it is ever enforced by a dialog.
 */
export function MerchantContext({ merchant }: MerchantContextProps) {
  const locality = merchant.neighbourhood ?? merchant.cuisine;
  const meta = `${locality} · ${formatDeliveryWindow(merchant.deliveryTimeMinutes)}`;

  return (
    <Card accessible accessibilityLabel={`${merchant.name}. ${meta}`}>
      <Thumbnail source={merchant.imageUrl} contentFit="cover" transition={150} />
      <Details>
        <Name numberOfLines={1}>{merchant.name}</Name>
        <Meta numberOfLines={1}>{meta}</Meta>
      </Details>
      <Chip>
        <ChipLabel>{content.singleMerchantChip}</ChipLabel>
      </Chip>
    </Card>
  );
}
