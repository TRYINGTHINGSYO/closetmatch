import { Platform, useWindowDimensions } from 'react-native';

export function useWebLayout() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const wide = isWeb && width >= 880;
  return {
    isWeb,
    wide,
    width,
    pageWidth: wide ? 1180 : undefined,
    closetColumns: width >= 1100 ? 4 : width >= 720 ? 3 : 2,
    horizontalPad: wide ? 32 : 20,
  };
}
