import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export function GlowBackground() {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [drift]);

  const topOrb = useAnimatedStyle(() => ({
    transform: [
      { translateX: -24 + drift.value * 18 },
      { translateY: -30 + drift.value * 26 },
      { scale: 0.95 + drift.value * 0.1 },
    ],
    opacity: 0.45 + drift.value * 0.2,
  }));

  const bottomOrb = useAnimatedStyle(() => ({
    transform: [
      { translateX: 18 - drift.value * 16 },
      { translateY: 12 - drift.value * 20 },
      { scale: 0.92 + drift.value * 0.08 },
    ],
    opacity: 0.35 + drift.value * 0.15,
  }));

  return (
    <>
      <LinearGradient
        colors={["#050712", "#090E1E", "#060916"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <AnimatedGradient
        colors={["rgba(82, 158, 255, 0.75)", "rgba(85, 41, 255, 0.06)"]}
        style={[styles.topGlow, topOrb]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <AnimatedGradient
        colors={["rgba(83, 91, 255, 0.62)", "rgba(43, 160, 255, 0.02)"]}
        style={[styles.bottomGlow, bottomOrb]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  topGlow: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 999,
    top: -170,
    right: -130,
  },
  bottomGlow: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 999,
    bottom: 110,
    left: -110,
  },
});
