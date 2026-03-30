import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { LandingColors, SoftShadow } from "@/components/landing/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type FeatureCardProps = {
  title: string;
  description: string;
  tag: string;
  icon: React.ReactNode;
};

export function FeatureCard({
  title,
  description,
  tag,
  icon,
}: FeatureCardProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.22);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value,
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 13, stiffness: 260 });
        glow.value = withTiming(0.42, { duration: 180 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 13, stiffness: 260 });
        glow.value = withTiming(0.22, { duration: 200 });
      }}
      style={[styles.wrap, animatedStyle]}
    >
      <LinearGradient
        colors={[
          "rgba(78, 145, 255, 0.15)",
          "rgba(76, 45, 162, 0.1)",
          "rgba(15, 20, 38, 0.7)",
        ]}
        style={styles.gradient}
      >
        <View style={styles.iconWrap}>{icon}</View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.tagWrap}>
          <Text style={styles.tag}>{tag}</Text>
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: LandingColors.border,
    backgroundColor: LandingColors.card,
    overflow: "hidden",
    ...SoftShadow,
  },
  gradient: {
    padding: 18,
    gap: 10,
    minHeight: 168,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(133, 193, 255, 0.15)",
  },
  title: {
    color: LandingColors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.1,
  },
  description: {
    color: LandingColors.textSecondary,
    lineHeight: 21,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  tagWrap: {
    alignSelf: "flex-start",
    marginTop: "auto",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: LandingColors.chipBorder,
    backgroundColor: LandingColors.chip,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tag: {
    color: LandingColors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});
