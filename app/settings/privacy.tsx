import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';

export default function PrivacySettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const preferences = useAppStore((s) => s.preferences);

  const patch = (partial: Partial<NonNullable<typeof preferences>>) => {
    useAppStore.setState((s) => ({
      preferences: s.preferences ? { ...s.preferences, ...partial } : s.preferences,
    }));
  };

  if (!preferences) {
    return (
      <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, padding: 20 }}>
          <Button title="Back" variant="ghost" onPress={() => router.back()} />
          <Text style={[styles.title, { color: theme.ink }]}>Privacy</Text>
          <Text style={{ ...typography.body, color: theme.inkMuted }}>
            Sign in to manage privacy settings for this closet.
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Button title="Back" variant="ghost" onPress={() => router.back()} />
          <Text style={[styles.title, { color: theme.ink }]}>Privacy</Text>
          {(
            [
              ['mirror_check_enabled', 'Mirror Check enabled'],
              ['save_clothing_photos', 'Save clothing photos'],
              ['allow_cloud_image_processing', 'Allow cloud image processing'],
              ['analytics_enabled', 'Anonymous product analytics'],
              ['never_use_images_for_training', 'Never use images for training'],
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
          <Text style={{ ...typography.caption, color: theme.inkSoft, marginTop: 12 }}>
            Retention: {preferences.mirror_photo_retention}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 8 },
  title: { ...typography.hero },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
});
