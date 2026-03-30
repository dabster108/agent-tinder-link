import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { GlassCard } from "@/components/premium/GlassCard";
import { PremiumTheme } from "@/components/premium/theme";

export function AgentStatusCard() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${30 + progress.value * 60}%`,
  }));

  return (
    <Animated.View entering={FadeInUp.delay(320).duration(680)}>
      <GlassCard style={styles.card}>
        <Text style={styles.title}>Your Agent is Learning...</Text>
        <View style={styles.track}>
          <Animated.View style={[styles.progress, barStyle]} />
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  title: {
    color: PremiumTheme.text.primary,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  track: {
    height: 8,
    borderRadius: 99,
    backgroundColor: "rgba(145, 167, 207, 0.28)",
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: PremiumTheme.accents.blue,
  },
});
