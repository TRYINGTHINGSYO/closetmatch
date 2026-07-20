import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { TextField } from '@/components/ui/TextField';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';
import { useState } from 'react';

export default function WeatherSettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const preferences = useAppStore((s) => s.preferences);
  const [city, setCity] = useState(profile?.location_name ?? '');
  const [sensitivity, setSensitivity] = useState(preferences?.temperature_sensitivity ?? 0);

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <Button title="Back" variant="ghost" onPress={() => router.back()} />
        <Text style={[styles.title, { color: theme.ink }]}>Weather</Text>
        <TextField label="City" value={city} onChangeText={setCity} />
        <Text style={{ ...typography.label, color: theme.inkMuted, marginBottom: 8 }}>
          Temperature sensitivity
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Chip
            label="Gets cold easily"
            selected={sensitivity < 0}
            onPress={() => setSensitivity(-1)}
          />
          <Chip label="Average" selected={sensitivity === 0} onPress={() => setSensitivity(0)} />
          <Chip
            label="Gets warm easily"
            selected={sensitivity > 0}
            onPress={() => setSensitivity(1)}
          />
        </View>
        <Button
          title="Save"
          style={{ marginTop: 24 }}
          onPress={() => {
            useAppStore.setState((s) => ({
              profile: s.profile
                ? { ...s.profile, location_name: city || null }
                : s.profile,
              preferences: s.preferences
                ? { ...s.preferences, temperature_sensitivity: sensitivity, weather_enabled: true }
                : s.preferences,
            }));
            router.back();
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 20 },
  title: { ...typography.hero, marginBottom: 12 },
});
