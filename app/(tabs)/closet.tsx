import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ClothingCard } from '@/components/clothing/ClothingCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Chip } from '@/components/ui/Chip';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { CLOTHING_CATEGORIES } from '@/constants';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { useAppStore } from '@/stores/app-store';
import type { ClothingCategory } from '@/types';

type FilterKey = 'all' | ClothingCategory | 'favorite' | 'dirty' | 'never';

export default function ClosetScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { closetColumns } = useWebLayout();
  const clothingItems = useAppStore((s) => s.clothingItems);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sort, setSort] = useState<'recent' | 'worn' | 'name'>('recent');

  const filtered = useMemo(() => {
    let list = [...clothingItems].filter((c) => !c.archived_at);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.primary_color.toLowerCase().includes(q) ||
          c.brand?.toLowerCase().includes(q) ||
          c.subcategory.toLowerCase().includes(q)
      );
    }
    if (filter === 'favorite') list = list.filter((c) => c.favorite);
    else if (filter === 'dirty')
      list = list.filter((c) => ['dirty', 'in_laundry', 'drying'].includes(c.availability_status));
    else if (filter === 'never') list = list.filter((c) => c.never_worn || c.wear_count === 0);
    else if (filter !== 'all') list = list.filter((c) => c.category === filter);

    list.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'worn') return b.wear_count - a.wear_count;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [clothingItems, query, filter, sort]);

  return (
    <ScreenShell>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.ink }]}>Closet</Text>
        <Pressable onPress={() => router.push('/clothing/capture')} accessibilityRole="button">
          <Text style={{ color: theme.accent, ...typography.label }}>Add</Text>
        </Pressable>
      </View>
      <TextInput
        accessibilityLabel="Search closet"
        placeholder="Search colors, brands, categories…"
        placeholderTextColor={theme.inkSoft}
        value={query}
        onChangeText={setQuery}
        style={[
          styles.search,
          { backgroundColor: theme.bgElevated, borderColor: theme.border, color: theme.ink },
        ]}
      />
      <View style={styles.filters}>
        {(
          [
            ['all', 'All'],
            ['top', 'Tops'],
            ['bottom', 'Bottoms'],
            ['shoes', 'Shoes'],
            ['outerwear', 'Outerwear'],
            ['favorite', 'Favorites'],
            ['dirty', 'Dirty'],
            ['never', 'Never worn'],
          ] as const
        ).map(([key, label]) => (
          <Chip key={key} label={label} selected={filter === key} onPress={() => setFilter(key)} />
        ))}
      </View>
      <View style={styles.sortRow}>
        <Text style={{ ...typography.caption, color: theme.inkSoft }}>
          {filtered.length} items · {Object.keys(CLOTHING_CATEGORIES).length} categories
        </Text>
        <Pressable
          onPress={() => setSort((s) => (s === 'recent' ? 'worn' : s === 'worn' ? 'name' : 'recent'))}
        >
          <Text style={{ ...typography.label, color: theme.accent }}>
            Sort: {sort === 'recent' ? 'Newest' : sort === 'worn' ? 'Most worn' : 'Name'}
          </Text>
        </Pressable>
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          title="No clothes added yet"
          message="Photograph your first item to start building your digital closet."
          actionLabel="Photograph clothing"
          onAction={() => router.push('/clothing/capture')}
        />
      ) : (
        <FlatList
          key={String(closetColumns)}
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={closetColumns}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40, gap: 10 }}
          columnWrapperStyle={closetColumns > 1 ? { gap: 10 } : undefined}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <ClothingCard item={item} onPress={() => router.push(`/clothing/${item.id}`)} />
            </View>
          )}
        />
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
  search: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...typography.body,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 12,
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});
