import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Chip } from '@/components/ui/Chip';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';

export default function OnboardingProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [location, setLocation] = useState(profile?.location_name ?? '');
  const [unit, setUnit] = useState<'f' | 'c'>(profile?.preferred_temperature_unit ?? 'f');

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <Text style={[styles.step, { color: theme.accent }]}>Step 1 of 7</Text>
        <Text style={[styles.title, { color: theme.ink }]}>About you</Text>
        <Text style={[styles.sub, { color: theme.inkMuted }]}>
          Basic details help ClosetMatch personalize weather and greetings. Nothing is shared.
        </Text>
        <View style={{ marginTop: 20 }}>
          <TextField label="Display name" value={displayName} onChangeText={setDisplayName} />
          <TextField
            label="City or general location (optional)"
            value={location}
            onChangeText={setLocation}
          />
          <Text style={[styles.label, { color: theme.inkMuted }]}>Temperature unit</Text>
          <View style={styles.row}>
            <Chip label="°F" selected={unit === 'f'} onPress={() => setUnit('f')} />
            <Chip label="°C" selected={unit === 'c'} onPress={() => setUnit('c')} />
          </View>
        </View>
        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={() => {
              useAppStore.setState((s) => ({
                profile: s.profile
                  ? {
                      ...s.profile,
                      display_name: displayName || s.profile.display_name,
                      location_name: location || null,
                      preferred_temperature_unit: unit,
                    }
                  : s.profile,
              }));
              router.push('/(onboarding)/style');
            }}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 24 },
  step: { ...typography.caption, marginTop: 8 },
  title: { ...typography.hero, marginTop: 8 },
  sub: { ...typography.body, marginTop: 8 },
  label: { ...typography.label, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  footer: { marginTop: 'auto', paddingBottom: 12 },
});
