import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { showAlert } from '@/lib/ui/alert';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <ScreenShell scroll maxWidth={480}>
      <Text style={[styles.title, { color: theme.ink }]}>Reset password</Text>
      <Text style={[styles.sub, { color: theme.inkMuted }]}>
        When Supabase Auth is connected, a magic reset link is emailed to you.
      </Text>
      <TextField
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ marginTop: 24 }}
      />
      <Button
        title="Send reset link"
        onPress={() =>
          showAlert(
            'Demo mode',
            'Password reset requires Supabase Auth. Configure EXPO_PUBLIC_SUPABASE_URL to enable.'
          )
        }
      />
      <Button title="Back to sign in" variant="ghost" onPress={() => router.back()} style={{ marginTop: 8 }} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.hero, marginTop: 8 },
  sub: { ...typography.body, marginTop: 8 },
});
