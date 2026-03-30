import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
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
      style={animatedStyle}
      onPress={onPress}
      onPressIn={() => {
        press.value = withSpring(0.96, { damping: 14, stiffness: 280 });
      }}
      onPressOut={() => {
        press.value = withSpring(1, { damping: 14, stiffness: 280 });
      }}
    >
      <LinearGradient
        colors={[
          PremiumTheme.gradient.electricBlue,
          PremiumTheme.gradient.softViolet,
          PremiumTheme.gradient.neonPink,
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
  gradient: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 13,
    alignItems: "center",
  },
  label: {
    color: "#FFFFFF",
    fontSize: 15,
    letterSpacing: 0.2,
    fontFamily: "Inter_700Bold",
  },
});
