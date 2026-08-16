import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="privacy" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="weather" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="export" />
      <Stack.Screen name="system-status" />
    </Stack>
  );
}
