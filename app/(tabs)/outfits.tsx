import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Chip } from '@/components/ui/Chip';
import { ReadyOutfitCard } from '@/components/recommendations/ReadyOutfitCard';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';

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
    <ScreenShell scroll>
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
          <Chip
            key={t}
            label={t === 'saved' ? 'Saved' : t === 'worn' ? 'Worn' : t === 'favorites' ? 'Favorites' : 'Planned'}
            selected={tab === t}
            onPress={() => setTab(t)}
          />
        ))}
      </View>

      {list.length === 0 ? (
        <EmptyState
          title={
            tab === 'favorites'
              ? 'No favorite outfits yet'
              : tab === 'worn'
                ? 'Nothing worn yet'
                : tab === 'planned'
                  ? 'No planned outfits'
                  : 'No saved outfits yet'
          }
          message={
            tab === 'planned'
              ? 'Schedule a look from the builder or an outfit page.'
              : 'Save a few combinations you already wear so ClosetMatch can learn your style.'
          }
          actionLabel={tab === 'planned' ? 'Open calendar' : 'Create outfit'}
          onAction={() => router.push(tab === 'planned' ? '/outfits/planned' : '/outfits/builder')}
        />
      ) : (
        <View style={styles.grid}>
          {list.map((item) => (
            <ReadyOutfitCard
              key={item.id}
              outfit={item}
              onOpen={() => router.push(`/outfits/${item.id}`)}
              onWear={() => markOutfitWorn(item.id, { rating: 4 })}
            />
          ))}
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
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
    paddingVertical: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
