import { Stack } from 'expo-router';

export default function OutfitsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="builder" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="recommendations" />
      <Stack.Screen name="history" />
      <Stack.Screen name="planned" />
    </Stack>
  );
}
