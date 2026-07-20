import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';

export default function MirrorCheckConsentScreen() {
  const theme = useTheme();
  const router = useRouter();
  const enabled = useAppStore((s) => s.preferences?.mirror_check_enabled ?? true);
  const retention = useAppStore((s) => s.preferences?.mirror_photo_retention);

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Button title="Back" variant="ghost" onPress={() => router.back()} />
          <Text style={[styles.title, { color: theme.ink }]}>Mirror Check privacy</Text>
          <Text style={[styles.body, { color: theme.inkMuted }]}>
            Mirror Check looks at clothing coordination — colors, layers, proportions, shoes, and occasion fit.
            It does not rate attractiveness or criticize your body.
          </Text>
          <Text style={[styles.body, { color: theme.inkMuted }]}>
            Photos are private by default, stored under your account path, protected by Row Level Security,
            and accessed via signed URLs when cloud storage is enabled.
          </Text>
          <Text style={[styles.body, { color: theme.inkSoft }]}>
            Current retention: {retention ?? 'delete_after_analysis'}. Personal images are never used for model training.
          </Text>
          {!enabled ? (
            <Text style={{ color: theme.warning, ...typography.body }}>
              Mirror Check is disabled in your preferences. You can re-enable it in Privacy settings.
            </Text>
          ) : null}
          <Button
            title="I understand — continue"
            disabled={!enabled}
            onPress={() => router.push('/mirror-check/capture')}
            style={{ marginTop: 20 }}
          />
          <Button
            title="Privacy settings"
            variant="ghost"
            onPress={() => router.push('/settings/privacy')}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 12, paddingBottom: 40 },
  title: { ...typography.hero },
  body: { ...typography.body },
});
