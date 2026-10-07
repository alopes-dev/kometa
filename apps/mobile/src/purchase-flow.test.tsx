import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/components/design-system/ThemeProvider';
import { CartProvider } from '@/hooks/CartProvider';
import { CheckoutFlowProvider } from '@/hooks/CheckoutFlowProvider';
import { OrdersProvider } from '@/hooks/OrdersProvider';
import { TabBarVisibilityProvider } from '@/hooks/TabBarVisibilityProvider';

/**
 * Every screen on the purchase path mounts.
 *
 * These routes were deleted wholesale in `3dba3d2` while the components and
 * providers they drive were left in the tree, so nothing caught that the path
 * from a restaurant to a placed order had no screens at all. This suite is the
 * guard against that recurring: it renders each route module the way the
 * navigator does — inside the same provider stack, with the params its
 * `useLocalSearchParams` call expects — and fails if any of them throws.
 *
 * It asserts mounting, not layout. Per-component appearance is covered by the
 * suites next to those components.
 */

// Route modules read params and navigate; both are the navigator's job, so
// they are stubbed here rather than mounting a real one.
const params: Record<string, string> = {};

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      dismiss: jest.fn(),
    }),
    useLocalSearchParams: () => params,
    // The real hook runs its effect when the screen gains focus; a mounted
    // screen in a test is focused, so it runs once on mount.
    useFocusEffect: (callback: () => void | (() => void)) => {
      React.useEffect(callback, [callback]);
    },
    Stack: Object.assign(() => null, { Screen: () => null }),
    Link: () => null,
  };
});

/**
 * `@gorhom/bottom-sheet`'s scrollable registers Reanimated scroll handlers
 * that `setUpTests()` rejects as non-worklets, because the worklet Babel
 * plugin does not transform inside `node_modules`. Reporting the module
 * unavailable makes Live Tracking render the plain, non-draggable panel it
 * already falls back to when the dev client was built without the native
 * module — a configuration the screen genuinely supports. The draggable
 * sheet itself is consequently not covered here.
 */
jest.mock('@/features/tracking/bottomSheet', () => ({
  isBottomSheetAvailable: false,
  BottomSheet: () => null,
  BottomSheetScrollView: () => null,
}));

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
        <TabBarVisibilityProvider>
          <CartProvider>
            <CheckoutFlowProvider>
              <OrdersProvider>{children}</OrdersProvider>
            </CheckoutFlowProvider>
          </CartProvider>
        </TabBarVisibilityProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

function mount(ui: ReactElement) {
  return render(<Providers>{ui}</Providers>);
}

function setParams(next: Record<string, string>) {
  for (const key of Object.keys(params)) delete params[key];
  Object.assign(params, next);
}

/**
 * The path in the order a customer walks it, each entry with the params the
 * screen before it passes along. `r4` is Burger House and `r4-1` one of the
 * two items carrying modifier groups, so the product screen renders its
 * selector rather than the plain variant.
 */
const SCREENS: {
  name: string;
  params?: Record<string, string>;
  load: () => { default: React.ComponentType };
}[] = [
  { name: 'home', load: () => require('./app/(tabs)/(home)/index') },
  { name: 'restaurants', load: () => require('./app/(tabs)/(home)/restaurants') },
  { name: 'offers', load: () => require('./app/(tabs)/(home)/offers') },
  { name: 'notifications', load: () => require('./app/(tabs)/(home)/notifications') },
  {
    name: 'restaurant detail',
    params: { id: 'r4' },
    load: () => require('./app/(tabs)/(home)/restaurant/[id]'),
  },
  {
    name: 'product detail',
    params: { itemId: 'r4-1' },
    load: () => require('./app/(tabs)/(home)/product/[itemId]'),
  },
  { name: 'cart', load: () => require('./app/(tabs)/(home)/cart/index') },
  { name: 'promotion', load: () => require('./app/(tabs)/(home)/cart/promo') },
  { name: 'delivery address', load: () => require('./app/(tabs)/(home)/checkout/address/index') },
  { name: 'new address', load: () => require('./app/(tabs)/(home)/checkout/address/new') },
  {
    name: 'delivery instructions',
    load: () => require('./app/(tabs)/(home)/checkout/instructions'),
  },
  { name: 'payment', load: () => require('./app/(tabs)/(home)/checkout/payment') },
  { name: 'order review', load: () => require('./app/(tabs)/(home)/checkout/review') },
  { name: 'checkout status', load: () => require('./app/(tabs)/(home)/checkout/status') },
  {
    name: 'order tracking',
    params: {
      restaurantId: 'r4',
      itemCount: '2',
      total: '7800',
      deliverySummary: 'Entrega · Agora',
      paymentSummary: 'Multicaixa Express',
    },
    load: () => require('./app/(tabs)/(home)/order-tracking'),
  },
  {
    name: 'live tracking',
    params: {
      restaurantId: 'r4',
      itemCount: '2',
      total: '7800',
      deliverySummary: 'Entrega · Agora',
      paymentSummary: 'Multicaixa Express',
    },
    load: () => require('./app/(tabs)/(home)/live-tracking'),
  },
  {
    name: 'delivered',
    params: { restaurantId: 'r4', itemCount: '2', total: '7800' },
    load: () => require('./app/(tabs)/(home)/delivered'),
  },
  {
    name: 'rating',
    params: { restaurantId: 'r4' },
    load: () => require('./app/(tabs)/(home)/rating'),
  },
];

describe('purchase path', () => {
  it.each(SCREENS)('$name mounts', ({ params: screenParams, load }) => {
    setParams(screenParams ?? {});
    const Screen = load().default;
    expect(() => mount(<Screen />)).not.toThrow();
  });
});

/**
 * The business board (frame 48:20601) draws the green add button on every
 * product it shows — the cross-listed ones under "Mais pedidos" included, and
 * regardless of whether the dish has choices to make. A dish the customer
 * cannot act on from the menu is a dish the board does not have.
 */
describe('restaurant detail', () => {
  it('offers every product an add control', () => {
    setParams({ id: 'r4' });
    const Screen = require('./app/(tabs)/(home)/restaurant/[id]').default;
    const { getAllByLabelText } = mount(<Screen />);

    const { getMenuItems } = require('./features/home/data');
    const { buildMenuSections } = require('./features/home/selectors');
    const rendered: { name: string }[] = buildMenuSections(getMenuItems('r4')).flatMap(
      (section: { data: { name: string }[] }) => section.data
    );

    // Counted per dish rather than in total: "Mais pedidos" cross-lists its
    // items, so a dish that appears in two sections owes two buttons.
    const expected = new Map<string, number>();
    for (const item of rendered) expected.set(item.name, (expected.get(item.name) ?? 0) + 1);

    for (const [name, count] of expected) {
      expect(getAllByLabelText(`Adicionar ${name}`)).toHaveLength(count);
    }
  });
});
