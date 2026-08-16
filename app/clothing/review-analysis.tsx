import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { ChipGroup } from '@/components/ui/Chip';
import { CLOTHING_CATEGORIES } from '@/constants';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';
import { showAlert } from '@/lib/ui/alert';
import type { ClothingCategory } from '@/types';

export default function ReviewAnalysisScreen() {
  const theme = useTheme();
  const router = useRouter();
  const addClothingItem = useAppStore((s) => s.addClothingItem);
  const pending = useAppStore((s) => s.pendingClothingReview);
  const setPendingClothingReview = useAppStore((s) => s.setPendingClothingReview);
  const analysis = pending?.analysis ?? null;

  const [name, setName] = useState(analysis?.name_suggestion ?? '');
  const [category, setCategory] = useState<ClothingCategory>(
    (analysis?.category as ClothingCategory) ?? 'top'
  );
  const [subcategory, setSubcategory] = useState(analysis?.subcategory ?? 'T-shirt');
  const [color, setColor] = useState(analysis?.primary_color ?? 'black');
  const [brand, setBrand] = useState(analysis?.brand_guess ?? '');
  const [fit, setFit] = useState(analysis?.fit ?? '');
  const [material, setMaterial] = useState(analysis?.material_guess?.[0] ?? '');
  const uncertain = analysis?.needs_user_review ?? [];

  const save = () => {
    if (!name.trim()) {
      showAlert('Name required', 'Give this item a name before saving.');
      return;
    }
    const item = addClothingItem({
      name: name.trim(),
      category,
      subcategory,
      primary_color: color.trim() || 'unknown',
      brand: brand || null,
      fit: fit || null,
      material: material || null,
      style_tags: analysis?.style_tags ?? [],
      season_tags: analysis?.season_tags ?? [],
      occasion_tags: analysis?.occasion_tags ?? [],
      warmth_score: analysis?.warmth_score ?? 3,
      formality_score: analysis?.formality_score ?? 2,
      primary_image_url: pending?.imageUri || null,
      ai_metadata: analysis ? { ...analysis } : {},
      ai_confidence: analysis?.confidence ?? {},
      needs_review_fields: uncertain,
      user_corrected_fields: analysis ? ['reviewed'] : [],
    });
    setPendingClothingReview(null);
    router.replace(`/clothing/${item.id}`);
  };

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: theme.ink }]}>Review details</Text>
          <Text style={[styles.sub, { color: theme.inkMuted }]}>
            AI suggestions are editable. Uncertain fields are highlighted — never treat classification as guaranteed.
          </Text>
          {uncertain.length > 0 ? (
            <Text style={{ ...typography.caption, color: theme.warning }}>
              Needs review: {uncertain.join(', ')}
            </Text>
          ) : null}

          <TextField label="Name" value={name} onChangeText={setName} />
          <Text style={[styles.label, { color: theme.inkMuted }]}>Category</Text>
          <ChipGroup
            options={Object.keys(CLOTHING_CATEGORIES)}
            selected={[category]}
            onToggle={(v) => {
              setCategory(v as ClothingCategory);
              setSubcategory(CLOTHING_CATEGORIES[v as ClothingCategory].subcategories[0]);
            }}
            multi={false}
          />
          <Text style={[styles.label, { color: theme.inkMuted, marginTop: 12 }]}>Subcategory</Text>
          <ChipGroup
            options={CLOTHING_CATEGORIES[category].subcategories}
            selected={[subcategory]}
            onToggle={setSubcategory}
            multi={false}
          />
          <TextField label="Primary color" value={color} onChangeText={setColor} />
          <TextField label="Brand" value={brand} onChangeText={setBrand} />
          <TextField label="Fit" value={fit} onChangeText={setFit} />
          <TextField label="Material" value={material} onChangeText={setMaterial} />

          <View style={{ gap: 10, marginTop: 16 }}>
            <Button title="Save to closet" onPress={save} />
            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => {
                setPendingClothingReview(null);
                router.back();
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 10, paddingBottom: 48 },
  title: { ...typography.hero },
  sub: { ...typography.body, marginBottom: 8 },
  label: { ...typography.label, marginBottom: 8 },
});
