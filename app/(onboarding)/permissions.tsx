import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';
import { showAlert } from '@/lib/ui/alert';

export default function OnboardingPermissionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const loadDemoWardrobe = useAppStore((s) => s.loadDemoWardrobe);
  const [weather, setWeather] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [loadSeed, setLoadSeed] = useState(true);

  const finish = () => {
    completeOnboarding({
      weather_enabled: weather,
      notifications_enabled: notifications,
    });
    if (loadSeed) loadDemoWardrobe();
    showAlert(
      'Closet ready',
      loadSeed
        ? 'A sample wardrobe was loaded so you can explore recommendations immediately.'
        : 'Add your first clothing photo to start building your closet.'
    );
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.safe}>
          <Text style={[styles.step, { color: theme.accent }]}>Step 7 of 7</Text>
          <Text style={[styles.title, { color: theme.ink }]}>Optional permissions</Text>
          <Text style={[styles.sub, { color: theme.inkMuted }]}>
            Location, notifications, and Mirror Check are always optional.
          </Text>

          <View style={[styles.row, { borderColor: theme.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ ...typography.label, color: theme.ink }}>Weather-based suggestions</Text>
              <Text style={{ ...typography.caption, color: theme.inkSoft }}>
                Uses city name or optional location.
              </Text>
            </View>
            <Switch value={weather} onValueChange={setWeather} trackColor={{ true: theme.accent }} />
          </View>

          <View style={[styles.row, { borderColor: theme.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ ...typography.label, color: theme.ink }}>Notifications</Text>
              <Text style={{ ...typography.caption, color: theme.inkSoft }}>
                Daily outfit and laundry reminders — opt-in only.
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: theme.accent }}
            />
          </View>

          <View style={[styles.row, { borderColor: theme.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ ...typography.label, color: theme.ink }}>Load sample wardrobe</Text>
              <Text style={{ ...typography.caption, color: theme.inkSoft }}>
                Demo seed data with outfits and wear history for exploring the MVP.
              </Text>
            </View>
            <Switch value={loadSeed} onValueChange={setLoadSeed} trackColor={{ true: theme.accent }} />
          </View>

          <Button title="Enter ClosetMatch" style={{ marginTop: 28 }} onPress={finish} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { padding: 24, paddingBottom: 40, gap: 12 },
  step: { ...typography.caption },
  title: { ...typography.hero },
  sub: { ...typography.body },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
});
