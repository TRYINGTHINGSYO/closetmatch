import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppearanceForm } from '@/components/appearance/AppearanceForm';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export default function PublicLookScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Button title="Back" variant="ghost" onPress={() => router.back()} />
          <Text style={[styles.title, { color: theme.ink }]}>Look & feel</Text>
          <Text style={{ ...typography.body, color: theme.inkMuted }}>
            Make ClosetMatch yours — colors, background, and light or dark. This stays on this device.
          </Text>
          <AppearanceForm />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 12, paddingBottom: 48 },
  title: { ...typography.hero },
});
