import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";

import { AppBackground } from "@/components/premium/AppBackground";
import { GlassCard } from "@/components/premium/GlassCard";
import { PremiumTheme } from "@/components/premium/theme";

const tags = ["Design", "AI", "Fitness", "Music", "Travel"];

export default function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <AppBackground />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>
            Refine what your agent learns and shares.
          </Text>

          <Animated.View entering={FadeInUp.delay(100).duration(620)}>
            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Details</Text>
              <TextInput
                style={styles.input}
                defaultValue="Dikshanta"
                placeholderTextColor={PremiumTheme.text.muted}
              />
              <TextInput
                style={styles.input}
                defaultValue="Product Builder"
                placeholderTextColor={PremiumTheme.text.muted}
              />
              <TextInput
                style={styles.input}
                defaultValue="Bangalore"
                placeholderTextColor={PremiumTheme.text.muted}
              />
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(180).duration(640)}>
            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.tagsRow}>
                {tags.map((tag, index) => (
                  <Animated.View
                    key={tag}
                    entering={FadeInUp.delay(220 + index * 70).duration(500)}
                  >
                    <Pressable style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(260).duration(680)}>
            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Agent Insights</Text>
              <Text style={styles.insightText}>
                You respond best to authentic, low-noise conversations and
                thoughtful pacing.
              </Text>
              <Text style={styles.insightText}>
                Your compatibility signal increases with emotionally expressive
                communicators.
              </Text>
            </GlassCard>
          </Animated.View>
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
    gap: 12,
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
    marginBottom: 4,
  },
  sectionCard: {
    gap: 10,
  },
  sectionTitle: {
    color: PremiumTheme.text.primary,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PremiumTheme.surface.border,
    backgroundColor: "rgba(255, 255, 255, 0.84)",
    color: PremiumTheme.text.primary,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PremiumTheme.surface.border,
    backgroundColor: "rgba(149, 168, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tagText: {
    color: PremiumTheme.text.primary,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  insightText: {
    color: PremiumTheme.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
});
