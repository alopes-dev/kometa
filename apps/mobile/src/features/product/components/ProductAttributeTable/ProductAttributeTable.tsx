import type { ProductAttribute } from '../../types';
import { Label, Panel, Row, Value } from './ProductAttributeTable.styles';

export type ProductAttributeTableProps = {
  attributes: ProductAttribute[];
};

/** The labelled attribute panel — board 06's health layout. */
export function ProductAttributeTable({ attributes }: ProductAttributeTableProps) {
  if (attributes.length === 0) return null;

  return (
    <Panel>
      {attributes.map((attribute, index) => (
        <Row
          key={attribute.id}
          last={index === attributes.length - 1}
          accessible
          accessibilityRole="text"
          accessibilityLabel={`${attribute.label}: ${attribute.value}`}
        >
          <Label>{attribute.label}</Label>
          <Value positive={attribute.tone === 'positive'}>{attribute.value}</Value>
        </Row>
      ))}
    </Panel>
  );
}
