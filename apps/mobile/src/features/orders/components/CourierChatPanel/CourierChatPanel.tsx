import styled from 'styled-components/native';
import { Icon } from '@/components/design-system/atoms';
import { continuousCorners, ordersTextStyle } from '@/theme';
import { content } from '../../content';

/**
 * Board 09's chat, in the three states it draws.
 *
 * There is NO composer, in any state. This build has no backend: an input
 * that accepted a message and sent it nowhere would be the only surface in
 * the feature that lies about what it does. The conversation is shown where
 * one exists, and the two closed states explain themselves and point at the
 * alternative — which is what board 09's copy already does.
 */

const Panel = styled.View`
  gap: ${({ theme }) => theme.spacing[12]}px;
  padding: ${({ theme }) => theme.orders.metrics.cardPadding}px;
  border-radius: ${({ theme }) => theme.orders.metrics.cardRadius}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

const Head = styled.View`
  gap: 2px;
`;

const Name = styled.Text`
  ${ordersTextStyle('merchantName')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const State = styled.Text`
  ${ordersTextStyle('caption')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Bubble = styled.View<{ mine: boolean }>`
  align-self: ${({ mine }) => (mine ? 'flex-end' : 'flex-start')};
  max-width: 80%;
  padding-vertical: ${({ theme }) => theme.spacing[8]}px;
  padding-horizontal: ${({ theme }) => theme.spacing[12]}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  ${continuousCorners}
  background-color: ${({ theme, mine }) =>
    mine ? theme.colors.status.success.bg : theme.colors.background.primary};
`;

const BubbleText = styled.Text`
  ${ordersTextStyle('rowMeta')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Notice = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[8]}px;
  padding: ${({ theme }) => theme.spacing[12]}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const NoticeBody = styled.View`
  flex: 1;
  gap: 2px;
`;

const NoticeTitle = styled.Text`
  ${ordersTextStyle('eta')}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const NoticeText = styled.Text`
  ${ordersTextStyle('caption')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export type ChatMessage = {
  id: string;
  from: 'courier' | 'customer';
  text: string;
};

export type CourierChatPanelProps = {
  state: 'available' | 'unavailable' | 'closed';
  courierName: string;
  messages?: ChatMessage[];
};

const STATE_LABEL = {
  available: 'Disponível agora',
  unavailable: 'Indisponível temporariamente',
  closed: 'Conversa encerrada',
} as const;

export function CourierChatPanel({ state, courierName, messages = [] }: CourierChatPanelProps) {
  return (
    <Panel>
      <Head>
        <Name>{courierName}</Name>
        <State>{STATE_LABEL[state]}</State>
      </Head>

      {state === 'available'
        ? messages.map((message) => (
            <Bubble key={message.id} mine={message.from === 'customer'}>
              <BubbleText>{message.text}</BubbleText>
            </Bubble>
          ))
        : null}

      {state === 'unavailable' ? (
        <Notice
          accessible
          accessibilityLabel={`${content.chatUnavailableTitle}. ${content.chatUnavailableBody}`}
        >
          <Icon name="chatbubble-outline" sf="exclamationmark.bubble" size={18} color="secondary" />
          <NoticeBody>
            <NoticeTitle>{content.chatUnavailableTitle}</NoticeTitle>
            <NoticeText>{content.chatUnavailableBody}</NoticeText>
          </NoticeBody>
        </Notice>
      ) : null}

      {state === 'closed' ? (
        <Notice
          accessible
          accessibilityLabel={`${content.chatClosedTitle}. ${content.chatClosedBody}`}
        >
          <Icon name="lock-closed-outline" sf="lock" size={18} color="secondary" />
          <NoticeBody>
            <NoticeTitle>{content.chatClosedTitle}</NoticeTitle>
            <NoticeText>{content.chatClosedBody}</NoticeText>
          </NoticeBody>
        </Notice>
      ) : null}
    </Panel>
  );
}
