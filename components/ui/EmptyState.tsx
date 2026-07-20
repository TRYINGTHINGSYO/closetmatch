import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Button } from './Button';

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.inkMuted }]}>{message}</Text>
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} style={{ marginTop: 16 }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  title: { ...typography.title, textAlign: 'center' },
  message: { ...typography.body, textAlign: 'center' },
});
