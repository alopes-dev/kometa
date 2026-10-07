import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { mockCourier } from '../../mockData';
import { CourierCard } from './CourierCard';
import type { CourierVisibility } from '../../types';

function renderCard(
  visibility: CourierVisibility,
  props: Partial<Parameters<typeof CourierCard>[0]> = {}
) {
  return render(
    <ThemeProvider>
      <CourierCard
        visibility={visibility}
        courier={mockCourier}
        onMessage={jest.fn()}
        onCall={jest.fn()}
        {...props}
      />
    </ThemeProvider>
  );
}

describe('CourierCard', () => {
  /** Board 18 writes "não mostrar" for these stages — not an empty card. */
  it('renders nothing at all before there is a courier to show', () => {
    const { toJSON } = renderCard('none');
    expect(toJSON()).toBeNull();
  });

  describe('searching', () => {
    it('says it is looking, without promising a person', () => {
      renderCard('searching');
      expect(screen.getByText('Courier ainda não atribuído')).toBeTruthy();
      expect(screen.getByText('Estamos a encontrar a melhor pessoa para a entrega.')).toBeTruthy();
    });

    /**
     * The whole courier is in props at this stage, and none of it may reach
     * the screen: revealing who is coming before they are assigned is a
     * privacy leak about a person who has not accepted the job.
     */
    it('leaks no identity even though it was given one', () => {
      renderCard('searching');
      expect(screen.queryByText(/João Manuel/)).toBeNull();
      expect(screen.queryByText(/ABC-12-34/)).toBeNull();
      expect(screen.queryByText(/Toyota/)).toBeNull();
    });

    it('offers no way to contact someone who has not been assigned', () => {
      renderCard('searching');
      expect(screen.queryByRole('button', { name: /Mensagem/ })).toBeNull();
      expect(screen.queryByRole('button', { name: /Ligar/ })).toBeNull();
    });
  });

  describe('identity and contact', () => {
    it('names the person, the vehicle, the plate and the rating', () => {
      renderCard('identity');
      expect(screen.getByText('João Manuel')).toBeTruthy();
      expect(screen.getByText(/Toyota Yaris/)).toBeTruthy();
      expect(screen.getByText(/ABC-12-34/)).toBeTruthy();
      expect(screen.getByText(/4,9/)).toBeTruthy();
    });

    it('offers both ways to reach them', () => {
      const onMessage = jest.fn();
      const onCall = jest.fn();
      renderCard('contact', { onMessage, onCall });
      fireEvent.press(screen.getByRole('button', { name: /Mensagem/ }));
      fireEvent.press(screen.getByRole('button', { name: /Ligar/ }));
      expect(onMessage).toHaveBeenCalledTimes(1);
      expect(onCall).toHaveBeenCalledTimes(1);
    });

    /** Board 16: the interactive area may exceed the glyph, never the reverse. */
    it('gives each action a 44pt target', () => {
      renderCard('contact');
      [/Mensagem/, /Ligar/].forEach((name) => {
        const style = screen.getByRole('button', { name }).props.style;
        const flat = Array.isArray(style) ? Object.assign({}, ...style.flat(2)) : style;
        expect(flat.minHeight).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('closed', () => {
    it('reports the delivery and withdraws contact', () => {
      renderCard('closed', { completedAt: new Date('2026-10-07T19:18:00').getTime() });
      expect(screen.getByText('Entrega concluída · 19:18')).toBeTruthy();
      expect(screen.queryByRole('button', { name: /Mensagem/ })).toBeNull();
      expect(screen.queryByRole('button', { name: /Ligar/ })).toBeNull();
    });
  });
});
