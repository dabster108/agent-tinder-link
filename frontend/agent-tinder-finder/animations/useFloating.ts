import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export function useFloating(distance = 6, duration = 2400) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [duration, progress]);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -distance / 2 + progress.value * distance }],
  }));

  return { floatingStyle };
}
