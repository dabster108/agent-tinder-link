import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { PremiumTheme } from "@/components/premium/theme";

export function ConnectionVisualization() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [progress]);

  const signalStyle = useAnimatedStyle(() => ({
    width: `${20 + progress.value * 75}%`,
    opacity: 0.45 + progress.value * 0.55,
  }));

  const pulseLeft = useAnimatedStyle(() => ({
    transform: [{ scale: 0.95 + progress.value * 0.08 }],
  }));

  const pulseRight = useAnimatedStyle(() => ({
    transform: [{ scale: 1.03 - progress.value * 0.08 }],
  }));

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Connection Visualization</Text>
      <View style={styles.row}>
        <Animated.View style={[styles.node, pulseLeft]}>
          <Text style={styles.nodeText}>You</Text>
        </Animated.View>
        <View style={styles.track}>
          <Animated.View style={[styles.signal, signalStyle]} />
        </View>
        <Animated.View style={[styles.node, pulseRight]}>
          <Text style={styles.nodeText}>Match</Text>
        </Animated.View>
      </View>
      <Text style={styles.caption}>Strength: Adaptive and rising</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  title: {
    color: PremiumTheme.text.primary,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  node: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(116, 146, 255, 0.22)",
    borderWidth: 1,
    borderColor: PremiumTheme.surface.border,
  },
  nodeText: {
    color: PremiumTheme.text.primary,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 99,
    backgroundColor: "rgba(162, 178, 255, 0.18)",
    overflow: "hidden",
  },
  signal: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: PremiumTheme.accents.blue,
  },
  caption: {
    color: PremiumTheme.text.muted,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
