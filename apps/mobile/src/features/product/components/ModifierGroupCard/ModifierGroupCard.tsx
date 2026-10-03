import { View } from 'react-native';
import { Icon, Text } from '@/components/design-system/atoms';
import type { CartSelection } from '@/hooks/CartProvider';
import { content } from '../../content';
import type { ModifierGroup } from '../../types';
import { isRadioGroup, selectedCount } from '../../validation';
import { ModifierOptionRow } from '../ModifierOptionRow';
import {
  Card,
  Counter,
  ErrorRow,
  ErrorText,
  Header,
  Heading,
  Options,
  Subtitle,
} from './ModifierGroupCard.styles';

export type ModifierGroupCardProps = {
  group: ModifierGroup;
  selection: CartSelection | undefined;
  onToggle: (optionId: string) => void;
  /** Set once the customer has asked to add with this group still unanswered. */
  showError?: boolean;
  onLayout?: (y: number) => void;
};

/** One modifier group — board 02, `Customization · escolhas`. */
export function ModifierGroupCard({
  group,
  selection,
  onToggle,
  showError = false,
  onLayout,
}: ModifierGroupCardProps) {
  const count = selectedCount(selection);

  // The counter belongs to groups with a cap to count against. A required
  // single choice has none — "1/1" beside a radio reads as a rule rather
  // than a state, which is the board's reason for leaving it out.
  const showCounter = !isRadioGroup(group);

  return (
    <Card hasError={showError} onLayout={(event) => onLayout?.(event.nativeEvent.layout.y)}>
      {/*
        One accessibility node for the heading, so the group is announced
        before its options rather than as two unrelated strings.
      */}
      <Header
        accessible
        accessibilityRole="header"
        accessibilityLabel={content.groupAnnouncement(group, count)}
      >
        <Heading>
          <Text variant="h5">{group.label}</Text>
          <Subtitle>{content.groupSubtitle(group)}</Subtitle>
        </Heading>
        {showCounter ? <Counter>{content.groupCounter(count, group.maxSelections)}</Counter> : null}
      </Header>

      <Options>
        {group.options.map((option) => (
          <ModifierOptionRow
            key={option.id}
            group={group}
            option={option}
            selection={selection}
            onToggle={onToggle}
          />
        ))}
      </Options>

      {showError ? (
        <ErrorRow>
          <Icon name="information-circle-outline" sf="info.circle" size={14} color="brand" />
          <ErrorText>{content.missingChoice(group)}</ErrorText>
        </ErrorRow>
      ) : null}
    </Card>
  );
}
