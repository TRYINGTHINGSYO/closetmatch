import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Chip } from '@/components/ui/Chip';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';
import { useMemo, useState } from 'react';

export default function HistoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const wearHistory = useAppStore((s) => s.wearHistory);
  const outfits = useAppStore((s) => s.outfits);
  const [view, setView] = useState<'timeline' | 'calendar'>('timeline');

  const byDate = useMemo(() => {
    const map = new Map<string, typeof wearHistory>();
    for (const w of wearHistory) {
      const day = w.worn_at.slice(0, 10);
      const list = map.get(day) ?? [];
      list.push(w);
      map.set(day, list);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [wearHistory]);

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <Button title="Back" variant="ghost" onPress={() => router.back()} />
          <Text style={[styles.title, { color: theme.ink }]}>Wear history</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <Chip label="Timeline" selected={view === 'timeline'} onPress={() => setView('timeline')} />
            <Chip label="By date" selected={view === 'calendar'} onPress={() => setView('calendar')} />
          </View>
        </View>

        {wearHistory.length === 0 ? (
          <EmptyState
            title="No wear history yet"
            message="Mark an outfit worn to start building your personal style history."
            actionLabel="Browse outfits"
            onAction={() => router.push('/(tabs)/outfits')}
          />
        ) : view === 'calendar' ? (
          <FlatList
            data={byDate}
            keyExtractor={([day]) => day}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            renderItem={({ item: [day, entries] }) => (
              <View
                style={[styles.card, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
              >
                <Text style={{ ...typography.subtitle, color: theme.ink }}>{day}</Text>
                <Text style={{ ...typography.caption, color: theme.inkMuted }}>
                  {entries.length} outfit{entries.length === 1 ? '' : 's'} worn
                </Text>
              </View>
            )}
          />
        ) : (
          <FlatList
            data={wearHistory}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            renderItem={({ item }) => {
              const outfit = outfits.find((o) => o.id === item.outfit_id);
              return (
                <View
                  style={[
                    styles.card,
                    { backgroundColor: theme.bgElevated, borderColor: theme.border },
                  ]}
                >
                  <Text style={{ ...typography.label, color: theme.ink }}>
                    {outfit?.name ?? 'Outfit'}
                  </Text>
                  <Text style={{ ...typography.caption, color: theme.inkMuted }}>
                    {new Date(item.worn_at).toLocaleString()}
                    {item.occasion ? ` · ${item.occasion}` : ''}
                    {item.rating ? ` · ${item.rating}★` : ''}
                  </Text>
                  {item.too_cold ? (
                    <Text style={{ ...typography.caption, color: theme.warning }}>Felt too cold</Text>
                  ) : null}
                </View>
              );
            }}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.hero },
  card: { borderWidth: 1, borderRadius: 14, padding: 12 },
});
