import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";

import { AppBackground } from "@/components/premium/AppBackground";
import { GlassCard } from "@/components/premium/GlassCard";
import { PremiumTheme } from "@/components/premium/theme";

type MatchItem = {
  id: string;
  name: string;
  age: number;
  score: number;
  reason: string;
};

const mockMatches: MatchItem[] = [
  {
    id: "1",
    name: "Aarav",
    age: 27,
    score: 94,
    reason:
      "Shared curiosity, deep-focus work style, and balanced communication cadence.",
  },
  {
    id: "2",
    name: "Maya",
    age: 25,
    score: 91,
    reason: "Aligned emotional pacing and similar weekend energy profile.",
  },
  {
    id: "3",
    name: "Nikhil",
    age: 28,
    score: 89,
    reason: "Strong values overlap with high conversational reciprocity.",
  },
];

export default function MatchesScreen() {
  return (
    <View style={styles.screen}>
      <AppBackground />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Matches</Text>
          <Text style={styles.subtitle}>
            Tap cards to shortlist or swipe across to explore more.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
          >
            {mockMatches.map((item, index) => (
              <Animated.View
                entering={FadeInUp.delay(120 + index * 80).duration(650)}
                key={item.id}
              >
                <Pressable>
                  <GlassCard style={styles.matchCard}>
                    <View style={styles.topRow}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarLabel}>
                          {item.name.slice(0, 1)}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.name}>
                          {item.name}, {item.age}
                        </Text>
                        <Text style={styles.score}>
                          {item.score}% compatible
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.reasonLabel}>Agent Reasoning</Text>
                    <Text style={styles.reason}>{item.reason}</Text>
                  </GlassCard>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 104,
    gap: 10,
  },
  title: {
    color: PremiumTheme.text.primary,
    fontSize: 30,
    fontFamily: "Inter_800ExtraBold",
    letterSpacing: -0.6,
  },
  subtitle: {
    color: PremiumTheme.text.secondary,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
    marginBottom: 6,
  },
  row: {
    gap: 12,
    paddingRight: 18,
  },
  matchCard: {
    width: 290,
    minHeight: 220,
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(116, 146, 255, 0.22)",
    borderWidth: 1,
    borderColor: PremiumTheme.surface.border,
  },
  avatarLabel: {
    color: PremiumTheme.text.primary,
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  name: {
    color: PremiumTheme.text.primary,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  score: {
    color: PremiumTheme.accents.success,
    fontSize: 13,
    marginTop: 2,
    fontFamily: "Inter_600SemiBold",
  },
  reasonLabel: {
    color: PremiumTheme.text.muted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontFamily: "Inter_600SemiBold",
  },
  reason: {
    color: PremiumTheme.text.secondary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
});
