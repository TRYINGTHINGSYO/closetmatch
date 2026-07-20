import { Alert, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
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
            Alert.alert(
              'Demo mode',
              'Password reset requires Supabase Auth. Configure EXPO_PUBLIC_SUPABASE_URL to enable.'
            )
          }
        />
        <Button title="Back to sign in" variant="ghost" onPress={() => router.back()} style={{ marginTop: 8 }} />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 24 },
  title: { ...typography.hero, marginTop: 24 },
  sub: { ...typography.body, marginTop: 8 },
});
