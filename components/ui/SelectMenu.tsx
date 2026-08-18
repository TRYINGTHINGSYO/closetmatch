import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { radii, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export function SelectMenu({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { id: string; label: string }[];
  onChange: (id: string) => void;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value)?.label ?? label;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${selected}`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Text style={{ ...typography.caption, color: theme.inkSoft }}>{label}</Text>
        <Text style={{ ...typography.label, color: theme.ink }}>
          {selected} ▾
        </Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Close menu">
          <Pressable
            style={[styles.sheet, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
            onPress={() => undefined}
          >
            <Text style={{ ...typography.caption, color: theme.inkSoft, marginBottom: 8 }}>{label}</Text>
            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              {options.map((option) => {
                const isSelected = option.id === value;
                return (
                  <Pressable
                    key={option.id || 'default'}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      onChange(option.id);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && { backgroundColor: theme.accentSoft },
                      { opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <Text
                      style={{
                        ...typography.body,
                        color: theme.ink,
                        fontFamily: isSelected ? 'DMSans_700Bold' : 'DMSans_400Regular',
                      }}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: 4,
    paddingRight: 8,
    gap: 2,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    maxHeight: 420,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  list: { maxHeight: 360 },
  option: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: radii.sm,
  },
});
