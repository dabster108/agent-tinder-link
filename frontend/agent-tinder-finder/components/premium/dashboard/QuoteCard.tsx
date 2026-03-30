import React from "react";
import { StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useFloating } from "@/animations/useFloating";
import { GlassCard } from "@/components/premium/GlassCard";
import { PremiumTheme } from "@/components/premium/theme";

export function QuoteCard() {
  const { floatingStyle } = useFloating(6, 2600);

  return (
    <Animated.View
      entering={FadeInUp.delay(120).duration(620)}
      style={floatingStyle}
    >
      <LinearGradient
        colors={[
          "rgba(115, 174, 255, 0.42)",
          "rgba(158, 174, 255, 0.28)",
          "rgba(255, 186, 230, 0.32)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <GlassCard style={styles.card}>
          <Text style={styles.quote}>
            The best connections are the ones you never expect.
          </Text>
        </GlassCard>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: 24,
    padding: 1,
  },
  card: {
    borderRadius: 23,
  },
  quote: {
    color: PremiumTheme.text.primary,
    textAlign: "center",
    fontSize: 22,
    lineHeight: 30,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
});
