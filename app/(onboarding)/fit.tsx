import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/Chip';
import { FIT_OPTIONS } from '@/constants';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';

export default function OnboardingFitScreen() {
  const theme = useTheme();
  const router = useRouter();
  const prefs = useAppStore((s) => s.preferences);
  const [fits, setFits] = useState<string[]>(prefs?.preferred_fits ?? []);

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.safe}>
          <Text style={[styles.step, { color: theme.accent }]}>Step 4 of 7</Text>
          <Text style={[styles.title, { color: theme.ink }]}>Fit preferences</Text>
          <Text style={[styles.sub, { color: theme.inkMuted }]}>
            Select the fits you usually reach for.
          </Text>
          <ChipGroup
            options={[...FIT_OPTIONS]}
            selected={fits}
            onToggle={(v) =>
              setFits((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
            }
          />
          <Button
            title="Continue"
            style={{ marginTop: 28 }}
            onPress={() => {
              useAppStore.setState((s) => ({
                preferences: s.preferences
                  ? { ...s.preferences, preferred_fits: fits }
                  : s.preferences,
              }));
              router.push('/(onboarding)/occasions');
            }}
          />
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
});
