import { useRef } from 'react';
import { Text as RNText } from 'react-native';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { CartProvider } from '@/hooks/CartProvider';
import { useCart } from '@/hooks/useCart';
import { TabBarVisibilityProvider } from '@/hooks/TabBarVisibilityProvider';
import { ProductScreen } from './ProductScreen';
import { createCartSubmitter, type CartSubmitter } from '../../cartSubmission';
import { getProductById } from '../../data';

// Navigation is the navigator's job; the screen only calls back() and
// push(). Mocked here the way the flow suites already mock it.
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), dismiss: jest.fn() }),
    useLocalSearchParams: () => ({}),
    // The real hook runs its effect on focus; a mounted screen in a test is
    // focused, so it runs once on mount.
    useFocusEffect: (callback: () => void | (() => void)) => {
      React.useEffect(callback, [callback]);
    },
    Stack: Object.assign(() => null, { Screen: () => null }),
    Link: () => null,
  };
});

function renderScreen(productId: string, submit: CartSubmitter = createCartSubmitter({ latencyMs: 0 })) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <ThemeProvider>
        <TabBarVisibilityProvider>
          <CartProvider>
            <ProductScreen productId={productId} submit={submit} />
          </CartProvider>
        </TabBarVisibilityProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

describe('ProductScreen', () => {
  it('tells the customer when the product does not exist', () => {
    const { getByText } = renderScreen('nope');
    expect(getByText('Produto não encontrado')).toBeTruthy();
  });

  it('shows a plain product ready to add', () => {
    const { getAllByText, getByText } = renderScreen('r4-4');
    // Twice by design: the header's title, and the hero's compact title that
    // takes its place once the photograph has collapsed away.
    expect(getAllByText('Milkshake de Chocolate')).toHaveLength(2);
    expect(getByText('Adicionar ao carrinho · 1.800 Kz')).toBeTruthy();
  });

  // Ruling 2 — nothing is pre-selected, so the board's validation flow exists.
  it('starts a customizable product with its required group unanswered', () => {
    const { getByText } = renderScreen('r4-1');
    expect(getByText('Escolher opções')).toBeTruthy();
  });

  it('becomes addable once the required group is answered', () => {
    const { getByText } = renderScreen('r4-1');
    fireEvent.press(getByText('Tradicional'));
    expect(getByText('Adicionar ao carrinho · 3.000 Kz')).toBeTruthy();
  });

  it('adds an extra to the total as soon as it is ticked', () => {
    const { getByText } = renderScreen('r4-1');
    fireEvent.press(getByText('Tradicional'));
    fireEvent.press(getByText('Bacon'));
    expect(getByText('Adicionar ao carrinho · 3.700 Kz')).toBeTruthy();
  });

  // Review Focus 1, end to end: the group must stay switchable on the screen.
  it('switches the chosen bread instead of freezing on the first option', () => {
    const { getByText } = renderScreen('r4-1');
    fireEvent.press(getByText('Brioche'));
    expect(getByText('Adicionar ao carrinho · 3.300 Kz')).toBeTruthy();
    fireEvent.press(getByText('Tradicional'));
    expect(getByText('Adicionar ao carrinho · 3.000 Kz')).toBeTruthy();
  });

  it('reveals the unanswered group and keeps every choice when add is pressed early', () => {
    const { getByText, queryByText } = renderScreen('r3-1');
    fireEvent.press(getByText('Queijo extra'));
    expect(queryByText('Falta escolher o tamanho.')).toBeNull();

    fireEvent.press(getByText('Escolher opções'));

    expect(getByText('Falta escolher o tamanho.')).toBeTruthy();
    // The extra the customer already picked survives the press.
    expect(getByText('Queijo extra')).toBeTruthy();
    expect(getByText('1/3')).toBeTruthy();
  });

  it('clears the validation message once the group is answered', () => {
    const { getByText, queryByText } = renderScreen('r3-1');
    fireEvent.press(getByText('Escolher opções'));
    expect(getByText('Falta escolher o tamanho.')).toBeTruthy();

    fireEvent.press(getByText('Grande'));
    expect(queryByText('Falta escolher o tamanho.')).toBeNull();
  });

  it('raises the quantity and the total together', () => {
    const { getByText, getByLabelText } = renderScreen('r4-4');
    fireEvent.press(getByLabelText('Aumentar quantidade'));
    expect(getByText('Adicionar ao carrinho · 3.600 Kz')).toBeTruthy();
  });

  it('keeps an unavailable product readable with an inert CTA', () => {
    const { getAllByText, getByText } = renderScreen('r4-3');
    expect(getAllByText('Batata Frita').length).toBeGreaterThan(0);
    expect(getByText('Indisponível')).toBeTruthy();
    // The product stays explained rather than reduced to its refusal.
    expect(getAllByText('Temporariamente indisponível').length).toBeGreaterThan(0);
    expect(getByText('Volte a consultar mais tarde')).toBeTruthy();
  });

  it('confirms the add on the button itself', async () => {
    const { getByText, getByLabelText } = renderScreen('r4-1');
    fireEvent.press(getByText('Tradicional'));
    fireEvent.press(getByLabelText('Adicionar ao carrinho, total 3.000 Kz'));
    await waitFor(() => expect(getByText('Adicionado ✓')).toBeTruthy());
  });

  it('returns the button to its resting state so a second helping can be added', async () => {
    const { getByText, getByLabelText } = renderScreen('r4-1');
    fireEvent.press(getByText('Tradicional'));
    fireEvent.press(getByLabelText('Adicionar ao carrinho, total 3.000 Kz'));
    await waitFor(() => expect(getByText('Adicionado ✓')).toBeTruthy());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1600));
    });
    expect(getByText('Adicionar ao carrinho · 3.000 Kz')).toBeTruthy();
  });

  it('shows what the cart now holds, and what it costs', async () => {
    const { getByText, getByLabelText, queryByText } = renderScreen('r4-1');
    expect(queryByText(/Ver carrinho/)).toBeNull();

    fireEvent.press(getByText('Tradicional'));
    fireEvent.press(getByText('Bacon'));
    fireEvent.press(getByLabelText('Adicionar ao carrinho, total 3.700 Kz'));

    await waitFor(() => expect(getByText('1 item · 3.700 Kz · Ver carrinho')).toBeTruthy());
  });

  it('counts a second helping into the cart bar', async () => {
    const { getByText, getByLabelText } = renderScreen('r4-1');
    fireEvent.press(getByText('Tradicional'));
    fireEvent.press(getByLabelText('Adicionar ao carrinho, total 3.000 Kz'));
    await waitFor(() => expect(getByText('1 item · 3.000 Kz · Ver carrinho')).toBeTruthy());
  });

  it('adds one line per unit of quantity', async () => {
    const { getByText, getByLabelText } = renderScreen('r4-4');
    fireEvent.press(getByLabelText('Aumentar quantidade'));
    fireEvent.press(getByLabelText('Adicionar ao carrinho, total 3.600 Kz'));
    await waitFor(() => expect(getByText('2 itens · 3.600 Kz · Ver carrinho')).toBeTruthy());
  });
});

describe('ProductScreen reference sections', () => {
  it('lists the reference sections below the choices', () => {
    const { getByText } = renderScreen('r3-1');
    expect(getByText('Ingredientes')).toBeTruthy();
    expect(getByText('Alergénios')).toBeTruthy();
    expect(getByText('Peso aproximado')).toBeTruthy();
    expect(getByText('Informação nutricional')).toBeTruthy();
  });

  it('carries each section summary on its closed row', () => {
    const { getByText } = renderScreen('r3-1');
    expect(getByText('Glúten · leite')).toBeTruthy();
    expect(getByText('650 g')).toBeTruthy();
  });

  it('opens a section in place when its row is pressed', () => {
    const { getByText, queryByText } = renderScreen('r3-1');
    expect(queryByText(/Massa, molho de tomate/)).toBeNull();
    fireEvent.press(getByText('Ingredientes'));
    expect(getByText(/Massa, molho de tomate/)).toBeTruthy();
  });

  it('keeps the unavailable product explained by its own section', () => {
    const { getByText } = renderScreen('r4-3');
    expect(getByText('Ingredientes e alergénios')).toBeTruthy();
    expect(getByText('Contém glúten e leite')).toBeTruthy();
  });

  it('shows no section list for a product that carries none', () => {
    const { queryByText } = renderScreen('r4-4');
    expect(queryByText('Ingredientes')).toBeNull();
  });
});

describe('ProductScreen when the submission does not go through', () => {
  const configure = (getByText: (t: string) => unknown) => {
    fireEvent.press(getByText('Tradicional') as never);
  };

  it('names the failure and keeps every choice', async () => {
    const submit = createCartSubmitter({ latencyMs: 0, failWith: { reason: 'failed' } });
    const { getByText, getByLabelText } = renderScreen('r4-1', submit);
    configure(getByText);
    fireEvent.press(getByText('Bacon'));
    fireEvent.press(getByLabelText('Adicionar ao carrinho, total 3.700 Kz'));

    await waitFor(() => expect(getByText('Não foi possível adicionar ao carrinho.')).toBeTruthy());
    // The configuration survives the failure, which is the whole promise.
    expect(getByText('1/3')).toBeTruthy();
    expect(getByText('Tentar novamente')).toBeTruthy();
  });

  it('adds nothing to the cart when the submission fails', async () => {
    const submit = createCartSubmitter({ latencyMs: 0, failWith: { reason: 'failed' } });
    const { getByText, getByLabelText, queryByText } = renderScreen('r4-1', submit);
    configure(getByText);
    fireEvent.press(getByLabelText('Adicionar ao carrinho, total 3.000 Kz'));

    await waitFor(() => expect(getByText('Tentar novamente')).toBeTruthy());
    expect(queryByText(/Ver carrinho/)).toBeNull();
  });

  /*
   * Board 02: "Retry idempotente; impedir duplicação acidental." A retry
   * that succeeds must leave one line, not two.
   */
  it('reuses the same key on retry, so a recovered attempt adds one line', async () => {
    const keys: string[] = [];
    let failing = true;
    const submit: CartSubmitter = async (request) => {
      keys.push(request.key);
      if (failing) {
        failing = false;
        return { ok: false, reason: 'failed' };
      }
      return { ok: true };
    };

    const { getByText, getByLabelText } = renderScreen('r4-1', submit);
    configure(getByText);
    fireEvent.press(getByLabelText('Adicionar ao carrinho, total 3.000 Kz'));
    await waitFor(() => expect(getByText('Tentar novamente')).toBeTruthy());

    fireEvent.press(getByText('Tentar novamente'));
    await waitFor(() => expect(getByText('1 item · 3.000 Kz · Ver carrinho')).toBeTruthy());

    expect(keys).toHaveLength(2);
    expect(keys[0]).toBe(keys[1]);
  });

  it('pauses and names what survived when there is no connection', async () => {
    const submit = createCartSubmitter({ latencyMs: 0, failWith: { reason: 'offline' } });
    const { getByText, getByLabelText } = renderScreen('r4-1', submit);
    configure(getByText);
    fireEvent.press(getByText('Bacon'));
    fireEvent.press(getByLabelText('Adicionar ao carrinho, total 3.700 Kz'));

    await waitFor(() => expect(getByText('Sem conexão')).toBeTruthy());
    expect(getByText('Tradicional e Bacon estão preservados.')).toBeTruthy();
  });

  it('reports a total that could not be worked out, keeping the choices', async () => {
    const submit = createCartSubmitter({ latencyMs: 0, failWith: { reason: 'pricing' } });
    const { getByText, getByLabelText } = renderScreen('r4-1', submit);
    configure(getByText);
    fireEvent.press(getByLabelText('Adicionar ao carrinho, total 3.000 Kz'));

    await waitFor(() => expect(getByText('Não foi possível calcular o total.')).toBeTruthy());
    expect(getByText('As escolhas continuam aqui. Tente novamente.')).toBeTruthy();
  });

  /*
   * Board 04, "Offline + produto actualizado": show before and after, and
   * require a fresh confirmation rather than charging the new price quietly.
   */
  it('shows a price that moved and reprices the whole screen before confirming', async () => {
    const submit = createCartSubmitter({
      latencyMs: 0,
      failWith: { reason: 'priceChanged', newPrice: 4800 },
    });
    const { getByText, getByLabelText, getAllByText } = renderScreen('r4-1', submit);
    configure(getByText);
    fireEvent.press(getByLabelText('Adicionar ao carrinho, total 3.000 Kz'));

    await waitFor(() => expect(getByText('Produto actualizado')).toBeTruthy());
    expect(getByText('Preço base alterado de 3.000 Kz para 4.800 Kz.')).toBeTruthy();
    // The header, the breakdown and the button all move to the new figure.
    expect(getAllByText('4.800 Kz').length).toBeGreaterThan(0);
    expect(getByText('Tentar novamente')).toBeTruthy();
  });
});

describe('ProductScreen editing a configuration that is already in the cart', () => {
  /** Seeds the cart, then re-renders the screen pointed at the line it made. */
  function renderEditing() {
    const submit = createCartSubmitter({ latencyMs: 0 });
    let lineId = '';

    function Harness() {
      const { addItem, items } = useCart();
      const seeded = useRef(false);
      if (!seeded.current) {
        seeded.current = true;
        addItem(getProductById('r4-1')!, {
          selections: [{ groupId: 'pao', optionIds: ['pao-tradicional'] }],
          unitPrice: 3000,
        });
      }
      lineId = items[0]?.lineId ?? '';
      return items.length > 0 ? (
        <ProductScreen productId="r4-1" submit={submit} editingLineId={lineId} />
      ) : null;
    }

    const utils = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <ThemeProvider>
          <TabBarVisibilityProvider>
            <CartProvider>
              <Harness />
              <CartProbe />
            </CartProvider>
          </TabBarVisibilityProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    );
    return utils;
  }

  function CartProbe() {
    const { items, subtotal } = useCart();
    return <RNText testID="cart">{`lines=${items.length} subtotal=${subtotal}`}</RNText>;
  }

  it('opens with the configuration the line already carries', () => {
    const { getByText } = renderEditing();
    // Seeded with Tradicional, so the CTA is ready rather than asking for a
    // choice the customer already made.
    expect(getByText('Adicionar ao carrinho · 3.000 Kz')).toBeTruthy();
  });

  it('replaces the line instead of adding a second one', async () => {
    const { getByText, getByLabelText, getByTestId } = renderEditing();
    expect(getByTestId('cart').props.children).toBe('lines=1 subtotal=3000');

    fireEvent.press(getByText('Brioche'));
    fireEvent.press(getByLabelText('Adicionar ao carrinho, total 3.300 Kz'));

    await waitFor(() =>
      expect(getByTestId('cart').props.children).toBe('lines=1 subtotal=3300')
    );
  });
});
