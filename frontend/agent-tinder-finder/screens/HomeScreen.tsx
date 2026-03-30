import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

import { HeartConnectionIntro } from "@/animations/HeartConnectionIntro";
import { useFloating } from "@/animations/useFloating";
import { AppBackground } from "@/components/premium/AppBackground";
import { ConnectionVisualization } from "@/components/premium/ConnectionVisualization";
import { GlassCard } from "@/components/premium/GlassCard";
import { PremiumTheme } from "@/components/premium/theme";
import { PrimaryButton } from "@/components/premium/PrimaryButton";

export default function HomeScreen() {
  const [introDone, setIntroDone] = React.useState(false);
  const { floatingStyle } = useFloating(5, 2800);

  return (
    <View style={styles.screen}>
      <AppBackground />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.content}>
          <Animated.Text entering={FadeInUp.duration(680)} style={styles.title}>
            Your Agent is Learning
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(140).duration(700)}
            style={styles.subtitle}
          >
            Scanning behavior patterns to surface meaningful matches.
          </Animated.Text>

          <Animated.View entering={FadeInUp.delay(160).duration(720)}>
            <GlassCard style={styles.statusCard}>
              <Text style={styles.cardTitle}>Agent Status</Text>
              <Text style={styles.cardText}>
                Collecting interaction signal and preference confidence.
              </Text>
            </GlassCard>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(230).duration(750)}
            style={floatingStyle}
          >
            <GlassCard style={styles.summaryCard}>
              <Text style={styles.cardTitle}>Quick Summary</Text>
              <Text style={styles.cardText}>
                2 high-potential matches unlocked today.
              </Text>
              <View style={styles.visualWrap}>
                <ConnectionVisualization />
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(300).duration(760)}
            style={styles.actionWrap}
          >
            <PrimaryButton label="View Matches" />
          </Animated.View>
        </View>
      </SafeAreaView>

      {!introDone ? (
        <HeartConnectionIntro onComplete={() => setIntroDone(true)} />
      ) : null}
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
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 104,
    gap: 14,
  },
  title: {
    color: PremiumTheme.text.primary,
    fontSize: 33,
    letterSpacing: -0.7,
    fontFamily: "Inter_800ExtraBold",
  },
  subtitle: {
    color: PremiumTheme.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  statusCard: {
    gap: 8,
  },
  summaryCard: {
    gap: 10,
  },
  cardTitle: {
    color: PremiumTheme.text.primary,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  cardText: {
    color: PremiumTheme.text.secondary,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
  visualWrap: {
    marginTop: 4,
  },
  actionWrap: {
    marginTop: "auto",
  },
});
