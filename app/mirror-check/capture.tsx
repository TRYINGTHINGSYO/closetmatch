import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export default function MirrorCheckCaptureScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [uri, setUri] = useState<string | null>(null);

  const pick = async (camera: boolean) => {
    const permission = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera or photo access is required for Mirror Check.');
      return;
    }
    const result = camera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true, aspect: [3, 4] })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true, aspect: [3, 4] });
    if (!result.canceled && result.assets[0]) setUri(result.assets[0].uri);
  };

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <Text style={[styles.title, { color: theme.ink }]}>Full-body photo</Text>
        <Text style={[styles.sub, { color: theme.inkMuted }]}>
          Stand in good lighting. Show the full outfit including shoes. Keep the camera level. Avoid heavy filters. Perfect photography is not required.
        </Text>
        {uri ? (
          <Image source={{ uri }} style={styles.preview} accessibilityLabel="Mirror Check preview" />
        ) : (
          <View style={[styles.placeholder, { borderColor: theme.border }]}>
            <Text style={{ color: theme.inkSoft, textAlign: 'center' }}>Photo preview</Text>
          </View>
        )}
        <View style={{ gap: 10 }}>
          <Button title="Take photo" onPress={() => pick(true)} />
          <Button title="Upload photo" variant="secondary" onPress={() => pick(false)} />
          <Button
            title="Analyze outfit"
            disabled={!uri}
            onPress={() =>
              router.push({
                pathname: '/mirror-check/processing',
                params: { imageUri: uri ?? '' },
              })
            }
          />
          <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 20, gap: 12 },
  title: { ...typography.hero },
  sub: { ...typography.body },
  preview: { width: '100%', height: 360, borderRadius: 20 },
  placeholder: {
    height: 280,
    borderWidth: 1,
    borderRadius: 20,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
