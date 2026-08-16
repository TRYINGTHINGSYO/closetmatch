import { StyleSheet, Text } from 'react-native';
import { AppearanceForm } from '@/components/appearance/AppearanceForm';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export default function AppearanceSettingsScreen() {
  const theme = useTheme();

  return (
    <ScreenShell scroll contentStyle={{ gap: 12 }}>
      <Text style={[styles.title, { color: theme.ink }]}>Look & feel</Text>
      <Text style={{ ...typography.body, color: theme.inkMuted }}>
        Personalize ClosetMatch with your colors, lighting, and background. Changes apply immediately on this device.
      </Text>
      <AppearanceForm />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.hero },
});
