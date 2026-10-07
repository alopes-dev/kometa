import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "@/components/SafeGestureHandlerRootView";
import styled, { useTheme } from "styled-components/native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Urbanist_400Regular,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  Urbanist_800ExtraBold,
} from "@expo-google-fonts/urbanist";
import {
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { ThemeProvider } from "@/components/design-system/ThemeProvider";
import { AuthProvider } from "@/hooks/AuthProvider";
import { useAuth } from "@/hooks/useAuth";
import { OnboardingProvider } from "@/hooks/OnboardingProvider";
import { useOnboarding } from "@/hooks/useOnboarding";
import { SetupProvider } from "@/hooks/SetupProvider";
import { useSetup } from "@/hooks/useSetup";
import { BrandSplash } from "@/features/onboarding";
import { CartProvider } from "@/hooks/CartProvider";
import { CheckoutFlowProvider } from "@/hooks/CheckoutFlowProvider";
import { OrdersProvider } from "@/hooks/OrdersProvider";

const Root = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore — the splash may have already hidden if a prior boot failed.
});

function Navigation({
  hasSeenOnboarding,
  hasCompletedSetup,
}: {
  hasSeenOnboarding: boolean;
  hasCompletedSetup: boolean;
}) {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <Root>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background.primary },
        }}
      >
        <Stack.Protected guard={!hasSeenOnboarding}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={hasSeenOnboarding && !isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        {/*
          Board "10 — Onboarding" runs between signing in and the app proper:
          "Localização, endereço, notificações e preferências surgem apenas
          quando a identidade já está confirmada."
        */}
        <Stack.Protected
          guard={hasSeenOnboarding && isAuthenticated && !hasCompletedSetup}
        >
          <Stack.Screen name="(setup)" />
        </Stack.Protected>
        <Stack.Protected
          guard={hasSeenOnboarding && isAuthenticated && hasCompletedSetup}
        >
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
      </Stack>
    </Root>
  );
}

// Rendered inside both OnboardingProvider and AuthProvider so it can read
// both hooks' isLoading flags. Holds null until neither is loading, then
// mounts the rest of the tree (SafeAreaProvider + Navigation). This is the
// "wait before rendering" gate the design calls for once fonts are ready —
// it can't live in RootLayout because the providers it depends on are
// mounted BY RootLayout, so useAuth()/useOnboarding() aren't callable there.
function Gate({ onReady }: { onReady: () => void }) {
  const { hasSeenOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const { isLoading: authLoading } = useAuth();
  const { hasCompletedSetup, isLoading: setupLoading } = useSetup();
  const ready = !onboardingLoading && !authLoading && !setupLoading;

  useEffect(() => {
    if (ready) onReady();
  }, [ready, onReady]);

  // Node 45:17. The native splash has already handed over by this point (it is
  // released as soon as the fonts resolve), so this is what covers the window
  // where the stored session and setup are still being read.
  if (!ready) return <BrandSplash />;

  return (
    <SafeAreaProvider>
      <StatusBar hidden />
      <CartProvider>
        <CheckoutFlowProvider>
          <OrdersProvider>
            <Navigation
              hasSeenOnboarding={hasSeenOnboarding}
              hasCompletedSetup={hasCompletedSetup}
            />
          </OrdersProvider>
        </CheckoutFlowProvider>
      </CartProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  // Inter carries body, labels, inputs and all numerals; Poppins carries the
  // display and heading steps. Both families must resolve before first paint —
  // the type ramp addresses them by family name, so a missing file would fall
  // back to the system face and silently change every heading.
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Poppins_600SemiBold,
    Poppins_700Bold,
    // Board "01 · Onboarding" is set in Urbanist; the splash wordmark and the
    // welcome title are ExtraBold, which has no equivalent in the other two
    // families, so the whole face set is loaded rather than approximated.
    Urbanist_400Regular,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
  });
  const fontsReady = fontsLoaded || fontError;

  useEffect(() => {
    // Handing over at `fontsReady` rather than at full readiness is what makes
    // node 45:17 reachable: held until every store resolved, the native splash
    // would cover the branded one for its whole life and it would never render.
    if (fontsReady) SplashScreen.hideAsync().catch(() => {});
  }, [fontsReady]);

  // Gate only mounts once fontsReady is true (see the early return below),
  // so by the time its onReady fires, fonts are already resolved — this
  // callback is the single point where "everything is ready" becomes true.
  const handleReady = () => {
    SplashScreen.hideAsync().catch(() => {});
  };

  if (!fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <OnboardingProvider>
          <AuthProvider>
            <SetupProvider>
              <Gate onReady={handleReady} />
            </SetupProvider>
          </AuthProvider>
        </OnboardingProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
