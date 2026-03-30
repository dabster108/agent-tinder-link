import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import Animated, {
  Easing,
  FadeIn,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { GradientButton } from "@/components/landing/GradientButton";
import { LandingColors } from "@/components/landing/theme";

export function HeroSection() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.04 }],
    opacity: 0.82 + pulse.value * 0.18,
  }));

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(650)} style={styles.badge}>
        <Sparkles color={LandingColors.accent} size={14} />
        <Text style={styles.badgeText}>AGENT-TINDER-FINDER</Text>
      </Animated.View>

      <Animated.Text
        entering={SlideInUp.delay(120).duration(800)}
        style={styles.title}
      >
        Your Agent Knows You.{"\n"}Let It Find Your People.
      </Animated.Text>

      <Animated.Text
        entering={SlideInUp.delay(200).duration(850)}
        style={styles.subtitle}
      >
        A multi-agent matching engine that understands behavior, preferences,
        and personality to connect you with people who truly align.
      </Animated.Text>

      <Animated.View
        entering={SlideInUp.delay(280).duration(900)}
        style={styles.ctaRow}
      >
        <Animated.View style={pulseStyle}>
          <GradientButton label="Start Matching" />
        </Animated.View>
        <Text style={styles.secondary}>See Live Agent Demo</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 26,
    gap: 14,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(133, 206, 255, 0.36)",
    backgroundColor: "rgba(54, 95, 175, 0.16)",
  },
  badgeText: {
    color: "#DBEEFF",
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.1,
  },
  title: {
    color: LandingColors.textPrimary,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "800",
    fontFamily: "Inter_800ExtraBold",
    letterSpacing: -0.7,
  },
  subtitle: {
    color: LandingColors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Inter_400Regular",
    maxWidth: 580,
  },
  ctaRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14,
  },
  secondary: {
    color: "#D1D9EE",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});
