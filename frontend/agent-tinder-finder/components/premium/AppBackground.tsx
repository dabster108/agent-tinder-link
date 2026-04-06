import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { PremiumTheme } from "@/components/premium/theme";

export function AppBackground() {
  return (
    <>
      <LinearGradient
        colors={[
          PremiumTheme.gradient.canvas,
          PremiumTheme.gradient.electricBlue,
          PremiumTheme.gradient.softViolet,
          PremiumTheme.gradient.softPink,
        ]}
        locations={[0, 0.34, 0.74, 1]}
        start={{ x: 0.06, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[
          "rgba(4, 9, 19, 0.32)",
          "rgba(6, 12, 25, 0.48)",
          "rgba(3, 7, 15, 0.62)",
        ]}
        start={{ x: 0.12, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </>
  );
}
