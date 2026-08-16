import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';

export default function MirrorCheckHistoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const checks = useAppStore((s) => s.mirrorChecks);

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <Button title="Back" variant="ghost" onPress={() => router.back()} />
          <Text style={[styles.title, { color: theme.ink }]}>Mirror Check history</Text>
        </View>
        {checks.length === 0 ? (
          <EmptyState
            title="No Mirror Checks yet"
            message="Take a full-body photo of an outfit to receive private styling feedback."
            actionLabel="Start Mirror Check"
            onAction={() => router.push('/mirror-check/consent')}
          />
        ) : (
          <FlatList
            data={checks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/mirror-check/result', params: { id: item.id } })
                }
                style={[styles.card, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
              >
                <Text style={{ ...typography.label, color: theme.ink }}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
                <Text style={{ ...typography.caption, color: theme.inkMuted }}>
                  Score {Math.round((item.overall_score ?? 0) * 100)}% ·{' '}
                  {item.user_agreement ?? 'no response'} · Photo{' '}
                  {item.photo_deleted_at ? 'deleted' : 'retained'}
                </Text>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.hero, marginTop: 8 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12 },
});
