import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="profile" />
      <Stack.Screen name="style" />
      <Stack.Screen name="colors" />
      <Stack.Screen name="fit" />
      <Stack.Screen name="occasions" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="permissions" />
    </Stack>
  );
}
