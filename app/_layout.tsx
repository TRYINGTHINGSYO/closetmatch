import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { AppThemeProvider, useIsDarkTheme, useTheme } from '@/hooks/useTheme';
import { AppBackground } from '@/components/ui/AppBackground';
import { useAppStore } from '@/stores/app-store';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const sessionEmail = useAppStore((s) => s.sessionEmail);
  const profile = useAppStore((s) => s.profile);
  const hydrated = useAppStore((s) => s.hydrated);
  const segments = useSegments();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (!hydrated) return;
    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';
    const inLook = segments[0] === 'look';

    if (!sessionEmail && !inAuth && !inLook) {
      router.replace('/(auth)/welcome');
      return;
    }
    if (sessionEmail && profile && !profile.onboarding_completed && !inOnboarding) {
      router.replace('/(onboarding)/profile');
      return;
    }
    if (sessionEmail && profile?.onboarding_completed && (inAuth || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [sessionEmail, profile, segments, hydrated, router]);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

function ThemedApp({ children }: { children: React.ReactNode }) {
  const dark = useIsDarkTheme();
  return (
    <AppBackground>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {children}
    </AppBackground>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Fraunces_600SemiBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  useEffect(() => {
    const finish = () => useAppStore.setState({ hydrated: true });
    const unsub = useAppStore.persist.onFinishHydration(finish);
    if (useAppStore.persist.hasHydrated()) finish();
    const t = setTimeout(finish, 2000);
    return () => {
      if (typeof unsub === 'function') unsub();
      clearTimeout(t);
    };
  }, []);

  if (!loaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <ThemedApp>
          <AuthGate>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="look" options={{ headerShown: false }} />
              <Stack.Screen name="clothing" options={{ headerShown: false }} />
              <Stack.Screen name="outfits" options={{ headerShown: false }} />
              <Stack.Screen name="mirror-check" options={{ headerShown: false }} />
              <Stack.Screen name="laundry" options={{ headerShown: false }} />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
              <Stack.Screen name="history" options={{ headerShown: false }} />
            </Stack>
          </AuthGate>
        </ThemedApp>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}
