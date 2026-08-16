import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ClothingCard } from '@/components/clothing/ClothingCard';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { STARTER_OUTFIT_CATEGORIES } from '@/constants';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { useAppStore } from '@/stores/app-store';
import { showAlert } from '@/lib/ui/alert';

export default function OutfitBuilderScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { wide, isWeb } = useWebLayout();
  const { seedItemId, seedItemIds } = useLocalSearchParams<{ seedItemId?: string; seedItemIds?: string }>();
  const clothingItems = useAppStore((s) => s.clothingItems);
  const saveOutfit = useAppStore((s) => s.saveOutfit);
  const markOutfitWorn = useAppStore((s) => s.markOutfitWorn);
  const planOutfit = useAppStore((s) => s.planOutfit);

  const available = useMemo(
    () => clothingItems.filter((c) => c.availability_status === 'available' && !c.archived_at),
    [clothingItems]
  );

  const [selected, setSelected] = useState<string[]>(() => {
    if (seedItemIds) return seedItemIds.split(',').filter(Boolean);
    return seedItemId ? [seedItemId] : [];
  });
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState<string>('Everyday');

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const persist = (asWorn = false) => {
    if (selected.length < 2) {
      showAlert(
        'Add more items',
        'Select clothes you normally wear together so ClosetMatch can learn your style.'
      );
      return;
    }
    const outfit = saveOutfit({
      name: name.trim() || `${occasion} outfit`,
      itemIds: selected,
      occasion,
      status: asWorn ? 'worn' : 'saved',
    });
    if (asWorn) markOutfitWorn(outfit.id, { occasion, rating: 4 });
    router.replace(`/outfits/${outfit.id}`);
  };

  return (
    <ScreenShell scroll>
      {isWeb ? null : <Button title="Back" variant="ghost" onPress={() => router.back()} />}
      <Text style={[styles.title, { color: theme.ink }]}>Outfit builder</Text>
      <Text style={[styles.sub, { color: theme.inkMuted }]}>
        Select clothes you normally wear together. ClosetMatch will use these examples to learn your style.
      </Text>

      <TextField label="Outfit name" value={name} onChangeText={setName} placeholder="Everyday hoodie fit" />

      <Text style={[styles.label, { color: theme.inkMuted }]}>Starter category</Text>
      <View style={styles.chips}>
        {STARTER_OUTFIT_CATEGORIES.map((c) => (
          <Chip key={c} label={c} selected={occasion === c} onPress={() => setOccasion(c)} />
        ))}
      </View>

      <Text style={[styles.label, { color: theme.ink, marginTop: 12 }]}>Selected ({selected.length})</Text>
      {available.length === 0 ? (
        <EmptyState
          title="No available clothes"
          message="Everything may be in laundry. Mark items clean, or add more to your closet."
          actionLabel="Open laundry"
          onAction={() => router.push('/laundry')}
        />
      ) : (
        <View style={styles.pickGrid}>
          {available.map((item) => {
            const on = selected.includes(item.id);
            return (
              <View
                key={item.id}
                style={[
                  styles.pick,
                  {
                    borderColor: on ? theme.accent : 'transparent',
                    flexBasis: wide ? '23%' : '47%',
                  },
                ]}
              >
                <ClothingCard item={item} compact onPress={() => toggle(item.id)} />
              </View>
            );
          })}
        </View>
      )}

      <View style={{ gap: 10, marginTop: 20, maxWidth: 420 }}>
        <Button title="Save outfit" onPress={() => persist(false)} />
        <Button title="Save & mark worn" variant="secondary" onPress={() => persist(true)} />
        <Button
          title="Schedule for tomorrow"
          variant="ghost"
          onPress={() => {
            if (selected.length < 2) {
              showAlert('Add more items', 'Select at least two pieces before scheduling an outfit.');
              return;
            }
            const outfit = saveOutfit({
              name: name.trim() || `${occasion} planned`,
              itemIds: selected,
              occasion,
            });
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            planOutfit(outfit.id, tomorrow.toISOString().slice(0, 10), occasion);
            router.replace('/outfits/planned');
          }}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.hero },
  sub: { ...typography.body, marginBottom: 8 },
  label: { ...typography.label, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pick: {
    flexGrow: 1,
    borderWidth: 2,
    borderRadius: 18,
    overflow: 'hidden',
  },
});
