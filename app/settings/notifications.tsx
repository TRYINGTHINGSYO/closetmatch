import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';

export default function NotificationSettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const preferences = useAppStore((s) => s.preferences);

  const patch = (partial: Record<string, boolean>) => {
    useAppStore.setState((s) => ({
      preferences: s.preferences ? { ...s.preferences, ...partial } : s.preferences,
    }));
  };

  if (!preferences) return null;

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Button title="Back" variant="ghost" onPress={() => router.back()} />
          <Text style={[styles.title, { color: theme.ink }]}>Notifications</Text>
          <Text style={{ ...typography.body, color: theme.inkMuted, marginBottom: 8 }}>
            All notifications are opt-in.
          </Text>
          {(
            [
              ['notifications_enabled', 'Enable notifications'],
              ['daily_outfit_suggestions', 'Daily outfit suggestion'],
              ['laundry_reminders', 'Laundry reminders'],
              ['planned_outfit_reminders', 'Planned outfit reminders'],
              ['underused_item_suggestions', 'Underused item suggestions'],
              ['repeat_outfit_warnings', 'Repeat outfit warnings'],
            ] as const
          ).map(([key, label]) => (
            <View key={key} style={[styles.row, { borderColor: theme.border }]}>
              <Text style={{ flex: 1, ...typography.label, color: theme.ink }}>{label}</Text>
              <Switch
                value={Boolean(preferences[key])}
                onValueChange={(v) => patch({ [key]: v })}
                trackColor={{ true: theme.accent }}
              />
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  title: { ...typography.hero, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
});
