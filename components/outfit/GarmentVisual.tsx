import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { garmentPalette } from '@/lib/clothing/colors';
import { garmentKind } from '@/lib/clothing/garment-kind';
import type { ClothingItem, OutfitRole } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { GarmentShape } from './GarmentShape';

export function GarmentVisual({
  item,
  role,
  label,
  framed = true,
}: {
  item: Pick<
    ClothingItem,
    'name' | 'category' | 'subcategory' | 'primary_color' | 'secondary_colors' | 'sleeve_length' | 'primary_image_url'
  >;
  role?: OutfitRole | string | null;
  label?: string;
  /** Clothing cards keep a tile. Collages stay unframed so the flat-lay can read as one composition. */
  framed?: boolean;
}) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  const uri = item.primary_image_url?.trim() || null;
  const showPhoto = Boolean(uri) && !failed;
  const kind = garmentKind(item, role);
  const palette = garmentPalette(item.primary_color, item.secondary_colors?.[0]);
  const knockout = framed ? theme.heroGlow : theme.bg;

  return (
    <View
      style={[styles.stage, framed && { backgroundColor: theme.heroGlow, borderRadius: 16 }]}
      accessibilityLabel={label ?? `${item.primary_color} ${item.subcategory || item.name}`}
    >
      {showPhoto ? (
        <Image
          source={{ uri: uri as string }}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          recyclingKey={uri ?? item.name}
          onError={() => setFailed(true)}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={framed ? styles.fallbackFramed : styles.fallbackBare} importantForAccessibility="no-hide-descendants">
          <GarmentShape kind={kind} palette={palette} knockout={knockout} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackFramed: {
    width: '86%',
    height: '86%',
  },
  fallbackBare: {
    width: '100%',
    height: '100%',
  },
});
