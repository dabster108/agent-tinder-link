import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ArrowRight, Bot, User } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { LandingColors } from "@/components/landing/theme";

const steps = [
  { key: "u1", label: "User", icon: User },
  { key: "a1", label: "Agent", icon: Bot },
  { key: "o1", label: "Orchestrator", icon: Bot },
  { key: "a2", label: "Agent", icon: Bot },
  { key: "u2", label: "User", icon: User },
];

export function VisualFlow() {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Live Signal Flow</Text>
      <Text style={styles.caption}>
        User {"->"} Agent {"->"} Orchestrator {"->"} Agent {"->"} User
      </Text>

      <View style={styles.flowWrap}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isOrchestrator = step.label === "Orchestrator";

          return (
            <React.Fragment key={step.key}>
              <Animated.View
                entering={FadeInUp.delay(120 + index * 90).duration(650)}
                style={[styles.node, isOrchestrator && styles.nodePrimary]}
              >
                <Icon
                  size={16}
                  color={isOrchestrator ? "#CBEEFF" : "#9CCBFF"}
                />
                <Text
                  style={[
                    styles.nodeText,
                    isOrchestrator && styles.nodeTextPrimary,
                  ]}
                >
                  {step.label}
                </Text>
              </Animated.View>
              {index < steps.length - 1 ? (
                <Animated.View
                  entering={FadeInUp.delay(170 + index * 90).duration(520)}
                  style={styles.arrowWrap}
                >
                  <ArrowRight color="rgba(167, 214, 255, 0.72)" size={18} />
                </Animated.View>
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 14,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: LandingColors.border,
    backgroundColor: LandingColors.card,
    gap: 10,
  },
  heading: {
    color: LandingColors.textPrimary,
    fontSize: 19,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  caption: {
    color: LandingColors.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },
  flowWrap: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    rowGap: 8,
  },
  node: {
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "rgba(102, 132, 196, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(160, 205, 255, 0.25)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nodePrimary: {
    backgroundColor: "rgba(70, 123, 255, 0.35)",
    borderColor: "rgba(172, 214, 255, 0.58)",
  },
  nodeText: {
    color: "#CDE0FF",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  nodeTextPrimary: {
    color: "#F4F8FF",
  },
  arrowWrap: {
    marginHorizontal: 4,
  },
});
