import React, { PropsWithChildren } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";

import { PremiumShadow, PremiumTheme } from "@/components/premium/theme";

type GlassCardProps = PropsWithChildren<{
  style?: object;
}>;

export function GlassCard({ children, style }: GlassCardProps) {
  if (Platform.OS === "web") {
    return <View style={[styles.webCard, style]}>{children}</View>;
  }

  return (
    <View style={[styles.nativeWrap, style]}>
      <BlurView tint="dark" intensity={44} style={styles.nativeBlur}>
        <View style={styles.nativeOverlay}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  nativeWrap: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: PremiumTheme.surface.border,
    ...PremiumShadow,
  },
  nativeBlur: {
    width: "100%",
  },
  nativeOverlay: {
    backgroundColor: PremiumTheme.surface.glass,
    padding: 16,
  },
  webCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: PremiumTheme.surface.border,
    backgroundColor: PremiumTheme.surface.glassStrong,
    padding: 16,
    ...PremiumShadow,
  },
});
