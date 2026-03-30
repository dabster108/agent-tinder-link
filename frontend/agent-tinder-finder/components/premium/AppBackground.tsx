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
        locations={[0, 0.44, 0.78, 1]}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[
          "rgba(255, 255, 255, 0.72)",
          "rgba(255, 255, 255, 0.82)",
          "rgba(255, 255, 255, 0.9)",
        ]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </>
  );
}
