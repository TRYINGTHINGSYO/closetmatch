import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export default function NotFoundScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <Text style={[styles.title, { color: theme.ink }]}>This screen doesn’t exist</Text>
        <Text style={[styles.body, { color: theme.inkMuted }]}>
          The link may be outdated. Head back to ClosetMatch and keep getting dressed.
        </Text>
        <Button title="Go home" onPress={() => router.replace('/(tabs)')} style={{ marginTop: 20 }} />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { ...typography.hero, textAlign: 'center' },
  body: { ...typography.body, textAlign: 'center', marginTop: 8, maxWidth: 360 },
});
