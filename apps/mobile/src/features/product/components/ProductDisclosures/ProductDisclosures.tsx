import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@/components/design-system/atoms';
import type { ProductDisclosure } from '../../types';
import { Body, Label, List, Row, Summary } from './ProductDisclosures.styles';

export type ProductDisclosuresProps = {
  disclosures: ProductDisclosure[];
};

/** Progressive disclosure — board 06. */
export function ProductDisclosures({ disclosures }: ProductDisclosuresProps) {
  /*
   * A set, not a single open id: the board asks that expanding preserve the
   * reading point, and an accordion that closes the previous section moves
   * the page under the reader's finger.
   */
  const [openIds, setOpenIds] = useState<string[]>([]);

  if (disclosures.length === 0) return null;

  const toggle = (id: string) =>
    setOpenIds((current) =>
      current.includes(id) ? current.filter((candidate) => candidate !== id) : [...current, id]
    );

  return (
    <List>
      {disclosures.map((disclosure) => {
        const expanded = openIds.includes(disclosure.id);
        const announcement = disclosure.summary
          ? `${disclosure.label}, ${disclosure.summary}`
          : disclosure.label;

        return (
          <View key={disclosure.id}>
            <Pressable
              onPress={() => toggle(disclosure.id)}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              accessibilityLabel={announcement}
            >
              {/* The whole line is the target, not the chevron. */}
              <Row>
                <Label>{disclosure.label}</Label>
                {disclosure.summary ? <Summary>{disclosure.summary}</Summary> : null}
                <Icon
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  sf={expanded ? 'chevron.up' : 'chevron.down'}
                  size={14}
                  color="muted"
                />
              </Row>
            </Pressable>
            {expanded ? <Body>{disclosure.body}</Body> : null}
          </View>
        );
      })}
    </List>
  );
}
