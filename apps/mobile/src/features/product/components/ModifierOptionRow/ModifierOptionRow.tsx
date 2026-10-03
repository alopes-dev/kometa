import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Checkbox, Radio } from '@/components/design-system/atoms';
import type { CartSelection } from '@/hooks/CartProvider';
import { content } from '../../content';
import type { ModifierGroup, ModifierOption } from '../../types';
import { isOptionSelectable, isRadioGroup, resolveGroupStatus } from '../../validation';
import { Control, Cost, Label, Labels, Note, Row } from './ModifierOptionRow.styles';

export type ModifierOptionRowProps = {
  group: ModifierGroup;
  option: ModifierOption;
  selection: CartSelection | undefined;
  onToggle: (optionId: string) => void;
};

/** One option inside a group card — board 02, `Customization · escolhas`. */
export function ModifierOptionRow({ group, option, selection, onToggle }: ModifierOptionRowProps) {
  const selected = selection?.optionIds.includes(option.id) ?? false;
  const selectable = isOptionSelectable(group, selection, option);
  const radio = isRadioGroup(group);

  // Two different reasons a row is blocked, and the board words them apart:
  // the option itself is off today, or the group has no room left. Saying
  // "Limite atingido" on a sold-out item would be a lie the customer could
  // act on by deselecting something else.
  const note =
    option.available === false
      ? option.unavailableNote
      : !selectable && resolveGroupStatus(group, selection) === 'full'
        ? content.limitReached
        : undefined;

  const handlePress = () => {
    if (!selectable) return;
    // Light feedback on selection, never required for comprehension (board 07).
    Haptics.selectionAsync().catch(() => {});
    onToggle(option.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!selectable}
      accessibilityRole={radio ? 'radio' : 'checkbox'}
      accessibilityState={{ checked: selected, disabled: !selectable }}
      accessibilityLabel={content.optionAnnouncement(option, group.pricing, note)}
    >
      <Row dimmed={!selectable && !selected}>
        {/*
          The atom draws the control and nothing else. It renders its own
          Pressable with its own role, so it is muted twice over:
          `pointerEvents` keeps the press on the row, and hiding its
          descendants keeps VoiceOver from finding a second checkbox inside
          the one it just announced. Muting only the touches leaves the
          screen reader seeing two controls per option.
        */}
        <Control
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {radio ? <Radio selected={selected} /> : <Checkbox checked={selected} />}
        </Control>
        <Labels>
          <Label numberOfLines={1}>{option.label}</Label>
          {note ? <Note>{note}</Note> : null}
        </Labels>
        {option.price > 0 ? <Cost>{content.optionCost(option.price, group.pricing)}</Cost> : null}
      </Row>
    </Pressable>
  );
}
