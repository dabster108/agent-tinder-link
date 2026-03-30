import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Brain, ShieldCheck, Sparkles } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { LandingColors } from "@/components/landing/theme";

const interests = ["Product Design", "AI Tools", "Running", "Live Music"];

export function ProfilePreviewCard() {
  return (
    <Animated.View
      entering={FadeInUp.delay(220).duration(900)}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>DK</Text>
        </View>
        <View>
          <Text style={styles.name}>Dikshanta, 26</Text>
          <Text style={styles.location}>Bangalore · Product + AI</Text>
        </View>
      </View>

      <Text style={styles.label}>Interests</Text>
      <View style={styles.chipRow}>
        {interests.map((item, index) => (
          <Animated.View
            entering={FadeInUp.delay(280 + index * 70).duration(600)}
            key={item}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{item}</Text>
          </Animated.View>
        ))}
      </View>

      <View style={styles.insightWrap}>
        <View style={styles.insightItem}>
          <Brain size={16} color={LandingColors.accent} />
          <Text style={styles.insightText}>
            Agent Insight: thrives with curious builders.
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Sparkles size={16} color={LandingColors.success} />
          <Text style={styles.insightText}>
            Compatibility Signal: 92% with thoughtful communicators.
          </Text>
        </View>
        <View style={styles.insightItem}>
          <ShieldCheck size={16} color={LandingColors.warning} />
          <Text style={styles.insightText}>
            Privacy Mode: selective profile sharing enabled.
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: LandingColors.border,
    backgroundColor: LandingColors.cardStrong,
    padding: 18,
    gap: 14,
    shadowColor: "#2E75FF",
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(89, 176, 255, 0.34)",
    borderWidth: 1,
    borderColor: "rgba(167, 216, 255, 0.45)",
  },
  avatarText: {
    color: "#EDF6FF",
    fontSize: 14,
    fontWeight: "800",
    fontFamily: "Inter_800ExtraBold",
  },
  name: {
    color: LandingColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  location: {
    marginTop: 2,
    color: LandingColors.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  label: {
    color: "#DCE8FF",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: LandingColors.chipBorder,
    backgroundColor: LandingColors.chip,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
    color: "#E8F1FF",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  insightWrap: {
    gap: 10,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  insightText: {
    color: "#C2D0EA",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flexShrink: 1,
    lineHeight: 18,
  },
});
