import { renderHook } from '@testing-library/react-native';
import { isTabBarHidden, useIsTabBarHidden } from './useIsTabBarHidden';

let mockSegments: string[] = [];

jest.mock('expo-router', () => ({
  useSegments: () => mockSegments,
}));

describe('isTabBarHidden', () => {
  it('shows the bar on the screen a tab opens on', () => {
    expect(isTabBarHidden(['(tabs)', '(home)'])).toBe(false);
  });

  it('hides the bar on a screen pushed inside a tab', () => {
    expect(isTabBarHidden(['(tabs)', '(home)', 'restaurants'])).toBe(true);
  });

  it('hides the bar however deep the screen sits', () => {
    expect(isTabBarHidden(['(tabs)', '(home)', 'checkout', 'address', 'new'])).toBe(true);
  });

  it('hides the bar on a sub page of any tab, not just home', () => {
    expect(isTabBarHidden(['(tabs)', '(orders)', '[orderId]', 'tracking'])).toBe(true);
  });

  it('keeps the bar under a sheet, which leaves the screen behind it intact', () => {
    expect(isTabBarHidden(['(tabs)', '(home)', 'product', 'sheet', '[itemId]'])).toBe(false);
  });

  it('leaves the bar alone outside the tab navigator', () => {
    expect(isTabBarHidden(['(auth)', 'phone'])).toBe(false);
  });
});

describe('useIsTabBarHidden', () => {
  it('reads the rule off the route the navigator is on', () => {
    mockSegments = ['(tabs)', '(home)', 'restaurant', '[id]'];
    expect(renderHook(() => useIsTabBarHidden()).result.current).toBe(true);

    mockSegments = ['(tabs)', '(home)'];
    expect(renderHook(() => useIsTabBarHidden()).result.current).toBe(false);
  });
});
