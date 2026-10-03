import { View } from 'react-native';
import { Icon, Text } from '@/components/design-system/atoms';
import type { CartSelection } from '@/hooks/CartProvider';
import { formatKwanza } from '../../../home/format';
import { content } from '../../content';
import { resolveHeadlinePrice } from '../../pricing';
import type { Product } from '../../types';
import { ProductNotice } from '../ProductNotice';
import {
  Attribute,
  AttributeValue,
  Attributes,
  Description,
  Explainer,
  Header,
  Meta,
  Notices,
  PreviousPrice,
  Price,
  PriceRow,
} from './ProductHeader.styles';

export type ProductHeaderProps = {
  product: Product;
  selections: CartSelection[];
};

/** What the headline reads as text, for the screen reader and for the eye. */
function priceLabel(headline: ReturnType<typeof resolveHeadlinePrice>): string {
  switch (headline.kind) {
    case 'from':
      return content.fromPrice(headline.value);
    case 'variant':
      return content.variantPrice(headline.variantLabel, headline.value);
    default:
      return formatKwanza(headline.value);
  }
}

/**
 * `Título e preço` — boards 03, 04, 05 and 06.
 *
 * Order matters and differs from the screen this replaces: name, then the
 * green price, then the description. The board puts the number second
 * because it is the second thing a customer needs, before the prose.
 */
export function ProductHeader({ product, selections }: ProductHeaderProps) {
  const headline = resolveHeadlinePrice(product, selections);
  const unavailable = product.availability === 'unavailable';
  const customizable = (product.modifierGroups?.length ?? 0) > 0;

  // Board 07: "Nome + estado + preço". One node, so VoiceOver reads the
  // product as a product rather than as three loose strings.
  const announcement = [product.name, priceLabel(headline), customizable ? 'personalizável' : null]
    .filter(Boolean)
    .join(', ');

  return (
    <Header>
      <View accessible accessibilityRole="header" accessibilityLabel={announcement}>
        <Text variant="h1" numberOfLines={2}>
          {product.name}
        </Text>
        <PriceRow>
          <Price>{priceLabel(headline)}</Price>
          {headline.kind === 'offer' ? (
            <PreviousPrice>{formatKwanza(headline.previous)}</PreviousPrice>
          ) : null}
        </PriceRow>
      </View>

      <Description>{product.description}</Description>

      {product.attributes?.length ? (
        <Attributes>
          {product.attributes.map((attribute) => (
            <Attribute key={attribute.id}>
              {attribute.icon ? (
                <Icon
                  name={attribute.icon.name}
                  sf={attribute.icon.sf}
                  size={13}
                  color={attribute.tone === 'positive' ? 'success' : 'muted'}
                />
              ) : null}
              <AttributeValue positive={attribute.tone === 'positive'}>
                {attribute.value}
              </AttributeValue>
            </Attribute>
          ))}
        </Attributes>
      ) : null}

      {unavailable || headline.kind === 'offer' ? (
        <Notices>
          {unavailable ? (
            <>
              <ProductNotice tone="unavailable" icon={{ name: 'time-outline', sf: 'clock' }}>
                {content.unavailableBadge}
              </ProductNotice>
              {product.unavailableNote ? (
                <Meta>
                  <Attribute>
                    <Icon name="time-outline" sf="clock" size={13} color="muted" />
                    <AttributeValue positive={false}>{product.unavailableNote}</AttributeValue>
                  </Attribute>
                </Meta>
              ) : null}
              {/*
                The board keeps the product on screen rather than hiding it,
                and says why — an item that vanishes reads as one that was
                never there.
              */}
              <Explainer>{content.unavailableExplainer}</Explainer>
            </>
          ) : null}

          {headline.kind === 'offer' ? (
            <ProductNotice tone="warning" icon={{ name: 'sparkles-outline', sf: 'sparkles' }}>
              {content.savings(headline.savings)}
            </ProductNotice>
          ) : null}
        </Notices>
      ) : null}
    </Header>
  );
}
