import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radii, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import type { OutfitCandidate } from '@/types';
import { Button } from '@/components/ui/Button';

export function RecommendationCard({
  candidate,
  index,
  onSave,
  onWear,
  onReject,
  onReplace,
  onMirrorCheck,
}: {
  candidate: OutfitCandidate;
  index: number;
  onSave?: () => void;
  onWear?: () => void;
  onReject?: () => void;
  onReplace?: () => void;
  onMirrorCheck?: () => void;
}) {
  const theme = useTheme();
  const scorePct = Math.round(candidate.total_score * 100);

  return (
    <View
      style={[styles.card, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
      accessibilityLabel={`Outfit recommendation ${index + 1}, match score ${scorePct} percent`}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.ink }]}>
          Suggestion {index + 1}
        </Text>
        <View style={[styles.score, { backgroundColor: theme.accentSoft }]}>
          <Text style={[styles.scoreText, { color: theme.accentDeep }]}>
            {scorePct}% match
          </Text>
        </View>
      </View>

      <View style={styles.items}>
        {candidate.items.map((slot) => (
          <View key={slot.clothing_item.id} style={[styles.itemChip, { borderColor: theme.border }]}>
            <Text style={[styles.role, { color: theme.inkSoft }]}>{slot.role}</Text>
            <Text style={[styles.itemName, { color: theme.ink }]}>
              {slot.clothing_item.name}
            </Text>
          </View>
        ))}
      </View>

      <Text style={[styles.summary, { color: theme.inkMuted }]}>
        {candidate.explanation.summary}
      </Text>
      {candidate.explanation.reasons.slice(0, 3).map((r) => (
        <Text key={r} style={[styles.reason, { color: theme.inkSoft }]}>
          · {r}
        </Text>
      ))}

      <View style={styles.actions}>
        {onWear ? <Button title="Wear today" onPress={onWear} style={styles.btn} /> : null}
        {onSave ? (
          <Button title="Save" variant="secondary" onPress={onSave} style={styles.btn} />
        ) : null}
      </View>
      <View style={styles.row}>
        {onReplace ? (
          <Pressable onPress={onReplace} accessibilityRole="button">
            <Text style={{ color: theme.accent, ...typography.label }}>Replace item</Text>
          </Pressable>
        ) : null}
        {onMirrorCheck ? (
          <Pressable onPress={onMirrorCheck} accessibilityRole="button">
            <Text style={{ color: theme.accent, ...typography.label }}>Mirror Check</Text>
          </Pressable>
        ) : null}
        {onReject ? (
          <Pressable onPress={onReject} accessibilityRole="button">
            <Text style={{ color: theme.danger, ...typography.label }}>Reject</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 16,
    gap: 8,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { ...typography.subtitle },
  score: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },
  scoreText: { ...typography.caption, fontFamily: 'DMSans_700Bold' },
  items: { gap: 6, marginTop: 4 },
  itemChip: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 10,
  },
  role: { ...typography.caption, textTransform: 'capitalize' },
  itemName: { ...typography.label },
  summary: { ...typography.body, marginTop: 4 },
  reason: { ...typography.caption },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btn: { flex: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
});
