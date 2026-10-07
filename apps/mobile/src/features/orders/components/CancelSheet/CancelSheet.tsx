import { useState } from 'react';
import { Pressable, View } from 'react-native';
import styled from 'styled-components/native';
import { Button, Icon } from '@/components/design-system/atoms';
import { continuousCorners, ordersTextStyle } from '@/theme';
import { content } from '../../content';

/**
 * Board 14's cancellation sheet.
 *
 * The impact slot sits ABOVE the destructive button, deliberately and
 * structurally: board 14 requires a fee or an impossibility to be known
 * before the decision, and a notice under the button is one the customer
 * reads after deciding to pay it.
 */

const Sheet = styled.View`
  gap: ${({ theme }) => theme.spacing[16]}px;
  padding: ${({ theme }) => theme.spacing[24]}px;
  border-top-left-radius: ${({ theme }) => theme.radius.xl}px;
  border-top-right-radius: ${({ theme }) => theme.radius.xl}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const Title = styled.Text`
  ${ordersTextStyle('statusTitle')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Body = styled.Text`
  ${ordersTextStyle('rowMeta')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Reasons = styled.View`
  gap: ${({ theme }) => theme.spacing[8]}px;
`;

const Reason = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[12]}px;
  min-height: ${({ theme }) => theme.orders.metrics.touchTarget}px;
`;

const Dot = styled.View<{ selected: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 11px;
  align-items: center;
  justify-content: center;
  border-width: ${({ selected }) => (selected ? 0 : 2)}px;
  border-color: ${({ theme }) => theme.colors.border.subtle};
  background-color: ${({ theme, selected }) =>
    selected ? theme.colors.brand.base : 'transparent'};
`;

const ReasonLabel = styled.Text`
  ${ordersTextStyle('timelineLabel')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Impact = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[8]}px;
  padding: ${({ theme }) => theme.spacing[12]}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.status.warning.bg};
`;

const ImpactText = styled.Text`
  ${ordersTextStyle('caption')}
  flex: 1;
  color: ${({ theme }) => theme.colors.status.warning.fg};
`;

const Destructive = styled.View`
  min-height: 52px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.full}px;
  ${continuousCorners}
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.status.error.fg};
  background-color: ${({ theme }) => theme.colors.status.error.bg};
`;

const DestructiveLabel = styled.Text`
  ${ordersTextStyle('eta')}
  color: ${({ theme }) => theme.colors.status.error.fg};
`;

export type CancelSheetProps = {
  onConfirm: (reason: string) => void;
  onKeep: () => void;
  /** A fee or an impossibility. Rendered above the destructive button. */
  impact?: string;
};

export function CancelSheet({ onConfirm, onKeep, impact }: CancelSheetProps) {
  const [reason, setReason] = useState(content.cancelReasons[0]);

  return (
    <Sheet>
      <View style={{ gap: 4 }}>
        <Title>{content.cancelPrompt}</Title>
        <Body>{content.cancelBody}</Body>
      </View>

      <Reasons>
        {content.cancelReasons.map((entry) => {
          const selected = entry === reason;
          return (
            <Pressable
              key={entry}
              onPress={() => setReason(entry)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Reason>
                <Dot selected={selected}>
                  {selected ? (
                    <Icon name="checkmark" sf="checkmark" size={12} color="onBrand" />
                  ) : null}
                </Dot>
                <ReasonLabel>{entry}</ReasonLabel>
              </Reason>
            </Pressable>
          );
        })}
      </Reasons>

      {impact ? (
        <Impact testID="cancel-impact">
          <Icon
            name="alert-circle-outline"
            sf="exclamationmark.triangle"
            size={18}
            color="warning"
          />
          <ImpactText>{impact}</ImpactText>
        </Impact>
      ) : null}

      <Pressable
        onPress={() => onConfirm(reason)}
        accessibilityRole="button"
        accessibilityLabel={content.confirmCancel}
      >
        <Destructive>
          <DestructiveLabel>{content.confirmCancel}</DestructiveLabel>
        </Destructive>
      </Pressable>

      <Button variant="outline" size="lg" shape="pill" onPress={onKeep}>
        {content.keepOrder}
      </Button>
    </Sheet>
  );
}
