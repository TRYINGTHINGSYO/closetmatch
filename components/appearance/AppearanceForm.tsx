import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { TextField } from '@/components/ui/TextField';
import {
  APPEARANCE_MODES,
  BACKGROUND_STYLES,
  COLOR_THEMES,
  DEFAULT_APPEARANCE,
  normalizeHex,
  resolveAccent,
} from '@/constants/appearance';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { showAlert } from '@/lib/ui/alert';
import { useAppStore } from '@/stores/app-store';

export function AppearanceForm() {
  const theme = useTheme();
  const appearance = useAppStore((s) => s.appearance);
  const updateAppearance = useAppStore((s) => s.updateAppearance);
  const resetAppearance = useAppStore((s) => s.resetAppearance);
  const [hexDraft, setHexDraft] = useState(appearance.accentColor ?? resolveAccent(appearance));

  const pickBackground = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert('Photo permission needed', 'Allow photo access to use your own background.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      allowsEditing: true,
      aspect: [9, 16],
    });
    if (!result.canceled && result.assets[0]) {
      updateAppearance({
        backgroundStyle: 'photo',
        backgroundImageUri: result.assets[0].uri,
      });
    }
  };

  const applyCustomHex = () => {
    const hex = normalizeHex(hexDraft);
    if (!hex) {
      showAlert('Need a color code', 'Use a hex color like #C45C6A or C45.');
      return;
    }
    setHexDraft(hex);
    updateAppearance({ colorTheme: 'custom', accentColor: hex });
  };

  return (
    <View style={{ gap: 14 }}>
      <View style={[styles.preview, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
        <Text style={{ ...typography.caption, color: theme.inkSoft }}>Preview</Text>
        <Text style={{ ...typography.subtitle, color: theme.ink }}>Your closet, your colors</Text>
        <View style={styles.previewRow}>
          <View style={[styles.swatch, { backgroundColor: theme.accent }]} />
          <View style={[styles.swatch, { backgroundColor: theme.accentSoft, borderWidth: 1, borderColor: theme.border }]} />
          <View style={[styles.iconPreview, { borderColor: theme.accent }]}>
            <Text style={{ color: theme.accent, fontSize: 22, fontWeight: '700' }}>⌂</Text>
          </View>
        </View>
        <Text style={{ ...typography.caption, color: theme.inkMuted }}>
          Icons, buttons, and highlights follow this accent. Backgrounds stay readable.
        </Text>
      </View>

      <Text style={[styles.section, { color: theme.ink }]}>Light or dark</Text>
      <View style={styles.wrap}>
        {APPEARANCE_MODES.map((mode) => (
          <Chip
            key={mode.id}
            label={mode.label}
            selected={appearance.mode === mode.id}
            onPress={() => updateAppearance({ mode: mode.id })}
          />
        ))}
      </View>

      <Text style={[styles.section, { color: theme.ink }]}>Icon & button color</Text>
      <View style={styles.palette}>
        {COLOR_THEMES.filter((t) => t.id !== 'custom').map((item) => {
          const selected = appearance.colorTheme === item.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected }}
              onPress={() => {
                setHexDraft(item.accent);
                updateAppearance({ colorTheme: item.id, accentColor: item.accent });
              }}
              style={[
                styles.colorDotWrap,
                { borderColor: selected ? theme.ink : 'transparent' },
              ]}
            >
              <View style={[styles.colorDot, { backgroundColor: item.accent }]} />
              <Text style={{ ...typography.caption, color: theme.inkMuted }}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <TextField
        label="Custom hex color"
        autoCapitalize="none"
        autoCorrect={false}
        value={hexDraft}
        onChangeText={setHexDraft}
        placeholder="#1F7A6B"
      />
      <Button
        title="Use this color"
        variant="secondary"
        onPress={applyCustomHex}
      />

      <Text style={[styles.section, { color: theme.ink }]}>Background</Text>
      <View style={{ gap: 8 }}>
        {BACKGROUND_STYLES.map((item) => {
          const selected = appearance.backgroundStyle === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                if (item.id === 'photo') {
                  if (appearance.backgroundImageUri) {
                    updateAppearance({ backgroundStyle: 'photo' });
                    return;
                  }
                  void pickBackground();
                  return;
                }
                updateAppearance({ backgroundStyle: item.id });
              }}
              style={[
                styles.bgCard,
                {
                  borderColor: selected ? theme.accent : theme.border,
                  backgroundColor: selected ? theme.accentSoft : theme.bgElevated,
                },
              ]}
            >
              <Text style={{ ...typography.label, color: theme.ink }}>{item.label}</Text>
              <Text style={{ ...typography.caption, color: theme.inkMuted }}>{item.detail}</Text>
            </Pressable>
          );
        })}
      </View>

      {appearance.backgroundStyle === 'photo' ? (
        <Button title="Choose a different photo" variant="ghost" onPress={() => void pickBackground()} />
      ) : null}

      <Button
        title="Reset to ClosetMatch default"
        variant="ghost"
        onPress={() => {
          setHexDraft(resolveAccent(DEFAULT_APPEARANCE));
          resetAppearance();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  swatch: { width: 36, height: 36, borderRadius: 18 },
  iconPreview: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { ...typography.subtitle, marginTop: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorDotWrap: {
    alignItems: 'center',
    gap: 6,
    padding: 4,
    borderRadius: 16,
    borderWidth: 2,
    minWidth: 64,
  },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  bgCard: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 2 },
});
