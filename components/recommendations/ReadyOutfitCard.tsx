import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { radii, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { useAppStore } from '@/stores/app-store';
import type { Outfit } from '@/types';

export function ReadyOutfitCard({
  outfit,
  onWear,
  onOpen,
}: {
  outfit: Outfit;
  onWear?: () => void;
  onOpen?: () => void;
}) {
  const theme = useTheme();
  const { wide } = useWebLayout();
  const clothingItems = useAppStore((s) => s.clothingItems);
  const pieces = (outfit.items ?? []).map((piece) => ({
    ...piece,
    clothing_item:
      piece.clothing_item ?? clothingItems.find((c) => c.id === piece.clothing_item_id),
  }));

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.bgElevated,
          borderColor: theme.border,
          flexBasis: wide ? 280 : '100%',
          maxWidth: wide ? 360 : '100%',
        },
      ]}
    >
      <Pressable onPress={onOpen} accessibilityRole="button">
        <Text style={{ ...typography.caption, color: theme.accent }}>Ready look</Text>
        <Text style={{ ...typography.subtitle, color: theme.ink, marginTop: 4 }}>{outfit.name}</Text>
        <View style={styles.thumbs}>
          {pieces.slice(0, 4).map((piece) => {
            const item = piece.clothing_item;
            const uri = item?.primary_image_url;
            return (
              <View
                key={piece.id}
                style={[styles.thumb, { borderColor: theme.border, backgroundColor: theme.accentSoft }]}
              >
                {uri ? (
                  <Image source={{ uri }} style={styles.thumbImage} />
                ) : (
                  <LinearGradient colors={[theme.heroGlow, theme.accentSoft]} style={styles.thumbImage}>
                    <Text style={{ color: theme.accentDeep, fontFamily: 'DMSans_700Bold' }}>
                      {(item?.primary_color ?? '?').slice(0, 1).toUpperCase()}
                    </Text>
                  </LinearGradient>
                )}
              </View>
            );
          })}
        </View>
        <Text style={{ ...typography.caption, color: theme.inkMuted, marginTop: 8 }} numberOfLines={2}>
          {pieces.map((p) => p.clothing_item?.name ?? 'Item').join(' · ')}
        </Text>
      </Pressable>
      {onWear ? (
        <Button title="Wear today" onPress={onWear} style={{ marginTop: 10, minHeight: 44 }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 14,
    gap: 8,
    flexGrow: 1,
  },
  thumbs: { flexDirection: 'row', gap: 8, marginTop: 10 },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  thumbImage: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
});
