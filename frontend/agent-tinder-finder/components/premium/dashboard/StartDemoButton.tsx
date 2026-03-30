import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { PrimaryButton } from "@/components/premium/PrimaryButton";

export function StartDemoButton() {
  return (
    <Animated.View
      entering={FadeInUp.delay(220).duration(640)}
      style={styles.wrap}
    >
      <View style={styles.glow} />
      <PrimaryButton label="Start Demo" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
  },
  glow: {
    position: "absolute",
    left: 24,
    right: 24,
    top: 10,
    height: 34,
    borderRadius: 20,
    backgroundColor: "rgba(120, 175, 255, 0.28)",
  },
});
