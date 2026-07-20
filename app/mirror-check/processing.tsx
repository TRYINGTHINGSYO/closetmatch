import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';

export default function MirrorCheckProcessingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const runMirrorCheck = useAppStore((s) => s.runMirrorCheck);
  const outfits = useAppStore((s) => s.outfits);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const latestOutfit = outfits[0];
        const { mirror } = await runMirrorCheck({
          imageUri: imageUri || 'local://demo',
          outfitId: latestOutfit?.id,
          occasion: latestOutfit?.occasion ?? 'Everyday',
        });
        if (!cancelled) {
          router.replace({
            pathname: '/mirror-check/result',
            params: { id: mirror.id },
          });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Analysis failed');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [imageUri]);

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        {error ? (
          <>
            <Text style={[styles.title, { color: theme.ink }]}>Could not analyze</Text>
            <Text style={{ ...typography.body, color: theme.inkMuted }}>{error}</Text>
            <Button title="Try again" onPress={() => router.back()} style={{ marginTop: 16 }} />
            <Button
              title="Save outfit anyway"
              variant="secondary"
              onPress={() => router.push('/(tabs)/outfits')}
            />
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.title, { color: theme.ink, marginTop: 16 }]}>
              Analyzing clothing coordination…
            </Text>
            <Text style={{ ...typography.body, color: theme.inkMuted, textAlign: 'center' }}>
              Focusing on colors, layers, proportions, and occasion fit — not appearance.
            </Text>
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 10 },
  title: { ...typography.title, textAlign: 'center' },
});
