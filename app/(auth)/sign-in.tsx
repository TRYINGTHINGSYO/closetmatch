import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';
import { signInSchema } from '@/lib/validation/forms';
import { showAlert } from '@/lib/ui/alert';

export default function SignInScreen() {
  const theme = useTheme();
  const router = useRouter();
  const signIn = useAppStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const onSubmit = async () => {
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as 'email' | 'password';
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e) {
      showAlert('Sign in failed', e instanceof Error ? e.message : 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell scroll maxWidth={480}>
      <Text style={[styles.title, { color: theme.ink }]}>Welcome back</Text>
      <Text style={[styles.sub, { color: theme.inkMuted }]}>Sign in to your ClosetMatch closet.</Text>
      <View style={{ marginTop: 24 }}>
        <TextField
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
        />
        <TextField
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />
        <Link href="/(auth)/forgot-password" asChild>
          <Pressable>
            <Text style={{ color: theme.accent, ...typography.label, marginBottom: 16 }}>Forgot password?</Text>
          </Pressable>
        </Link>
        <Button title="Sign in" loading={loading} onPress={onSubmit} />
        <Button
          title="Create account"
          variant="ghost"
          onPress={() => router.push('/(auth)/sign-up')}
          style={{ marginTop: 8 }}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.hero, marginTop: 8 },
  sub: { ...typography.body, marginTop: 8 },
});
