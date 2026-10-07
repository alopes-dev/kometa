import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import styled from 'styled-components/native';
import { Icon } from '@/components/design-system/atoms';
import { continuousCorners, ordersTextStyle } from '@/theme';
import { content } from '../../content';

/**
 * `#CM-10482` with board 03's `Copiar` action.
 *
 * The hash is presentation: the stored id has none, and what lands on the
 * clipboard is the id itself, because a customer pasting it into a support
 * chat wants the reference, not the decoration.
 *
 * The tap is acknowledged in the label rather than with a toast — board 03
 * gives the component no overlay, and a copy that looks like nothing happened
 * gets tapped again.
 */
const CONFIRMATION_MS = 1600;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[8]}px;
`;

const Value = styled.Text`
  ${ordersTextStyle('orderNumber')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Action = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[6]}px;
  /* Board 16: the glyph may be smaller than the target, never the reverse. */
  min-height: ${({ theme }) => theme.orders.metrics.touchTarget}px;
  padding-horizontal: ${({ theme }) => theme.spacing[8]}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  ${continuousCorners}
`;

const ActionLabel = styled.Text`
  ${ordersTextStyle('chip')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

export type OrderNumberProps = {
  orderId: string;
};

export function OrderNumber({ orderId }: OrderNumberProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(() => {
    Clipboard.setStringAsync(orderId).catch(() => {
      // A clipboard the platform refused is not worth an error state; the
      // number is on screen and can be read.
    });
    Haptics.selectionAsync().catch(() => {});
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), CONFIRMATION_MS);
  }, [orderId]);

  return (
    <Row>
      <Value>#{orderId}</Value>
      <Pressable
        onPress={copy}
        accessibilityRole="button"
        accessibilityLabel="Copiar número do pedido"
        hitSlop={8}
      >
        <Action>
          <View testID="order-number-copy-icon">
            <Icon
              name={copied ? 'checkmark-outline' : 'copy-outline'}
              sf={copied ? 'checkmark' : 'doc.on.doc'}
              size={14}
              color={copied ? 'success' : 'secondary'}
            />
          </View>
          <ActionLabel>{copied ? 'Copiado' : content.copy}</ActionLabel>
        </Action>
      </Pressable>
    </Row>
  );
}
