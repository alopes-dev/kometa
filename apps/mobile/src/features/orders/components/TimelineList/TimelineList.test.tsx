import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { buildTimeline } from '../../timeline';
import { TimelineList } from './TimelineList';

const at = (hhmm: string) => new Date(`2026-10-07T${hhmm}:00`).getTime();

const events = [
  { stage: 'confirmed' as const, occurredAt: at('18:42') },
  { stage: 'preparing' as const, occurredAt: at('18:44') },
  { stage: 'ready' as const, occurredAt: at('18:55') },
  { stage: 'assigned' as const, occurredAt: at('18:57') },
  { stage: 'picked-up' as const, occurredAt: at('19:01') },
  { stage: 'transit' as const, occurredAt: at('19:02') },
];

function renderList(failedAt?: number) {
  return render(
    <ThemeProvider>
      <TimelineList rows={buildTimeline(events, 'transit', failedAt)} />
    </ThemeProvider>
  );
}

describe('TimelineList', () => {
  it('writes each confirmed stage with the time it happened', () => {
    renderList();
    expect(screen.getByText('Pedido confirmado')).toBeTruthy();
    expect(screen.getByText('18:42')).toBeTruthy();
    expect(screen.getByText('A caminho')).toBeTruthy();
    expect(screen.getByText('19:02')).toBeTruthy();
  });

  /** Board 10, "Futuro sem promessa". */
  it('shows no time against a stage that has not happened', () => {
    renderList();
    expect(screen.getByText('Pedido entregue')).toBeTruthy();
    expect(screen.getByLabelText('Pedido entregue, a seguir')).toBeTruthy();
  });

  /**
   * Board 10, "Redundância visual": cor, texto, ícone e posição. The state
   * must reach a screen reader as a word, not only as a dot colour.
   */
  it('names each row state to a screen reader', () => {
    renderList(at('19:06'));
    expect(screen.getByLabelText('Pedido confirmado, concluído, 18:42')).toBeTruthy();
    expect(screen.getByLabelText('A caminho, estado atual, 19:02')).toBeTruthy();
    expect(screen.getByLabelText('Falha ao atualizar, erro, 19:06')).toBeTruthy();
  });

  /** A rail joins a row to the next one; the last row has nothing to join to. */
  it('draws one fewer rail than it has rows', () => {
    renderList();
    const rows = buildTimeline(events, 'transit').length;
    expect(screen.getAllByTestId('timeline-rail')).toHaveLength(rows - 1);
  });

  it('marks the failed refresh without dropping the rows above it', () => {
    renderList(at('19:06'));
    expect(screen.getByText('Falha ao atualizar')).toBeTruthy();
    expect(screen.getByText('Pedido confirmado')).toBeTruthy();
  });
});
