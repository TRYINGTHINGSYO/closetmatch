import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { AVAILABILITY_LABELS } from '@/constants';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { useAppStore } from '@/stores/app-store';
import { useMemo, useState } from 'react';
import type { AvailabilityStatus } from '@/types';

const TABS: AvailabilityStatus[] = ['dirty', 'in_laundry', 'drying', 'available'];

export default function LaundryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isWeb } = useWebLayout();
  const clothingItems = useAppStore((s) => s.clothingItems);
  const setAvailability = useAppStore((s) => s.setAvailability);
  const [tab, setTab] = useState<AvailabilityStatus>('dirty');

  const list = useMemo(
    () =>
      clothingItems.filter((c) =>
        tab === 'available'
          ? c.availability_status === 'available'
          : c.availability_status === tab
      ),
    [clothingItems, tab]
  );

  return (
    <ScreenShell scroll>
      {isWeb ? null : <Button title="Back" variant="ghost" onPress={() => router.back()} />}
      <Text style={[styles.title, { color: theme.ink }]}>Laundry</Text>
      <Text style={{ ...typography.body, color: theme.inkMuted }}>
        Dirty items are excluded from recommendations by default. Shirts mark dirty after wear; jeans, jackets, and
        shoes usually stay available.
      </Text>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Chip
            key={t}
            label={AVAILABILITY_LABELS[t]}
            selected={tab === t}
            onPress={() => setTab(t)}
          />
        ))}
      </View>
      {list.length === 0 ? (
        <EmptyState
          title={`No ${AVAILABILITY_LABELS[tab].toLowerCase()} items`}
          message={
            tab === 'dirty'
              ? 'Mark worn outfits or tap Dirty on an item to start a laundry pile.'
              : tab === 'available'
                ? 'Everything is in laundry or archived right now.'
                : 'Move items here as they go through the wash.'
          }
        />
      ) : (
        <View style={{ gap: 10 }}>
          {list.map((item) => (
            <View
              key={item.id}
              style={[styles.card, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
            >
              <View style={styles.itemHead}>
                {item.primary_image_url ? (
                  <Image source={{ uri: item.primary_image_url }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, { backgroundColor: theme.accentSoft }]} />
                )}
                <Text style={{ ...typography.label, color: theme.ink, flex: 1 }}>{item.name}</Text>
              </View>
              <View style={styles.row}>
                <Button title="Dirty" variant="ghost" style={styles.mini} onPress={() => setAvailability(item.id, 'dirty')} />
                <Button
                  title="Laundry"
                  variant="ghost"
                  style={styles.mini}
                  onPress={() => setAvailability(item.id, 'in_laundry')}
                />
                <Button
                  title="Drying"
                  variant="ghost"
                  style={styles.mini}
                  onPress={() => setAvailability(item.id, 'drying')}
                />
                <Button
                  title="Clean"
                  variant="secondary"
                  style={styles.mini}
                  onPress={() => setAvailability(item.id, 'available')}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.hero, marginVertical: 8 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 16 },
  card: { borderWidth: 1, borderRadius: 14, padding: 12 },
  itemHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 48, height: 48, borderRadius: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  mini: { minHeight: 40, paddingHorizontal: 10 },
});
