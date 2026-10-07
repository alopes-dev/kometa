import { View } from 'react-native';
import styled from 'styled-components/native';
import type { DefaultTheme } from 'styled-components/native';
import { Icon } from '@/components/design-system/atoms';
import { ordersTextStyle } from '@/theme';
import { formatEta } from '../../eta';
import type { TimelineRow, TimelineRowState } from '../../timeline';

/**
 * Board 10's `Progresso do pedido`.
 *
 * Four row states, each carrying its state as a word in the accessible label
 * as well as in the dot: board 10's "Redundância visual" says colour, text,
 * icon and position all communicate state, never colour alone. An upcoming
 * row has no timestamp — rendering a predicted one would be a promise.
 */

const STATE_WORD: Record<TimelineRowState, string> = {
  completed: 'concluído',
  current: 'estado atual',
  upcoming: 'a seguir',
  error: 'erro',
};

const dotColor = (theme: DefaultTheme, state: TimelineRowState) => {
  if (state === 'error') return theme.colors.status.error.fill;
  if (state === 'upcoming') return theme.colors.border.subtle;
  return theme.colors.brand.base;
};

const Row = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[12]}px;
`;

const Gutter = styled.View`
  align-items: center;
  width: ${({ theme }) => theme.orders.metrics.timelineDot}px;
`;

const Dot = styled.View<{ state: TimelineRowState }>`
  width: ${({ theme }) => theme.orders.metrics.timelineDot}px;
  height: ${({ theme }) => theme.orders.metrics.timelineDot}px;
  border-radius: ${({ theme }) => theme.orders.metrics.timelineDot / 2}px;
  /* Current is a ring, completed is filled, upcoming is hollow and grey —
     the three are distinguishable without reading the colour. */
  border-width: ${({ state }) => (state === 'current' ? 3 : 0)}px;
  border-color: ${({ theme, state }) => dotColor(theme, state)};
  background-color: ${({ theme, state }) =>
    state === 'current' ? theme.colors.background.primary : dotColor(theme, state)};
`;

const Rail = styled.View`
  flex: 1;
  width: ${({ theme }) => theme.orders.metrics.timelineRail}px;
  min-height: ${({ theme }) => theme.orders.metrics.timelineRowGap}px;
  background-color: ${({ theme }) => theme.colors.border.subtle};
`;

const Body = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[8]}px;
  padding-bottom: ${({ theme }) => theme.orders.metrics.timelineRowGap}px;
`;

const Label = styled.Text<{ state: TimelineRowState }>`
  ${ordersTextStyle('timelineLabel')}
  flex: 1;
  color: ${({ theme, state }) =>
    state === 'upcoming'
      ? theme.colors.text.muted
      : state === 'error'
        ? theme.colors.status.error.fg
        : theme.colors.text.primary};
`;

const Time = styled.Text`
  ${ordersTextStyle('timelineTime')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export type TimelineListProps = {
  rows: TimelineRow[];
};

export function TimelineList({ rows }: TimelineListProps) {
  return (
    <View>
      {rows.map((row, index) => {
        const clock =
          row.occurredAt === undefined ? '' : formatEta({ kind: 'time', at: row.occurredAt });
        const label =
          clock === ''
            ? `${row.label}, ${STATE_WORD[row.state]}`
            : `${row.label}, ${STATE_WORD[row.state]}, ${clock}`;

        return (
          <Row key={`${row.stage}-${row.state}-${index}`} accessible accessibilityLabel={label}>
            <Gutter>
              <Dot state={row.state} />
              {index < rows.length - 1 ? <Rail testID="timeline-rail" /> : null}
            </Gutter>
            <Body>
              <Label state={row.state}>{row.label}</Label>
              {clock === '' ? null : <Time>{clock}</Time>}
              {row.state === 'error' ? (
                <Icon name="refresh-outline" sf="arrow.clockwise" size={14} color="error" />
              ) : null}
            </Body>
          </Row>
        );
      })}
    </View>
  );
}
