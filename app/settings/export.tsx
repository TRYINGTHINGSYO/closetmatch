import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { showAlert } from '@/lib/ui/alert';

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
    const filename = `closetmatch-export-${new Date().toISOString().slice(0, 10)}.json`;

    if (Platform.OS === 'web') {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      showAlert('Export downloaded', `${filename} is in your downloads folder.`);
      return;
    }

    try {
      const dir =
        (FileSystem as { cacheDirectory?: string | null }).cacheDirectory ??
        (FileSystem as { documentDirectory?: string | null }).documentDirectory;
      if (!dir) {
        showAlert('Export prepared', `Generated ${json.length} characters of JSON.`);
        return;
      }
      const path = `${dir}${filename}`;
      await FileSystem.writeAsStringAsync(path, json);
      showAlert('Export saved', `Saved to ${path}`);
    } catch {
      showAlert('Export prepared', `Generated ${json.length} characters of JSON.`);
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
