import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      // Only when it differs from the default we already hold. Writing the
      // same value back is a no-op re-render that lands after a synchronous
      // test has finished asserting, which React reports as an update
      // outside act() in whichever suite happens to render slowly enough.
      if (mounted && value) setReduced(true);
    });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}
