import { Alert, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export default function ExportSettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const state = useAppStore();

  const exportData = async () => {
    const payload = {
      exported_at: new Date().toISOString(),
      profile: state.profile,
      preferences: state.preferences,
      clothing_items: state.clothingItems.map((c) => ({
        ...c,
        // Do not include raw photo URLs in analytics-style exports by default
        primary_image_url: undefined,
      })),
      outfits: state.outfits,
      wear_history: state.wearHistory,
      pairings: state.pairings,
      mirror_checks: state.mirrorChecks.map((m) => ({
        ...m,
        original_image_path: null,
        processed_image_path: null,
      })),
      planned_outfits: state.plannedOutfits,
      note: 'Mirror Check photo binaries are excluded. Connect Supabase export-user-data for full cloud export.',
    };

    const json = JSON.stringify(payload, null, 2);

    if (Platform.OS === 'web') {
      Alert.alert('Export ready', `Export JSON length: ${json.length} characters. Copy from console in web builds.`);
      console.info('[ClosetMatch export]', json.slice(0, 500) + '…');
      return;
    }

    try {
      const dir =
        (FileSystem as { cacheDirectory?: string | null }).cacheDirectory ??
        (FileSystem as { documentDirectory?: string | null }).documentDirectory;
      if (!dir) {
        Alert.alert('Export prepared', `Generated ${json.length} characters of JSON.`);
        return;
      }
      const path = `${dir}closetmatch-export.json`;
      await FileSystem.writeAsStringAsync(path, json);
      Alert.alert('Export saved', `Saved to ${path}`);
    } catch {
      Alert.alert('Export prepared', `Generated ${json.length} characters of JSON.`);
    }
  };

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <Button title="Back" variant="ghost" onPress={() => router.back()} />
        <Text style={[styles.title, { color: theme.ink }]}>Data export</Text>
        <Text style={{ ...typography.body, color: theme.inkMuted }}>
          Download your wardrobe metadata, outfits, wear history, and Mirror Check analysis results.
          Photo binaries follow your retention settings and are omitted from this client export.
        </Text>
        <Button title="Export my data" style={{ marginTop: 24 }} onPress={exportData} />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 20 },
  title: { ...typography.hero, marginBottom: 12 },
});
