import { Stack } from 'expo-router';

export default function MirrorCheckLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="consent" />
      <Stack.Screen name="capture" />
      <Stack.Screen name="processing" />
      <Stack.Screen name="result" />
      <Stack.Screen name="history" />
    </Stack>
  );
}
