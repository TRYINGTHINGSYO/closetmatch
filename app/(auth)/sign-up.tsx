import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/app-store';
import { signUpSchema } from '@/lib/validation/forms';
import { showAlert } from '@/lib/ui/alert';

export default function SignUpScreen() {
  const theme = useTheme();
  const router = useRouter();
  const signUp = useAppStore((s) => s.signUp);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const parsed = signUpSchema.safeParse({ email, password, displayName });
    if (!parsed.success) {
      showAlert('Check your details', parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
      router.replace('/(onboarding)/profile');
    } catch (e) {
      showAlert('Sign up failed', e instanceof Error ? e.message : 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <Text style={[styles.title, { color: theme.ink }]}>Create your closet</Text>
        <Text style={[styles.sub, { color: theme.inkMuted }]}>
          Your clothes stay private. ClosetMatch learns only from your choices.
        </Text>
        <View style={{ marginTop: 24 }}>
          <TextField label="Display name" value={displayName} onChangeText={setDisplayName} />
          <TextField
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Continue" loading={loading} onPress={onSubmit} />
          <Button
            title="I already have an account"
            variant="ghost"
            onPress={() => router.push('/(auth)/sign-in')}
            style={{ marginTop: 8 }}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 24 },
  title: { ...typography.hero, marginTop: 24 },
  sub: { ...typography.body, marginTop: 8 },
});
