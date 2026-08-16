import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { APP_NAME, APP_TAGLINE } from '@/constants';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';

const FEATURES = [
  {
    title: 'Digital closet',
    body: 'Photograph pieces you actually own and browse by color, category, or favorites.',
  },
  {
    title: 'What to wear today',
    body: 'Use ready outfits you already saved, or swipe Tinder-style through every available piece.',
  },
  {
    title: 'Outfit builder',
    body: 'Save combinations you wear so recommendations learn your real style.',
  },
  {
    title: 'Laundry',
    body: 'Keep dirty clothes out of suggestions until they are clean again.',
  },
  {
    title: 'Mirror Check',
    body: 'Private on-body photos to see whether a look works in real life.',
  },
  {
    title: 'Look & feel',
    body: 'Colors, lighting, and backgrounds that stay on this device.',
  },
] as const;

export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { wide } = useWebLayout();

  return (
    <ScreenShell scroll>
      <View style={[styles.hero, wide && styles.heroWide]}>
        <View style={{ flex: 1, gap: 12, maxWidth: 560 }}>
          <View style={[styles.glow, { backgroundColor: theme.heroGlow }]} />
          <Text style={[styles.brand, { color: theme.ink }]} accessibilityRole="header">
            {APP_NAME}
          </Text>
          <Text style={[styles.tagline, { color: theme.inkMuted }]}>{APP_TAGLINE}</Text>
          <Text style={[styles.support, { color: theme.inkSoft }]}>
            Photograph your clothes, save what you wear, and get outfit ideas that learn your real style — in a full
            website, not a phone preview.
          </Text>
          <View style={styles.actions}>
            <Button title="Create account" onPress={() => router.push('/(auth)/sign-up')} />
            <Button title="Sign in" variant="secondary" onPress={() => router.push('/(auth)/sign-in')} />
            <Button title="Personalize look" variant="ghost" onPress={() => router.push('/look')} />
          </View>
        </View>
      </View>
      <Text style={[styles.section, { color: theme.ink }]}>Everything you can do</Text>
      <View style={styles.grid}>
        {FEATURES.map((feature) => (
          <View
            key={feature.title}
            style={[
              styles.card,
              {
                backgroundColor: theme.bgElevated,
                borderColor: theme.border,
                flexBasis: wide ? '31%' : '100%',
              },
            ]}
          >
            <Text style={{ ...typography.label, color: theme.ink }}>{feature.title}</Text>
            <Text style={{ ...typography.body, color: theme.inkMuted }}>{feature.body}</Text>
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: 24, paddingBottom: 12 },
  heroWide: { flexDirection: 'row', alignItems: 'center' },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -20,
    left: -20,
    opacity: 0.5,
  },
  brand: { ...typography.brand, fontSize: 42, lineHeight: 48 },
  tagline: { ...typography.subtitle, fontSize: 22, lineHeight: 30 },
  support: { ...typography.body, marginTop: 4, maxWidth: 520 },
  actions: { gap: 10, marginTop: 8, maxWidth: 360 },
  section: { ...typography.subtitle, marginTop: 28, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 6,
    flexGrow: 1,
    minWidth: 220,
  },
});
