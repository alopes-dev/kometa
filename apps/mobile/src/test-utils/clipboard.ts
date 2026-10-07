/**
 * A faithful stand-in for `expo-clipboard` in tests.
 *
 * Jest's automock returns `undefined`, which breaks the `await` and the
 * `.catch()` that call sites use — the real `setStringAsync` returns a promise
 * resolving to a boolean. Mocking it that way would fail for a reason the
 * production code does not have.
 */
export const setStringAsync = jest.fn(() => Promise.resolve(true));
export const getStringAsync = jest.fn(() => Promise.resolve(''));
