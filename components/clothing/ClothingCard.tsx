import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AVAILABILITY_LABELS } from '@/constants';
import { radii, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import type { ClothingItem } from '@/types';
import { GarmentVisual } from '@/components/outfit/GarmentVisual';

export function ClothingCard({
  item,
  onPress,
  compact,
}: {
  item: ClothingItem;
  onPress?: () => void;
  compact?: boolean;
}) {
  const theme = useTheme();
  const unavailable = item.availability_status !== 'available';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.primary_color} ${item.category}, ${AVAILABILITY_LABELS[item.availability_status]}`}
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
    >
      <View style={[styles.imageWrap, compact && styles.imageCompact]}>
        <GarmentVisual item={item} />
        {item.favorite ? (
          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <Text style={styles.badgeText}>★</Text>
          </View>
        ) : null}
        {unavailable ? (
          <View style={[styles.status, { backgroundColor: theme.warning }]}>
            <Text style={styles.statusText}>
              {AVAILABILITY_LABELS[item.availability_status]}
            </Text>
          </View>
        ) : null}
      </View>
      <Text numberOfLines={1} style={[styles.name, { color: theme.ink }]}>
        {item.name}
      </Text>
      <Text numberOfLines={1} style={[styles.meta, { color: theme.inkMuted }]}>
        {item.primary_color} · {item.subcategory}
      </Text>
      {item.last_worn_at ? (
        <Text style={[styles.worn, { color: theme.inkSoft }]}>
          Last worn {new Date(item.last_worn_at).toLocaleDateString()}
        </Text>
      ) : (
        <Text style={[styles.worn, { color: theme.inkSoft }]}>Never worn</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 10,
  },
  imageWrap: {
    height: 140,
    position: 'relative',
  },
  imageCompact: { height: 100 },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 14 },
  status: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { color: '#fff', fontSize: 11, fontFamily: 'DMSans_700Bold' },
  name: {
    ...typography.label,
    marginTop: 8,
    marginHorizontal: 10,
  },
  meta: {
    ...typography.caption,
    marginHorizontal: 10,
    textTransform: 'capitalize',
  },
  worn: {
    ...typography.caption,
    marginHorizontal: 10,
    marginTop: 2,
  },
});
