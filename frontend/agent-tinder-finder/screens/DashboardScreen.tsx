import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  Easing,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { AppBackground } from "@/components/premium/AppBackground";
import { ConnectionVisualization } from "@/components/premium/ConnectionVisualization";
import { GlassCard } from "@/components/premium/GlassCard";
import { PrimaryButton } from "@/components/premium/PrimaryButton";
import { AgentStatusCard } from "@/components/premium/dashboard/AgentStatusCard";
import { DashboardHeader } from "@/components/premium/dashboard/Header";
import { QuoteCard } from "@/components/premium/dashboard/QuoteCard";
import { PremiumTheme } from "@/components/premium/theme";
import { useAuth } from "@/context/AuthContext";

const KPIS = [
  { id: "k1", label: "Active Agents", value: "148" },
  { id: "k2", label: "Live Matches", value: "32" },
  { id: "k3", label: "Coach Nudges", value: "19" },
  { id: "k4", label: "Avg Confidence", value: "92%" },
];

const PIPELINE_STEPS = [
  { id: "p1", title: "Profile Exchange", detail: "12 pairs in queue" },
  { id: "p2", title: "Overlap Analysis", detail: "9 deep comparisons running" },
  { id: "p3", title: "Conflict Resolution", detail: "4 high priority flags" },
  { id: "p4", title: "Final Decision", detail: "7 ready for reveal" },
];

const MATCHES = [
  { id: "m1", name: "Mira + Aarav", score: "96%", status: "Ready" },
  { id: "m2", name: "Sara + Kabir", score: "93%", status: "Review" },
  { id: "m3", name: "Anya + Rohan", score: "91%", status: "Coaching" },
];

const COACH_QUEUE = [
  "Mira and Aarav: suggest deeper value-based prompt",
  "Sara and Kabir: re-engagement nudge after 3h silence",
  "Anya and Rohan: ask weekend plan compatibility",
];

const HERO_DOTS = [
  { left: 194, top: 26, size: 4, opacity: 0.9 },
  { left: 228, top: 40, size: 6, opacity: 0.7 },
  { left: 246, top: 74, size: 5, opacity: 0.8 },
  { left: 274, top: 106, size: 4, opacity: 0.72 },
  { left: 220, top: 134, size: 3, opacity: 0.68 },
  { left: 288, top: 144, size: 4, opacity: 0.74 },
  { left: 262, top: 172, size: 5, opacity: 0.7 },
  { left: 304, top: 198, size: 3, opacity: 0.65 },
  { left: 232, top: 212, size: 4, opacity: 0.78 },
  { left: 284, top: 236, size: 4, opacity: 0.8 },
  { left: 206, top: 248, size: 3, opacity: 0.62 },
  { left: 320, top: 252, size: 5, opacity: 0.74 },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function DashboardScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const pulse = useSharedValue(0);
  const cardLift = useSharedValue(0);
  const heroDrift = useSharedValue(0);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0, {
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );

    cardLift.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0, {
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );

    heroDrift.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0, {
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );
  }, [cardLift, heroDrift, pulse]);

  const livePillStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + pulse.value * 0.55,
    transform: [{ scale: 0.95 + pulse.value * 0.08 }],
  }));

  const matchCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -cardLift.value * 2 }],
  }));

  const heroDotsStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -4 + heroDrift.value * 8 }],
    opacity: 0.7 + heroDrift.value * 0.3,
  }));

  const onSignOut = React.useCallback(() => {
    signOut();
    router.replace("/login");
  }, [router, signOut]);

  return (
    <View style={styles.screen}>
      <AppBackground />

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <DashboardHeader />

          <Animated.View entering={FadeInUp.delay(30).duration(620)}>
            <LinearGradient
              colors={["#0A0F1A", "#0B1222", "#0E1427"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gemmaHero}
            >
              <View style={styles.heroGlowLeft} />
              <View style={styles.heroGlowRight} />

              <Animated.View style={[styles.heroDotsLayer, heroDotsStyle]}>
                {HERO_DOTS.map((dot, index) => (
                  <View
                    key={`hero-dot-${index}`}
                    style={[
                      styles.heroDot,
                      {
                        left: dot.left,
                        top: dot.top,
                        width: dot.size,
                        height: dot.size,
                        borderRadius: dot.size / 2,
                        opacity: dot.opacity,
                      },
                    ]}
                  />
                ))}
              </Animated.View>

              <Text style={styles.heroTopLabel}>SoulSync Update</Text>
              <Text style={styles.heroHeading}>
                What&apos;s new in SoulSync
              </Text>
              <Text style={styles.heroSubtext}>
                New intelligence upgrades across matching, negotiation, and
                coach guidance are now live.
              </Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(60).duration(500)}>
            <Animated.View style={[styles.livePill, livePillStyle]}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>SoulSync Live Intelligence</Text>
            </Animated.View>
          </Animated.View>

          <QuoteCard />
          <AgentStatusCard />

          <Animated.View entering={FadeInUp.delay(220).duration(620)}>
            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>System Overview</Text>
              <View style={styles.kpiGrid}>
                {KPIS.map((item) => (
                  <View key={item.id} style={styles.kpiCard}>
                    <Text style={styles.kpiValue}>{item.value}</Text>
                    <Text style={styles.kpiLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(280).duration(620)}>
            <GlassCard style={styles.sectionCard}>
              <ConnectionVisualization />
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(340).duration(620)}>
            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Negotiation Pipeline</Text>
              {PIPELINE_STEPS.map((step, index) => (
                <View key={step.id} style={styles.pipelineRow}>
                  <View style={styles.pipelineLeft}>
                    <View style={styles.stepDot} />
                    {index < PIPELINE_STEPS.length - 1 ? (
                      <View style={styles.stepLine} />
                    ) : null}
                  </View>
                  <View style={styles.pipelineContent}>
                    <Text style={styles.pipelineTitle}>{step.title}</Text>
                    <Text style={styles.pipelineDetail}>{step.detail}</Text>
                  </View>
                </View>
              ))}
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(620)}>
            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Top Match Outcomes</Text>
              {MATCHES.map((item) => (
                <Animated.View
                  key={item.id}
                  style={[styles.matchRow, matchCardStyle]}
                >
                  <View>
                    <Text style={styles.matchName}>{item.name}</Text>
                    <Text style={styles.matchStatus}>{item.status}</Text>
                  </View>
                  <View style={styles.scoreWrap}>
                    <Text style={styles.matchScore}>{item.score}</Text>
                  </View>
                </Animated.View>
              ))}
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(460).duration(620)}>
            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Coach Queue</Text>
              {COACH_QUEUE.map((item) => (
                <View key={item} style={styles.coachRow}>
                  <View style={styles.dot} />
                  <Text style={styles.coachText}>{item}</Text>
                </View>
              ))}
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(520).duration(620)}>
            <PrimaryButton label="Open Match Queue" onPress={() => {}} />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(580).duration(620)}>
            <AnimatedPressable style={styles.signOutBtn} onPress={onSignOut}>
              <Text style={styles.signOutText}>Sign out</Text>
            </AnimatedPressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PremiumTheme.gradient.canvas,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
    gap: 14,
  },
  gemmaHero: {
    minHeight: 280,
    borderRadius: 26,
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(84, 113, 176, 0.22)",
  },
  heroGlowLeft: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    top: -120,
    left: -70,
    backgroundColor: "rgba(48, 120, 255, 0.14)",
  },
  heroGlowRight: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: -160,
    right: -100,
    backgroundColor: "rgba(31, 95, 235, 0.16)",
  },
  heroDotsLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  heroDot: {
    position: "absolute",
    backgroundColor: "#4C8DFF",
    shadowColor: "#4C8DFF",
    shadowOpacity: 0.38,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  heroTopLabel: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  heroHeading: {
    marginTop: 10,
    maxWidth: 250,
    color: "#3E8DFF",
    fontSize: 46,
    lineHeight: 48,
    letterSpacing: -1.1,
    fontFamily: "Inter_800ExtraBold",
  },
  heroSubtext: {
    marginTop: 12,
    maxWidth: 240,
    color: "rgba(234, 240, 255, 0.82)",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_500Medium",
  },
  livePill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: PremiumTheme.surface.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PremiumTheme.accents.success,
  },
  liveText: {
    color: PremiumTheme.text.primary,
    fontSize: 12,
    letterSpacing: 0.2,
    fontFamily: "Inter_600SemiBold",
  },
  sectionCard: {
    gap: 12,
  },
  sectionTitle: {
    color: PremiumTheme.text.primary,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  kpiCard: {
    width: "47%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PremiumTheme.surface.border,
    backgroundColor: "rgba(255,255,255,0.76)",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  kpiValue: {
    color: PremiumTheme.text.primary,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  kpiLabel: {
    color: PremiumTheme.text.secondary,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  pipelineRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },
  pipelineLeft: {
    width: 14,
    alignItems: "center",
  },
  stepDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginTop: 6,
    backgroundColor: PremiumTheme.accents.blue,
  },
  stepLine: {
    marginTop: 4,
    width: 2,
    flex: 1,
    borderRadius: 1,
    backgroundColor: "rgba(120, 146, 214, 0.36)",
  },
  pipelineContent: {
    flex: 1,
    paddingBottom: 8,
  },
  pipelineTitle: {
    color: PremiumTheme.text.primary,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  pipelineDetail: {
    marginTop: 2,
    color: PremiumTheme.text.secondary,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  matchRow: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PremiumTheme.surface.border,
    backgroundColor: "rgba(255,255,255,0.78)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  matchName: {
    color: PremiumTheme.text.primary,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  matchStatus: {
    marginTop: 2,
    color: PremiumTheme.text.secondary,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  scoreWrap: {
    borderRadius: 999,
    backgroundColor: "rgba(75, 149, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  matchScore: {
    color: PremiumTheme.accents.blue,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  coachRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: PremiumTheme.accents.blue,
  },
  coachText: {
    flex: 1,
    color: PremiumTheme.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_500Medium",
  },
  signOutBtn: {
    alignSelf: "center",
    marginTop: 2,
    minWidth: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PremiumTheme.surface.border,
    backgroundColor: "rgba(255,255,255,0.74)",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  signOutText: {
    color: PremiumTheme.text.primary,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
