import { Platform, useWindowDimensions } from 'react-native';

export function useWebLayout() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const compact = width < 720;
  const wide = isWeb && width >= 880;
  const xl = isWeb && width >= 1280;

  return {
    isWeb,
    compact,
    wide,
    xl,
    width,
    pageWidth: xl ? 1440 : wide ? 1120 : undefined,
    closetColumns: width >= 1100 ? 4 : width >= 720 ? 3 : 2,
    horizontalPad: xl ? 48 : wide ? 36 : 20,
  };
}
