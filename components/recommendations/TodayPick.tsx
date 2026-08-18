import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { OutfitCollage, type OutfitCollagePiece } from '@/components/outfit/OutfitCollage';
import { radii, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { itemSummaryLine, outfitDisplayName } from '@/lib/outfits/display-name';
import { conciseOutfitReason } from '@/lib/outfits/reason';
import type { OutfitCandidate } from '@/types';

export function TodayPick({
  candidate,
  occasion,
  feelsLike,
  temperatureUnit,
  weatherCondition,
  onWear,
  onSave,
  onDetails,
}: {
  candidate: OutfitCandidate;
  occasion?: string | null;
  feelsLike?: number | null;
  temperatureUnit?: 'f' | 'c';
  weatherCondition?: string | null;
  onWear?: () => void;
  onSave?: () => void;
  onDetails?: () => void;
}) {
  const theme = useTheme();
  const { wide } = useWebLayout();
  const items = candidate.items.map((slot) => slot.clothing_item);
  const title = outfitDisplayName({
    items,
    occasion,
    feelsLike,
    temperatureUnit,
    weatherCondition,
  });
  const reason = conciseOutfitReason({
    explanation: candidate.explanation,
    items,
    feelsLike,
    temperatureUnit,
  });
  const pieces: OutfitCollagePiece[] = candidate.items.map((slot) => ({
    id: slot.clothing_item.id,
    role: slot.role,
    clothing_item: slot.clothing_item,
  }));

  return (
    <View style={styles.block}>
      <Text style={[styles.kicker, { color: theme.inkSoft }]}>Today’s pick</Text>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.bgElevated,
            borderColor: theme.border,
            flexDirection: wide ? 'row' : 'column',
          },
        ]}
      >
        <View style={[styles.visual, wide && styles.visualWide, !wide && styles.visualCompact]}>
          <OutfitCollage pieces={pieces} size="hero" />
        </View>
        <View style={[styles.meta, wide && styles.metaWide]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.ink, flex: 1 }]}>{title}</Text>
            {onSave ? (
              <Pressable onPress={onSave} accessibilityRole="button" accessibilityLabel="Save look">
                <Text style={{ color: theme.accent, fontSize: 22, padding: 8 }}>♡</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={[styles.reason, { color: theme.inkMuted }]}>{reason}</Text>
          <Text style={[styles.summary, { color: theme.inkSoft }]}>{itemSummaryLine(items)}</Text>
          <View style={styles.actions}>
            {onWear ? <Button title="Wear today" onPress={onWear} style={styles.wear} /> : null}
            {onDetails ? (
              <Pressable onPress={onDetails} accessibilityRole="button" style={styles.details}>
                <Text style={{ ...typography.label, color: theme.inkMuted }}>Details</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 10, marginTop: 12 },
  kicker: {
    ...typography.caption,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  visual: { width: '100%' },
  visualWide: { flex: 1.7, minWidth: 0 },
  visualCompact: { minHeight: 0 },
  meta: {
    flex: 1,
    minWidth: 0,
    padding: 22,
    gap: 10,
    justifyContent: 'center',
  },
  metaWide: { flex: 0.85, paddingVertical: 28 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  title: { ...typography.hero, fontSize: 26, lineHeight: 32 },
  reason: { ...typography.body },
  summary: { ...typography.caption },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  wear: { minWidth: 160 },
  details: { minHeight: 44, justifyContent: 'center' },
});
