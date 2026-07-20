import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { radii, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, style, ...rest }: TextFieldProps) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.inkMuted }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.inkSoft}
        style={[
          styles.input,
          {
            backgroundColor: theme.bgElevated,
            borderColor: error ? theme.danger : theme.border,
            color: theme.ink,
          },
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginBottom: 14 },
  label: { ...typography.label },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 52,
  },
  error: { ...typography.caption },
});
