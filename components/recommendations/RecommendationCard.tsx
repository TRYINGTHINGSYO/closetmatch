import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { OutfitCollage, type OutfitCollagePiece } from '@/components/outfit/OutfitCollage';
import { radii, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { itemSummaryLine, outfitDisplayName } from '@/lib/outfits/display-name';
import { conciseOutfitReason } from '@/lib/outfits/reason';
import type { OutfitCandidate } from '@/types';

export function RecommendationCard({
  candidate,
  occasion,
  feelsLike,
  temperatureUnit,
  weatherCondition,
  onSave,
  onWear,
  onReject,
  onReplace,
  onMirrorCheck,
}: {
  candidate: OutfitCandidate;
  occasion?: string | null;
  feelsLike?: number | null;
  temperatureUnit?: 'f' | 'c';
  weatherCondition?: string | null;
  onSave?: () => void;
  onWear?: () => void;
  onReject?: () => void;
  onReplace?: () => void;
  onMirrorCheck?: () => void;
}) {
  const theme = useTheme();
  const { compact } = useWebLayout();
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
  const scorePct = Math.round(candidate.total_score * 100);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.bgElevated,
          borderColor: theme.border,
          flexBasis: compact ? '100%' : 340,
        },
      ]}
      accessibilityLabel={`Fresh look, ${title}, ${scorePct} percent match`}
    >
      <OutfitCollage pieces={pieces} size="fresh" />
      <View style={styles.meta}>
        <Text style={{ ...typography.caption, color: theme.inkSoft }}>Fresh</Text>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.ink, flex: 1 }]}>{title}</Text>
          <Text style={{ ...typography.caption, color: theme.inkSoft }}>{scorePct}%</Text>
        </View>
        <Text style={{ ...typography.body, color: theme.inkMuted }}>{reason}</Text>
        <Text style={{ ...typography.caption, color: theme.inkSoft }}>{itemSummaryLine(items)}</Text>
        <View style={styles.actions}>
          {onWear ? <Button title="Wear today" onPress={onWear} style={styles.btn} /> : null}
          {onSave ? <Button title="Save" variant="secondary" onPress={onSave} style={styles.btn} /> : null}
        </View>
        <View style={styles.row}>
          {onReplace ? (
            <Pressable onPress={onReplace} accessibilityRole="button">
              <Text style={{ color: theme.inkMuted, ...typography.label }}>Replace</Text>
            </Pressable>
          ) : null}
          {onMirrorCheck ? (
            <Pressable onPress={onMirrorCheck} accessibilityRole="button">
              <Text style={{ color: theme.inkMuted, ...typography.label }}>Mirror Check</Text>
            </Pressable>
          ) : null}
          {onReject ? (
            <Pressable onPress={onReject} accessibilityRole="button">
              <Text style={{ color: theme.danger, ...typography.label }}>Reject</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.lg,
    overflow: 'hidden',
    flexGrow: 1,
    maxWidth: '100%',
  },
  meta: { padding: 16, gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  title: { ...typography.subtitle, fontFamily: 'DMSans_700Bold' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  btn: { flex: 1, minHeight: 44 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 12,
  },
});
