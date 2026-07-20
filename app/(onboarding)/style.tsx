import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/Chip';
import { STYLE_OPTIONS, RECOMMENDATION_MODE_OPTIONS } from '@/constants';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';

export default function OnboardingStyleScreen() {
  const theme = useTheme();
  const router = useRouter();
  const prefs = useAppStore((s) => s.preferences);
  const [stylesSelected, setStyles] = useState<string[]>(prefs?.preferred_styles ?? []);
  const [mode, setMode] = useState(prefs?.recommendation_mode ?? 'balanced');

  const toggle = (v: string) =>
    setStyles((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.safe}>
          <Text style={[styles.step, { color: theme.accent }]}>Step 2 of 7</Text>
          <Text style={[styles.title, { color: theme.ink }]}>Your style</Text>
          <Text style={[styles.sub, { color: theme.inkMuted }]}>
            Pick what feels like you. ClosetMatch will refine this from what you actually wear.
          </Text>
          <ChipGroup options={[...STYLE_OPTIONS]} selected={stylesSelected} onToggle={toggle} />
          <Text style={[styles.section, { color: theme.ink }]}>Recommendation preference</Text>
          <ChipGroup
            options={RECOMMENDATION_MODE_OPTIONS.map((o) => o.label)}
            selected={[
              RECOMMENDATION_MODE_OPTIONS.find((o) => o.value === mode)?.label ?? 'Balanced variety',
            ]}
            onToggle={(label) => {
              const found = RECOMMENDATION_MODE_OPTIONS.find((o) => o.label === label);
              if (found) setMode(found.value);
            }}
            multi={false}
          />
          <Button
            title="Continue"
            style={{ marginTop: 28 }}
            onPress={() => {
              useAppStore.setState((s) => ({
                preferences: s.preferences
                  ? {
                      ...s.preferences,
                      preferred_styles: stylesSelected,
                      recommendation_mode: mode as typeof mode,
                    }
                  : s.preferences,
              }));
              router.push('/(onboarding)/colors');
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
  sub: { ...typography.body, marginBottom: 8 },
  section: { ...typography.subtitle, marginTop: 20, marginBottom: 8 },
});
