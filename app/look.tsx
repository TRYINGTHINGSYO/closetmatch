import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AppearanceForm } from '@/components/appearance/AppearanceForm';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';

export default function PublicLookScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isWeb } = useWebLayout();

  return (
    <ScreenShell scroll contentStyle={{ gap: 12 }}>
      {isWeb ? null : <Button title="Back" variant="ghost" onPress={() => router.back()} />}
      <Text style={[styles.title, { color: theme.ink }]}>Look & feel</Text>
      <Text style={{ ...typography.body, color: theme.inkMuted }}>
        Make ClosetMatch yours — colors, background, and light or dark. This stays on this device.
      </Text>
      <AppearanceForm />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.hero },
});
