import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { PremiumTheme } from "@/components/premium/theme";

export function AppBackground() {
  return (
    <>
      <LinearGradient
        colors={[
          PremiumTheme.gradient.deepIndigo,
          PremiumTheme.gradient.electricBlue,
          PremiumTheme.gradient.softViolet,
          PremiumTheme.gradient.neonPink,
        ]}
        locations={[0.02, 0.34, 0.68, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[
          "rgba(6, 8, 20, 0.76)",
          "rgba(8, 10, 26, 0.72)",
          "rgba(8, 10, 24, 0.84)",
        ]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </>
  );
}
