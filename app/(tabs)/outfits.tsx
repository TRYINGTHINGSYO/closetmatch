import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
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

export default function OutfitsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const outfits = useAppStore((s) => s.outfits);
  const markOutfitWorn = useAppStore((s) => s.markOutfitWorn);
  const [tab, setTab] = useState<'saved' | 'worn' | 'favorites' | 'planned'>('saved');
  const planned = useAppStore((s) => s.plannedOutfits);

  const list = useMemo(() => {
    if (tab === 'favorites') return outfits.filter((o) => o.favorite);
    if (tab === 'worn') return outfits.filter((o) => o.times_worn > 0 || o.status === 'worn');
    if (tab === 'planned') return outfits.filter((o) => planned.some((p) => p.outfit_id === o.id));
    return outfits.filter((o) => o.status !== 'rejected' && o.status !== 'archived');
  }, [outfits, tab, planned]);

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.ink }]}>Outfits</Text>
          <Button
            title="Build"
            onPress={() => router.push('/outfits/builder')}
            style={{ paddingHorizontal: 16, minHeight: 40 }}
          />
        </View>
        <View style={styles.tabs}>
          {(['saved', 'worn', 'favorites', 'planned'] as const).map((t) => (
            <Chip key={t} label={t} selected={tab === t} onPress={() => setTab(t)} />
          ))}
        </View>

        {list.length === 0 ? (
          <EmptyState
            title="No outfit history yet"
            message="Save a few combinations you already wear so ClosetMatch can learn your style."
            actionLabel="Create outfit"
            onAction={() => router.push('/outfits/builder')}
          />
        ) : (
          <FlatList
            data={list}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push(`/outfits/${item.id}`)}
                style={[styles.card, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
              >
                <Text style={[styles.name, { color: theme.ink }]}>{item.name}</Text>
                <Text style={{ ...typography.caption, color: theme.inkMuted }}>
                  {item.items?.map((i) => i.clothing_item?.name ?? 'Item').join(' · ')}
                </Text>
                <Text style={{ ...typography.caption, color: theme.inkSoft, marginTop: 6 }}>
                  Worn {item.times_worn}×
                  {item.rating ? ` · Rated ${item.rating}` : ''}
                  {item.occasion ? ` · ${item.occasion}` : ''}
                </Text>
                <View style={styles.row}>
                  <Pressable onPress={() => markOutfitWorn(item.id, { rating: 4 })}>
                    <Text style={{ color: theme.accent, ...typography.label }}>Mark worn</Text>
                  </Pressable>
                  <Pressable onPress={() => router.push('/mirror-check/consent')}>
                    <Text style={{ color: theme.accent, ...typography.label }}>Mirror Check</Text>
                  </Pressable>
                </View>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { ...typography.hero },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  name: { ...typography.subtitle },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});
