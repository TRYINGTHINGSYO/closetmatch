import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';
import { showAlert } from '@/lib/ui/alert';

export default function ClothingEditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const item = useAppStore((s) => s.clothingItems.find((c) => c.id === id));
  const updateClothingItem = useAppStore((s) => s.updateClothingItem);
  const [name, setName] = useState(item?.name ?? '');
  const [color, setColor] = useState(item?.primary_color ?? '');
  const [brand, setBrand] = useState(item?.brand ?? '');
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [price, setPrice] = useState(item?.price_paid != null ? String(item.price_paid) : '');

  if (!item) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
        <Text style={[styles.title, { color: theme.ink }]}>Edit item</Text>
        <Text style={{ ...typography.body, color: theme.inkMuted, marginBottom: 16 }}>
          Open an item from your closet to edit its name, color, brand, and purchase price.
        </Text>
        <Button title="Back to closet" onPress={() => router.push('/(tabs)/closet')} />
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Button title="Back" variant="ghost" onPress={() => router.back()} />
          <Text style={[styles.title, { color: theme.ink }]}>Edit {item.name}</Text>
          <TextField label="Name" value={name} onChangeText={setName} />
          <TextField label="Primary color" value={color} onChangeText={setColor} />
          <TextField label="Brand" value={brand} onChangeText={setBrand} />
          <TextField
            label="Purchase price"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
          <TextField label="Notes" value={notes} onChangeText={setNotes} />
          <Button
            title="Save changes"
            style={{ marginTop: 12 }}
            onPress={() => {
              if (!name.trim()) {
                showAlert('Name required', 'Give this item a name.');
                return;
              }
              const parsedPrice = price.trim() ? Number(price) : null;
              updateClothingItem(item.id, {
                name: name.trim(),
                primary_color: color.trim() || item.primary_color,
                brand: brand.trim() || null,
                notes: notes.trim() || null,
                price_paid: parsedPrice != null && !Number.isNaN(parsedPrice) ? parsedPrice : null,
              });
              router.replace(`/clothing/${item.id}`);
            }}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 24 },
  content: { padding: 20, gap: 10, paddingBottom: 48 },
  title: { ...typography.hero, marginBottom: 8 },
});
