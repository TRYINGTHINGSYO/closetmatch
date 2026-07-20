import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { APP_NAME, APP_TAGLINE } from '@/constants';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={styles.fill}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <View style={[styles.glow, { backgroundColor: theme.heroGlow }]} />
          <Text style={[styles.brand, { color: theme.ink }]} accessibilityRole="header">
            {APP_NAME}
          </Text>
          <Text style={[styles.tagline, { color: theme.inkMuted }]}>{APP_TAGLINE}</Text>
          <Text style={[styles.support, { color: theme.inkSoft }]}>
            Photograph your clothes, save what you wear, and get outfit ideas that learn your real style.
          </Text>
        </View>
        <View style={styles.actions}>
          <Button title="Create account" onPress={() => router.push('/(auth)/sign-up')} />
          <Button
            title="Sign in"
            variant="secondary"
            onPress={() => router.push('/(auth)/sign-in')}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  hero: { flex: 1, justifyContent: 'center', gap: 12 },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: 40,
    alignSelf: 'center',
    opacity: 0.55,
  },
  brand: { ...typography.brand },
  tagline: { ...typography.subtitle },
  support: { ...typography.body, marginTop: 8, maxWidth: 340 },
  actions: { gap: 12, paddingBottom: 24 },
});
