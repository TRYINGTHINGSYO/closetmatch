import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/Chip';
import { OCCASION_OPTIONS } from '@/constants';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export default function OnboardingOccasionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [occasions, setOccasions] = useState<string[]>(['Everyday', 'Work']);

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.safe}>
          <Text style={[styles.step, { color: theme.accent }]}>Step 5 of 7</Text>
          <Text style={[styles.title, { color: theme.ink }]}>Common occasions</Text>
          <Text style={[styles.sub, { color: theme.inkMuted }]}>
            Where do you dress for most often?
          </Text>
          <ChipGroup
            options={[...OCCASION_OPTIONS]}
            selected={occasions}
            onToggle={(v) =>
              setOccasions((prev) =>
                prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
              )
            }
          />
          <Button
            title="Continue"
            style={{ marginTop: 28 }}
            onPress={() => router.push('/(onboarding)/privacy')}
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
