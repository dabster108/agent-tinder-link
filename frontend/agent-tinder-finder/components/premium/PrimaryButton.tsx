import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { PremiumTheme } from "@/components/premium/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
};

export function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  const press = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.container, animatedStyle]}
      onPress={onPress}
      onPressIn={() => {
        press.value = withSpring(0.96, { damping: 14, stiffness: 280 });
      }}
      onPressOut={() => {
        press.value = withSpring(1, { damping: 14, stiffness: 280 });
      }}
    >
      <View style={styles.glow} />
      <LinearGradient
        colors={[
          PremiumTheme.gradient.electricBlue,
          PremiumTheme.gradient.softViolet,
          PremiumTheme.gradient.softPink,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  glow: {
    position: "absolute",
    left: 20,
    right: 20,
    top: 12,
    height: 36,
    borderRadius: 20,
    backgroundColor: "rgba(127, 175, 255, 0.24)",
  },
  gradient: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 13,
    alignItems: "center",
    shadowColor: "#8CB6FF",
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 7,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 15,
    letterSpacing: 0.2,
    fontFamily: "Inter_700Bold",
  },
});
