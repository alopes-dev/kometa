import { Pressable } from 'react-native';
import { Icon } from '@/components/design-system/atoms';
import { formatRating } from '@/features/home/format';
import { content } from '../../content';
import { formatEta } from '../../eta';
import type { Courier, CourierVisibility } from '../../types';
import {
  ActionInner,
  ActionLabel,
  Actions,
  Card,
  Head,
  Info,
  Meta,
  Name,
  Portrait,
  Rating,
} from './CourierCard.styles';

/**
 * Board 09's courier, in the four shapes board 18's third column allows.
 *
 * Visibility is a prop rather than something this component derives, so one
 * rule — `courierVisibility(stage)` — decides it for every screen. Identity
 * is withheld until `identity`: showing who is coming before they have
 * accepted the job exposes a person who has not agreed to be seen, and
 * contact is withheld until `contact` because an unassigned courier cannot
 * answer.
 */

/** Board 16's minimum, read from the board's own metrics. */
const TARGET = 44;

export type CourierCardProps = {
  visibility: CourierVisibility;
  courier?: Courier;
  onMessage?: () => void;
  onCall?: () => void;
  /** When the delivery finished — only read in the `closed` shape. */
  completedAt?: number;
};

export function CourierCard({
  visibility,
  courier,
  onMessage,
  onCall,
  completedAt,
}: CourierCardProps) {
  // Board 18 writes "não mostrar" for these stages. An empty card would still
  // occupy the layout and imply something is coming.
  if (visibility === 'none') return null;

  if (visibility === 'searching') {
    return (
      <Card
        accessible
        accessibilityLabel={`${content.courierSearchingTitle}. ${content.courierSearchingBody}`}
      >
        <Head>
          <Portrait>
            <Icon name="person-outline" sf="person.fill.questionmark" size={20} color="success" />
          </Portrait>
          <Info>
            <Name>{content.courierSearchingTitle}</Name>
            <Meta>{content.courierSearchingBody}</Meta>
          </Info>
        </Head>
      </Card>
    );
  }

  if (!courier) return null;

  const closed = visibility === 'closed';
  const meta = closed
    ? content.courierDone(
        completedAt === undefined ? '' : formatEta({ kind: 'time', at: completedAt })
      )
    : `${courier.vehicle} · ${courier.plate}`;

  return (
    <Card accessible accessibilityLabel={content.courierLabel(courier)}>
      <Head>
        <Portrait>
          <Icon name="person-outline" sf="person.fill" size={20} color="success" />
        </Portrait>
        <Info>
          <Name>{courier.name}</Name>
          <Meta>{meta}</Meta>
          <Rating>★ {formatRating(courier.rating)}</Rating>
        </Info>
      </Head>

      {closed ? null : (
        <Actions>
          <Action
            label={content.message}
            icon="chatbubble-outline"
            sf="message"
            onPress={onMessage}
          />
          <Action label={content.call} icon="call-outline" sf="phone" onPress={onCall} />
        </Actions>
      )}
    </Card>
  );
}

function Action({
  label,
  icon,
  sf,
  onPress,
}: {
  label: string;
  icon: 'chatbubble-outline' | 'call-outline';
  sf: 'message' | 'phone';
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ flex: 1, minHeight: TARGET }}
    >
      <ActionInner>
        <Icon name={icon} sf={sf} size={16} color="primary" />
        <ActionLabel>{label}</ActionLabel>
      </ActionInner>
    </Pressable>
  );
}
