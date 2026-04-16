import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const SoulTheme = {
  red: "#E53935",
  redSoft: "#F04C47",
  canvas: "#0F0F0F",
  canvasAlt: "#121212",
  card: "#F6F2EE",
  cardSoft: "#FCF9F7",
  textPrimary: "#181716",
  textSecondary: "#6D6864",
  textOnDark: "#F8F6F3",
  darkChip: "#211F1D",
};

const STATS = [
  { id: "s1", value: 32, label: "Live Fits", icon: "flash" as const },
  { id: "s2", value: 14, label: "Agent Notes", icon: "document-text" as const },
  { id: "s3", value: 7, label: "Ready", icon: "checkmark-circle" as const },
];

const INTERESTS = ["Intentional dating", "Design", "Road trips", "Books"];

const CHIPS = ["Checklist", "All", "Challenges"];
const RING_SIZE = 180;
const RING_STROKE = 14;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const MATCH_SCORE = 0.94;

export default function DashboardScreen() {
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1700, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-90 + pulse.value * 2}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + pulse.value * 0.35,
    transform: [{ scale: 0.96 + pulse.value * 0.08 }],
  }));

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[SoulTheme.canvas, SoulTheme.canvasAlt, "#181413"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.glowTop, glowStyle]} />

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Animated.View
            entering={FadeInDown.duration(450)}
            style={styles.head}
          >
            <View>
              <Text style={styles.brand}>SoulSync</Text>
              <Text style={styles.headline}>What&apos;s new</Text>
            </View>
            <View style={styles.badgeRow}>
              <View style={styles.counterBadge}>
                <Text style={styles.counterValue}>32</Text>
                <Text style={styles.counterText}>Live Fits</Text>
              </View>
              <View style={styles.counterBadge}>
                <Text style={styles.counterValue}>14</Text>
                <Text style={styles.counterText}>Agent Notes</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(60).duration(480)}>
            <View style={styles.statsRow}>
              {STATS.map((item) => (
                <View key={item.id} style={styles.statCard}>
                  <View style={styles.statIconWrap}>
                    <Ionicons
                      name={item.icon}
                      size={14}
                      color={SoulTheme.red}
                    />
                  </View>
                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(120).duration(520)}
            style={styles.matchWrap}
          >
            <View style={styles.matchCard}>
              <Text style={styles.sectionLabel}>Compatibility Pulse</Text>
              <View style={styles.ringWrap}>
                <View style={styles.ringTrack}>
                  <Animated.View style={[styles.ringProgressWrap, ringStyle]}>
                    <Svg width={RING_SIZE} height={RING_SIZE}>
                      <Circle
                        cx={RING_SIZE / 2}
                        cy={RING_SIZE / 2}
                        r={RING_RADIUS}
                        stroke={SoulTheme.red}
                        strokeWidth={RING_STROKE}
                        strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                        strokeDashoffset={
                          RING_CIRCUMFERENCE * (1 - MATCH_SCORE)
                        }
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </Svg>
                  </Animated.View>
                  <View style={styles.ringCenter}>
                    <Text style={styles.matchPercent}>94%</Text>
                    <Text style={styles.matchText}>match</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(190).duration(520)}
            style={styles.profileCard}
          >
            <View style={styles.profileTop}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarText}>M</Text>
              </View>
              <View style={styles.profileMeta}>
                <Text style={styles.profileName}>Mira Sen</Text>
                <Text style={styles.profileRole}>
                  Product designer and deep listener
                </Text>
                <Text style={styles.profileBio}>
                  Loves intentional conversations, sunrise runs, and planning
                  spontaneous weekend escapes.
                </Text>
              </View>
            </View>
            <View style={styles.interestsRow}>
              {INTERESTS.map((interest) => (
                <View key={interest} style={styles.interestChip}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(240).duration(500)}
            style={styles.chipsRow}
          >
            {CHIPS.map((chip, index) => (
              <View
                key={chip}
                style={[
                  styles.filterChip,
                  index === 0 && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    index === 0 && styles.filterChipTextActive,
                  ]}
                >
                  {chip}
                </Text>
              </View>
            ))}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SoulTheme.canvas,
  },
  safeArea: {
    flex: 1,
  },
  glowTop: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -120,
    right: -80,
    backgroundColor: "rgba(229,57,53,0.24)",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 120,
    gap: 14,
  },
  head: {
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  brand: {
    color: SoulTheme.red,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
  headline: {
    marginTop: 6,
    color: SoulTheme.textOnDark,
    fontSize: 28,
    fontFamily: "Inter_800ExtraBold",
  },
  badgeRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  counterBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "rgba(229,57,53,0.15)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  counterValue: {
    color: SoulTheme.textOnDark,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  counterText: {
    color: "rgba(248,246,243,0.85)",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: SoulTheme.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  statIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(229,57,53,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    marginTop: 10,
    color: SoulTheme.textPrimary,
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    color: SoulTheme.textSecondary,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  matchWrap: {
    borderRadius: 22,
    backgroundColor: SoulTheme.card,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  matchCard: {
    alignItems: "center",
  },
  sectionLabel: {
    color: SoulTheme.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  ringWrap: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ringTrack: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
    borderColor: "rgba(229,57,53,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  ringProgressWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  ringCenter: {
    width: RING_SIZE - 44,
    height: RING_SIZE - 44,
    borderRadius: (RING_SIZE - 44) / 2,
    backgroundColor: SoulTheme.cardSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  matchPercent: {
    color: SoulTheme.textPrimary,
    fontSize: 38,
    lineHeight: 40,
    fontFamily: "Inter_800ExtraBold",
  },
  matchText: {
    marginTop: 2,
    color: SoulTheme.red,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  profileCard: {
    borderRadius: 22,
    backgroundColor: SoulTheme.card,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    gap: 14,
  },
  profileTop: {
    flexDirection: "row",
    gap: 12,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: SoulTheme.red,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  profileMeta: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    color: SoulTheme.textPrimary,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  profileRole: {
    color: SoulTheme.red,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  profileBio: {
    marginTop: 4,
    color: SoulTheme.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Inter_500Medium",
  },
  interestsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestChip: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    backgroundColor: "rgba(229,57,53,0.1)",
  },
  interestText: {
    color: SoulTheme.textPrimary,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "rgba(229,57,53,0.35)",
    backgroundColor: "rgba(246,242,238,0.92)",
  },
  filterChipActive: {
    backgroundColor: SoulTheme.red,
    borderColor: SoulTheme.red,
  },
  filterChipText: {
    color: SoulTheme.red,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
});
