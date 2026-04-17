import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { SoulCardShadow, SoulSyncTheme } from "@/constants/soulSyncTheme";

type Spark = {
  id: string;
  name: string;
  vibe: string;
  score: number;
  avatar: string;
};

type MatchItem = {
  id: string;
  name: string;
  note: string;
  score: number;
  status: "Ready" | "New" | "Challenge";
  avatar: string;
};

const SPARKS: Spark[] = [
  { id: "s1", name: "Mira", vibe: "Intentional", score: 96, avatar: "M" },
  { id: "s2", name: "Rohan", vibe: "Playful", score: 91, avatar: "R" },
  { id: "s3", name: "Aanya", vibe: "Calm", score: 94, avatar: "A" },
  { id: "s4", name: "Kabir", vibe: "Curious", score: 89, avatar: "K" },
];

const MATCHES: MatchItem[] = [
  {
    id: "m1",
    name: "Mira Sen",
    note: "Agent note: values alignment is unusually high this week.",
    score: 94,
    status: "Ready",
    avatar: "M",
  },
  {
    id: "m2",
    name: "Rohan Mehta",
    note: "Strong momentum. Suggest one voice-note opener.",
    score: 91,
    status: "New",
    avatar: "R",
  },
  {
    id: "m3",
    name: "Aanya Rao",
    note: "Great match quality, but schedule preference mismatch flagged.",
    score: 88,
    status: "Challenge",
    avatar: "A",
  },
  {
    id: "m4",
    name: "Sara Iyer",
    note: "Conversation rhythm is clean and reciprocal.",
    score: 92,
    status: "Ready",
    avatar: "S",
  },
];

const FILTERS = ["All", "New", "Challenges"] as const;
type FilterValue = (typeof FILTERS)[number];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ScaleCard({
  style,
  onPress,
  children,
}: {
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 16, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 320 });
      }}
    >
      {children}
    </AnimatedPressable>
  );
}

export default function MatchesScreen() {
  const [activeFilter, setActiveFilter] = React.useState<FilterValue>("All");
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + pulse.value * 0.24,
    transform: [{ scale: 0.96 + pulse.value * 0.08 }],
  }));

  const filteredMatches = React.useMemo(() => {
    if (activeFilter === "All") {
      return MATCHES;
    }
    if (activeFilter === "New") {
      return MATCHES.filter((item) => item.status === "New");
    }
    return MATCHES.filter((item) => item.status === "Challenge");
  }, [activeFilter]);

  const onPressAny = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[SoulSyncTheme.canvas, SoulSyncTheme.canvasAlt, "#1A1312"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.glow, glowStyle]} />

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <FlatList
          data={filteredMatches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <Animated.View
                entering={FadeInDown.duration(440)}
                style={styles.hero}
              >
                <Text style={styles.heroBrand}>SoulSync</Text>
                <Text style={styles.heroTitle}>Match Queue</Text>
                <Text style={styles.heroSubtitle}>
                  Modern matching intelligence with real-time chemistry signals.
                </Text>

                <View style={styles.badgesRow}>
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

              <Animated.View entering={FadeInDown.delay(60).duration(450)}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.sparkRow}
                >
                  {SPARKS.map((spark) => (
                    <ScaleCard
                      key={spark.id}
                      style={styles.sparkCard}
                      onPress={onPressAny}
                    >
                      <View style={styles.sparkAvatar}>
                        <Text style={styles.sparkAvatarText}>
                          {spark.avatar}
                        </Text>
                      </View>
                      <Text style={styles.sparkName}>{spark.name}</Text>
                      <Text style={styles.sparkVibe}>{spark.vibe}</Text>
                      <Text style={styles.sparkScore}>{spark.score}%</Text>
                    </ScaleCard>
                  ))}
                </ScrollView>
              </Animated.View>

              <Animated.View
                entering={FadeInUp.delay(90).duration(420)}
                style={styles.filterRow}
              >
                {FILTERS.map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <Pressable
                      key={filter}
                      style={[
                        styles.filterChip,
                        isActive && styles.filterChipActive,
                      ]}
                      onPress={() => {
                        setActiveFilter(filter);
                        onPressAny();
                      }}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          isActive && styles.filterTextActive,
                        ]}
                      >
                        {filter}
                      </Text>
                    </Pressable>
                  );
                })}
              </Animated.View>
            </View>
          }
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInUp.delay(120 + index * 50).duration(320)}
            >
              <ScaleCard style={styles.matchCard} onPress={onPressAny}>
                <View style={styles.cardTopRow}>
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>{item.avatar}</Text>
                  </View>

                  <View style={styles.cardMain}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.note}>{item.note}</Text>
                  </View>

                  <View style={styles.rightCol}>
                    <View style={styles.scorePill}>
                      <Text style={styles.scoreText}>{item.score}%</Text>
                    </View>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <Pressable style={styles.ghostButton} onPress={onPressAny}>
                    <Ionicons
                      name="document-text-outline"
                      size={15}
                      color={SoulSyncTheme.red}
                    />
                    <Text style={styles.ghostButtonText}>Notes</Text>
                  </Pressable>

                  <Pressable style={styles.primaryButton} onPress={onPressAny}>
                    <Ionicons
                      name="chatbubble-ellipses"
                      size={15}
                      color="#FFF"
                    />
                    <Text style={styles.primaryButtonText}>Start Chat</Text>
                  </Pressable>
                </View>
              </ScaleCard>
            </Animated.View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SoulSyncTheme.canvas,
  },
  safeArea: {
    flex: 1,
  },
  glow: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(229,57,53,0.24)",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },
  hero: {
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 16,
    marginBottom: 14,
  },
  heroBrand: {
    color: SoulSyncTheme.red,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  heroTitle: {
    marginTop: 6,
    color: SoulSyncTheme.onDark,
    fontSize: 28,
    fontFamily: "Inter_800ExtraBold",
  },
  heroSubtitle: {
    marginTop: 6,
    color: SoulSyncTheme.onDarkMuted,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Inter_500Medium",
  },
  badgesRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  counterBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "rgba(229,57,53,0.16)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  counterValue: {
    color: SoulSyncTheme.onDark,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  counterText: {
    color: SoulSyncTheme.onDark,
    opacity: 0.88,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  sparkRow: {
    gap: 10,
    paddingRight: 6,
    marginBottom: 14,
  },
  sparkCard: {
    width: 96,
    borderRadius: 20,
    backgroundColor: SoulSyncTheme.card,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    ...SoulCardShadow,
  },
  sparkAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: SoulSyncTheme.red,
    alignItems: "center",
    justifyContent: "center",
  },
  sparkAvatarText: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  sparkName: {
    marginTop: 8,
    color: SoulSyncTheme.ink,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  sparkVibe: {
    marginTop: 2,
    color: SoulSyncTheme.inkMuted,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  sparkScore: {
    marginTop: 6,
    color: SoulSyncTheme.red,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(229,57,53,0.35)",
    backgroundColor: "rgba(246,242,238,0.94)",
  },
  filterChipActive: {
    backgroundColor: SoulSyncTheme.red,
    borderColor: SoulSyncTheme.red,
  },
  filterText: {
    color: SoulSyncTheme.red,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  filterTextActive: {
    color: "#FFF",
  },
  matchCard: {
    borderRadius: 22,
    backgroundColor: SoulSyncTheme.card,
    padding: 14,
    ...SoulCardShadow,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: SoulSyncTheme.red,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  cardMain: {
    flex: 1,
    paddingRight: 8,
  },
  name: {
    color: SoulSyncTheme.ink,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  note: {
    marginTop: 4,
    color: SoulSyncTheme.inkMuted,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "Inter_500Medium",
  },
  rightCol: {
    alignItems: "flex-end",
    gap: 4,
  },
  scorePill: {
    borderRadius: 999,
    backgroundColor: "rgba(229,57,53,0.14)",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  scoreText: {
    color: SoulSyncTheme.red,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  statusText: {
    color: SoulSyncTheme.inkMuted,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  cardActions: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  ghostButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(229,57,53,0.3)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  ghostButtonText: {
    color: SoulSyncTheme.red,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  primaryButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 14,
    backgroundColor: SoulSyncTheme.red,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
