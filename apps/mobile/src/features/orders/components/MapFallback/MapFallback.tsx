import styled from 'styled-components/native';
import { Icon } from '@/components/design-system/atoms';
import { continuousCorners, ordersTextStyle } from '@/theme';
import { content } from '../../content';
import { StatusBanner } from '../StatusBanner';

/**
 * What stands in for the map when there is no map — board 08.
 *
 * Complete, not degraded: it states that the order is still coming and points
 * at where the state actually lives. The map is never the only source of
 * state, so losing it costs orientation and nothing else.
 */

const Area = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[12]}px;
  padding: ${({ theme }) => theme.spacing[24]}px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

const Title = styled.Text`
  ${ordersTextStyle('merchantName')}
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

const Body = styled.Text`
  ${ordersTextStyle('caption')}
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

const NoticeSlot = styled.View`
  align-self: stretch;
  border-radius: ${({ theme }) => theme.radius.md}px;
  ${continuousCorners}
`;

export type MapFallbackProps = {
  reason: 'unavailable' | 'offline';
  /**
   * Board 16's textual alternative to the map: origin, destination, stage and
   * ETA in a sentence. The map can be hidden without loss of function only if
   * something says what it would have shown.
   */
  alternative?: string;
  /**
   * Board 08: denying location never blocks tracking. It is reported as a
   * fact about what is shared, not as a failure to recover from.
   */
  locationDenied?: boolean;
};

export function MapFallback({ reason, locationDenied, alternative }: MapFallbackProps) {
  return (
    <Area
      accessible
      accessibilityLabel={`${content.mapUnavailableTitle}. ${content.mapUnavailableBody}`}
    >
      <Icon
        name={reason === 'offline' ? 'cloud-offline-outline' : 'close-circle-outline'}
        sf={reason === 'offline' ? 'wifi.slash' : 'xmark.circle'}
        size={28}
        color="secondary"
      />
      <Title accessibilityRole="header">{content.mapUnavailableTitle}</Title>
      <Body>{content.mapUnavailableBody}</Body>
      {alternative ? <Body accessibilityLabel={alternative}>{alternative}</Body> : null}

      {locationDenied ? (
        <NoticeSlot>
          <StatusBanner
            tone="info"
            title={content.locationOffTitle}
            body={content.locationOffBody}
          />
        </NoticeSlot>
      ) : null}
    </Area>
  );
}
