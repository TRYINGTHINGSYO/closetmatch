import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/Chip';
import { COLOR_OPTIONS, CONTRAST_OPTIONS } from '@/constants';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';

export default function OnboardingColorsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const prefs = useAppStore((s) => s.preferences);
  const [preferred, setPreferred] = useState<string[]>(prefs?.preferred_colors ?? []);
  const [avoided, setAvoided] = useState<string[]>(prefs?.avoided_colors ?? []);
  const [contrast, setContrast] = useState(prefs?.preferred_contrast ?? 'no_preference');

  const toggle = (list: string[], setList: (v: string[]) => void, v: string) =>
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.safe}>
          <Text style={[styles.step, { color: theme.accent }]}>Step 3 of 7</Text>
          <Text style={[styles.title, { color: theme.ink }]}>Colors</Text>
          <Text style={[styles.sub, { color: theme.inkMuted }]}>Favorite colors</Text>
          <ChipGroup
            options={[...COLOR_OPTIONS]}
            selected={preferred}
            onToggle={(v) => toggle(preferred, setPreferred, v)}
          />
          <Text style={[styles.sub, { color: theme.inkMuted, marginTop: 16 }]}>Colors you avoid</Text>
          <ChipGroup
            options={[...COLOR_OPTIONS]}
            selected={avoided}
            onToggle={(v) => toggle(avoided, setAvoided, v)}
          />
          <Text style={[styles.sub, { color: theme.inkMuted, marginTop: 16 }]}>Contrast</Text>
          <ChipGroup
            options={CONTRAST_OPTIONS.map((c) => c.label)}
            selected={[CONTRAST_OPTIONS.find((c) => c.value === contrast)?.label ?? 'No preference']}
            onToggle={(label) => {
              const found = CONTRAST_OPTIONS.find((c) => c.label === label);
              if (found) setContrast(found.value);
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
                      preferred_colors: preferred,
                      avoided_colors: avoided,
                      preferred_contrast: contrast as typeof contrast,
                    }
                  : s.preferences,
              }));
              router.push('/(onboarding)/fit');
            }}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { padding: 24, paddingBottom: 40, gap: 10 },
  step: { ...typography.caption },
  title: { ...typography.hero },
  sub: { ...typography.label },
});
