import type { ReactNode } from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingProvider } from './OnboardingProvider';
import { useOnboarding } from './useOnboarding';

function wrapper({ children }: { children: ReactNode }) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}

describe('useOnboarding', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts loading and resolves hasSeenOnboarding to false when nothing is stored', async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasSeenOnboarding).toBe(false);
  });

  it('resolves hasSeenOnboarding to true when already stored', async () => {
    await AsyncStorage.setItem('kometa:hasSeenOnboarding', 'true');
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasSeenOnboarding).toBe(true);
  });

  it('completeOnboarding persists the flag and updates state', async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(result.current.hasSeenOnboarding).toBe(true);
    expect(await AsyncStorage.getItem('kometa:hasSeenOnboarding')).toBe('true');
  });

  it('handles AsyncStorage.getItem failure gracefully', async () => {
    // Mock getItem to reject
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage unavailable'));

    const { result } = renderHook(() => useOnboarding(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should fall back to false instead of hanging
    expect(result.current.hasSeenOnboarding).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles AsyncStorage.setItem failure gracefully without an unhandled rejection', async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage unavailable'));

    await act(async () => {
      await result.current.completeOnboarding();
    });

    // Local state still resolves even though persistence failed.
    expect(result.current.hasSeenOnboarding).toBe(true);
  });

  it('throws when used outside an OnboardingProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useOnboarding())).toThrow(
      'useOnboarding must be used within an OnboardingProvider'
    );
    consoleError.mockRestore();
  });
});
