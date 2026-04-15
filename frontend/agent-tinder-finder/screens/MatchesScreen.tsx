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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import {
  KindraColors,
  KindraFonts,
  KindraShadow,
} from "@/constants/kindraTheme";

type NewMatch = {
  id: string;
  name: string;
  avatar: string;
  vibe: string;
  score: number;
};

type Conversation = {
  id: string;
  name: string;
  avatar: string;
  preview: string;
  time: string;
  unread: boolean;
  energy: string;
  compatibility: number;
};

const NEW_MATCHES: NewMatch[] = [
  { id: "n1", name: "Mira", avatar: "M", vibe: "Intentional", score: 96 },
  { id: "n2", name: "Rohan", avatar: "R", vibe: "Playful", score: 91 },
  { id: "n3", name: "Aanya", avatar: "A", vibe: "Calm", score: 94 },
  { id: "n4", name: "Kabir", avatar: "K", vibe: "Curious", score: 89 },
  { id: "n5", name: "Sara", avatar: "S", vibe: "Witty", score: 92 },
];

const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    name: "Mira",
    avatar: "M",
    preview: "Loved your idea on mindful dating prompts.",
    time: "2m",
    unread: true,
    energy: "Warm",
    compatibility: 96,
  },
  {
    id: "c2",
    name: "Rohan",
    avatar: "R",
    preview: "Friday coffee still works for me.",
    time: "15m",
    unread: false,
    energy: "Playful",
    compatibility: 91,
  },
  {
    id: "c3",
    name: "Aanya",
    avatar: "A",
    preview: "Your travel stories are actually elite.",
    time: "1h",
    unread: true,
    energy: "Steady",
    compatibility: 94,
  },
  {
    id: "c4",
    name: "Kabir",
    avatar: "K",
    preview: "Want to compare playlists this weekend?",
    time: "4h",
    unread: false,
    energy: "Curious",
    compatibility: 89,
  },
  {
    id: "c5",
    name: "Sara",
    avatar: "S",
    preview: "My agent says we should plan a call.",
    time: "1d",
    unread: false,
    energy: "Focused",
    compatibility: 92,
  },
];

const PULSE_BARS = [0.68, 0.9, 0.58, 0.82, 0.72];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function LiftPressable({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: object;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const hover = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: -2 * hover.value }],
    shadowOpacity: 0.12 + hover.value * 0.14,
  }));

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPressIn={() => {
        scale.value = withSpring(0.965, { damping: 16, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 300 });
      }}
      onHoverIn={() => {
        hover.value = withTiming(1, { duration: 180 });
      }}
      onHoverOut={() => {
        hover.value = withTiming(0, { duration: 180 });
      }}
      onPress={onPress}
    >
      {children}
    </AnimatedPressable>
  );
}

export default function MatchesScreen() {
  const heroDrift = useSharedValue(0);
  const radarPulse = useSharedValue(0);

  React.useEffect(() => {
    heroDrift.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 2900,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0, {
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );

    radarPulse.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1700,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(0, {
          duration: 1700,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );
  }, [heroDrift, radarPulse]);

  const onPressItem = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -3 + heroDrift.value * 6 }],
  }));

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -8 + heroDrift.value * 16 }],
    opacity: 0.42 + heroDrift.value * 0.3,
  }));

  const radarStyle = useAnimatedStyle(() => ({
    opacity: 0.34 + radarPulse.value * 0.42,
    transform: [{ scale: 0.92 + radarPulse.value * 0.1 }],
  }));

  const barPulseStyle = useAnimatedStyle(() => ({
    opacity: 0.62 + radarPulse.value * 0.26,
  }));

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <FlatList
          data={CONVERSATIONS}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <Animated.View
                entering={FadeInDown.duration(560)}
                style={[styles.hero, heroStyle]}
              >
                <LinearGradient
                  colors={["#0A101F", "#0E1A34", "#10224A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heroGradient}
                >
                  <Animated.View
                    style={[styles.heroOrb, styles.heroOrbLeft, orbStyle]}
                  />
                  <Animated.View
                    style={[styles.heroOrb, styles.heroOrbRight, orbStyle]}
                  />

                  <View style={styles.heroRowTop}>
                    <View style={styles.heroPill}>
                      <Ionicons
                        name="sparkles"
                        size={13}
                        color={KindraColors.white}
                      />
                      <Text style={styles.heroPillText}>Matches Studio</Text>
                    </View>
                    <Text style={styles.heroMeta}>7 curated today</Text>
                  </View>

                  <Text style={styles.heroTitle}>
                    Fresh chemistry, ready to chat
                  </Text>
                  <Text style={styles.heroSubtitle}>
                    Every card is AI-ranked, but paced to feel personal.
                  </Text>
                </LinearGradient>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(70).duration(500)}
                style={styles.sectionBlock}
              >
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Fresh Sparks</Text>
                  <Text style={styles.sectionAction}>View all</Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.newMatchesRow}
                >
                  {NEW_MATCHES.map((item, index) => (
                    <Animated.View
                      key={item.id}
                      entering={FadeInDown.delay(110 + index * 70).duration(
                        350,
                      )}
                    >
                      <LiftPressable
                        style={styles.newMatchCard}
                        onPress={onPressItem}
                      >
                        <View style={styles.newAvatarWrap}>
                          <LinearGradient
                            colors={["#5DA4FF", "#2E72F3"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.newAvatarCore}
                          >
                            <Text style={styles.newAvatarText}>
                              {item.avatar}
                            </Text>
                          </LinearGradient>
                          <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>
                              {item.score}%
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.newMatchName}>{item.name}</Text>
                        <Text style={styles.newMatchVibe}>{item.vibe}</Text>
                      </LiftPressable>
                    </Animated.View>
                  ))}
                </ScrollView>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(130).duration(520)}
                style={styles.pulseCard}
              >
                <Animated.View style={[styles.pulseRadarRing, radarStyle]} />

                <View style={styles.pulseTopRow}>
                  <Text style={styles.pulseTitle}>Compatibility Pulse</Text>
                  <Text style={styles.pulseMeta}>Live signal</Text>
                </View>

                <View style={styles.pulseBars}>
                  {PULSE_BARS.map((value, idx) => (
                    <Animated.View
                      key={`pulse-${idx}`}
                      style={[
                        styles.pulseBar,
                        barPulseStyle,
                        { height: 38 + value * 24 },
                      ]}
                    />
                  ))}
                </View>
              </Animated.View>
            </View>
          }
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeIn.delay(110 + index * 60).duration(320)}
            >
              <LiftPressable
                style={styles.conversationCard}
                onPress={onPressItem}
              >
                {item.unread ? <View style={styles.unreadBar} /> : null}

                <View style={styles.rowAvatarWrap}>
                  <View style={styles.rowAvatar}>
                    <Text style={styles.rowAvatarText}>{item.avatar}</Text>
                  </View>
                </View>

                <View style={styles.messageCol}>
                  <View style={styles.nameRow}>
                    <Text
                      style={[
                        styles.nameText,
                        item.unread && styles.nameUnread,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <View style={styles.energyPill}>
                      <Text style={styles.energyText}>{item.energy}</Text>
                    </View>
                  </View>

                  <Text style={styles.previewText} numberOfLines={1}>
                    {item.preview}
                  </Text>
                </View>

                <View style={styles.metaCol}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  <Text style={styles.compatibilityText}>
                    {item.compatibility}%
                  </Text>
                  {item.unread ? <View style={styles.unreadDot} /> : null}
                </View>
              </LiftPressable>
            </Animated.View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: KindraColors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: KindraColors.background,
  },
  listContent: {
    paddingBottom: 116,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  hero: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(62, 141, 255, 0.28)",
  },
  heroGradient: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 174,
    position: "relative",
  },
  heroOrb: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(75, 149, 255, 0.2)",
  },
  heroOrbLeft: {
    top: -90,
    left: -54,
  },
  heroOrbRight: {
    bottom: -100,
    right: -68,
  },
  heroRowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroPill: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroPillText: {
    color: KindraColors.white,
    fontFamily: KindraFonts.bodyMedium,
    fontSize: 11,
  },
  heroMeta: {
    color: KindraColors.primaryLight,
    fontFamily: KindraFonts.body,
    fontSize: 11,
  },
  heroTitle: {
    marginTop: 12,
    color: KindraColors.white,
    fontFamily: KindraFonts.heading,
    fontSize: 30,
    lineHeight: 34,
    maxWidth: 280,
  },
  heroSubtitle: {
    marginTop: 8,
    maxWidth: 260,
    color: "rgba(236, 242, 255, 0.82)",
    fontFamily: KindraFonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  sectionBlock: {
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    color: KindraColors.text,
    fontFamily: KindraFonts.bodyBold,
    fontSize: 15,
  },
  sectionAction: {
    color: KindraColors.primaryMid,
    fontFamily: KindraFonts.bodyMedium,
    fontSize: 12,
  },
  newMatchesRow: {
    gap: 12,
    paddingRight: 8,
  },
  newMatchCard: {
    width: 112,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: KindraColors.border,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    ...KindraShadow,
  },
  newAvatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(75, 149, 255, 0.42)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  newAvatarCore: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  newAvatarText: {
    color: KindraColors.white,
    fontFamily: KindraFonts.heading,
    fontSize: 26,
  },
  newBadge: {
    position: "absolute",
    right: -7,
    top: -4,
    borderRadius: 999,
    backgroundColor: "#2E72F3",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: KindraColors.white,
    fontFamily: KindraFonts.bodyBold,
    fontSize: 9,
  },
  newMatchName: {
    marginTop: 10,
    color: KindraColors.text,
    fontFamily: KindraFonts.bodyBold,
    fontSize: 13,
  },
  newMatchVibe: {
    marginTop: 2,
    color: KindraColors.textMuted,
    fontFamily: KindraFonts.body,
    fontSize: 11,
  },
  pulseCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: KindraColors.border,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    overflow: "hidden",
  },
  pulseRadarRing: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -102,
    right: -56,
    borderWidth: 1,
    borderColor: "rgba(75, 149, 255, 0.35)",
  },
  pulseTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pulseTitle: {
    color: KindraColors.text,
    fontFamily: KindraFonts.bodyBold,
    fontSize: 14,
  },
  pulseMeta: {
    color: KindraColors.primaryMid,
    fontFamily: KindraFonts.bodyMedium,
    fontSize: 11,
  },
  pulseBars: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  pulseBar: {
    width: 11,
    borderRadius: 6,
    backgroundColor: "rgba(75, 149, 255, 0.88)",
  },
  conversationCard: {
    backgroundColor: KindraColors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: KindraColors.border,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    ...KindraShadow,
    position: "relative",
  },
  unreadBar: {
    position: "absolute",
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: KindraColors.primaryMid,
  },
  rowAvatarWrap: {
    marginRight: 10,
  },
  rowAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(62, 141, 255, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(75, 149, 255, 0.35)",
  },
  rowAvatarText: {
    color: KindraColors.white,
    fontFamily: KindraFonts.heading,
    fontSize: 24,
  },
  messageCol: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  nameText: {
    color: KindraColors.text,
    fontFamily: KindraFonts.bodyMedium,
    fontSize: 15,
  },
  nameUnread: {
    fontFamily: KindraFonts.bodyBold,
  },
  energyPill: {
    borderRadius: 999,
    backgroundColor: "rgba(62, 141, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(62, 141, 255, 0.35)",
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  energyText: {
    color: KindraColors.primaryLight,
    fontFamily: KindraFonts.bodyMedium,
    fontSize: 10,
  },
  previewText: {
    color: KindraColors.textSecondary,
    fontFamily: KindraFonts.body,
    fontSize: 13,
  },
  metaCol: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 44,
  },
  timeText: {
    color: KindraColors.textMuted,
    fontFamily: KindraFonts.body,
    fontSize: 11,
  },
  compatibilityText: {
    marginTop: 4,
    color: KindraColors.primaryMid,
    fontFamily: KindraFonts.bodyBold,
    fontSize: 11,
  },
  unreadDot: {
    marginTop: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: KindraColors.primaryMid,
  },
});
