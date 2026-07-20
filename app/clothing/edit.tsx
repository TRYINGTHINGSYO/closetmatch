import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

/** Edit form reuses review-analysis patterns; placeholder routes to capture for MVP continuity */
export default function ClothingEditScreen() {
  const theme = useTheme();
  const router = useRouter();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.ink }]}>Edit item</Text>
      <Text style={{ ...typography.body, color: theme.inkMuted, marginBottom: 16 }}>
        Open an item from your closet to update availability, favorites, and laundry status. Full field editing uses the review form after capture.
      </Text>
      <Button title="Back to closet" onPress={() => router.push('/(tabs)/closet')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 24 },
  title: { ...typography.hero, marginBottom: 8 },
});
