import { render, screen, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { RatingScreen } from './RatingScreen';

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderRating(onSubmit = jest.fn()) {
  render(
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <ThemeProvider>
        <RatingScreen
          merchantName="Burger House"
          courierName="João Manuel"
          onBack={jest.fn()}
          onSubmit={onSubmit}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
  return onSubmit;
}

describe('RatingScreen', () => {
  it('asks the question and says who the answer helps', () => {
    renderRating();
    expect(screen.getByText('Como correu o teu pedido?')).toBeTruthy();
    expect(screen.getByText('O teu feedback ajuda a Burger House e o João Manuel.')).toBeTruthy();
  });

  it('offers the four tags the board draws', () => {
    renderRating();
    ['Chegou quente', 'Entrega cuidadosa', 'Muito saboroso', 'Bom atendimento'].forEach((tag) =>
      expect(screen.getByText(tag)).toBeTruthy()
    );
  });

  it('sends the stars, the chosen tags and the comment', () => {
    const onSubmit = renderRating();
    fireEvent(screen.getByLabelText('Avaliação'), 'onChange', 4);
    fireEvent.press(screen.getByText('Chegou quente'));
    fireEvent.changeText(screen.getByPlaceholderText(/Queres acrescentar algo/), 'Tudo certo.');
    fireEvent.press(screen.getByRole('button', { name: /Enviar avaliação/ }));

    expect(onSubmit).toHaveBeenCalledWith({
      stars: 4,
      tags: ['Chegou quente'],
      comment: 'Tudo certo.',
    });
  });

  /**
   * Board 11, "Feedback humano": "Não força gorjeta, texto ou avaliação do
   * courier separada." Each of those is a thing this screen must NOT have.
   */
  it('asks for no tip and rates no courier separately', () => {
    renderRating();
    expect(screen.queryByText(/gorjeta/i)).toBeNull();
    expect(screen.queryByText(/Avaliar o courier/i)).toBeNull();
    expect(screen.getAllByLabelText('Avaliação')).toHaveLength(1);
  });

  it('does not require a comment', () => {
    const onSubmit = renderRating();
    fireEvent(screen.getByLabelText('Avaliação'), 'onChange', 5);
    fireEvent.press(screen.getByRole('button', { name: /Enviar avaliação/ }));
    expect(onSubmit).toHaveBeenCalledWith({ stars: 5, tags: [], comment: '' });
  });
});
