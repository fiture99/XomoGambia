import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function useProtectedRoute() {
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const onPublicScreen =
      segments[0] === "onboarding" || segments[0] === "auth" || segments[0] === "provider";
    if (!user && !onPublicScreen) {
      router.replace("/onboarding");
    } else if (user && (segments[0] === "onboarding" || segments[0] === "auth")) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments[0]]);
}

function RootLayoutNav() {
  useProtectedRoute();
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="company/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="category/[slug]" options={{ headerShown: false }} />
      <Stack.Screen name="quote/new" options={{ headerShown: false }} />
      <Stack.Screen name="quote/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="job/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="review/new" options={{ headerShown: false }} />
      <Stack.Screen name="provider/register" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </AppProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
