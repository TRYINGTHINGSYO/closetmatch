import { Stack } from 'expo-router';

export default function ClothingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="capture" />
      <Stack.Screen name="review-analysis" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="edit" />
    </Stack>
  );
}
