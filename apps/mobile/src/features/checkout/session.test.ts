import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CHECKOUT_SESSION_KEY,
  clearSession,
  loadSession,
  saveSession,
  type CheckoutSession,
} from './session';

const session: CheckoutSession = {
  merchantId: 'r4',
  lines: [{ lineId: 'a', productId: 'r4-1', quantity: 1, unitPrice: 5500 }],
  promoCode: 'COMETA1500',
  addressId: 'home',
  phone: '+244 923 456 789',
  instructions: 'Ligar ao chegar.',
  paymentMethodId: 'cash',
  savedAt: 1700000000000,
};

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('saveSession / loadSession', () => {
  /** Board 19 · 04 lists exactly what has to survive an interruption. */
  it('round-trips everything the board says must survive', async () => {
    await saveSession(session);
    expect(await loadSession()).toEqual(session);
  });

  it('returns null when nothing was saved', async () => {
    expect(await loadSession()).toBeNull();
  });

  it('clears what was saved', async () => {
    await saveSession(session);
    await clearSession();
    expect(await loadSession()).toBeNull();
  });

  /**
   * A restore that throws would lose a cart the customer still has. Storage
   * failures degrade to "no saved session" rather than to a crash.
   */
  it('survives a storage read failure', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('disk is gone'));
    expect(await loadSession()).toBeNull();
  });

  it('survives a storage write failure without rejecting', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('disk is full'));
    await expect(saveSession(session)).resolves.toBeUndefined();
  });

  /** A payload written by an older build must not crash this one. */
  it('discards a payload it cannot parse', async () => {
    await AsyncStorage.setItem(CHECKOUT_SESSION_KEY, '{ not json');
    expect(await loadSession()).toBeNull();
  });

  it('discards a payload that is missing its merchant', async () => {
    await AsyncStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify({ lines: [] }));
    expect(await loadSession()).toBeNull();
  });
});
