import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  runOnJS,
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

type MatchCard = {
  id: string;
  name: string;
  avatar: string;
  summary: string;
  interests: string[];
  score: number;
};

type Feedback = "none" | "like" | "pass";

const CARDS: MatchCard[] = [
  {
    id: "1",
    name: "Mira",
    avatar: "M",
    score: 94,
    summary:
      "Thoughtful product thinker who loves meaningful chats and weekend coffee walks.",
    interests: ["Design", "AI", "Running"],
  },
  {
    id: "2",
    name: "Rohan",
    avatar: "R",
    score: 91,
    summary:
      "Creative collaborator with a calm energy and a habit of asking better questions.",
    interests: ["Startups", "Music", "Travel"],
  },
  {
    id: "3",
    name: "Aanya",
    avatar: "A",
    score: 96,
    summary:
      "Intentional communicator who enjoys deep work, long runs, and balanced ambition.",
    interests: ["Books", "Wellness", "Art"],
  },
  {
    id: "4",
    name: "Kabir",
    avatar: "K",
    score: 89,
    summary:
      "Curious builder with warm humor and a soft spot for spontaneous city adventures.",
    interests: ["Photography", "Coffee", "Product"],
  },
];

const HERO_DOTS = [
  { left: 188, top: 24, size: 4, opacity: 0.9 },
  { left: 222, top: 42, size: 6, opacity: 0.75 },
  { left: 248, top: 72, size: 4, opacity: 0.78 },
  { left: 274, top: 104, size: 4, opacity: 0.72 },
  { left: 210, top: 120, size: 3, opacity: 0.66 },
  { left: 286, top: 144, size: 4, opacity: 0.74 },
  { left: 236, top: 162, size: 5, opacity: 0.7 },
  { left: 300, top: 190, size: 3, opacity: 0.65 },
  { left: 226, top: 208, size: 4, opacity: 0.78 },
  { left: 282, top: 232, size: 4, opacity: 0.8 },
];

const DASHBOARD_METRICS = [
  { id: "s1", label: "Live Fits", value: "32" },
  { id: "s2", label: "Agent Notes", value: "14" },
  { id: "s3", label: "Ready", value: "7" },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ScalePressable({
  onPress,
  style,
  children,
}: {
  onPress: () => void;
  style?: object;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(1);
  const hover = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: -2 * hover.value }],
    opacity: 0.88 + hover.value * 0.12,
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 16, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 320 });
      }}
      onHoverIn={() => {
        hover.value = withTiming(1, { duration: 170 });
      }}
      onHoverOut={() => {
        hover.value = withTiming(0, { duration: 170 });
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

function ProfileCard({ card }: { card: MatchCard }) {
  return (
    <View style={styles.cardInner}>
      <View style={styles.scoreBadge}>
        <Text style={styles.scoreText}>{card.score}% match</Text>
      </View>

      <View style={styles.avatarRing}>
        <View style={styles.avatarCore}>
          <Text style={styles.avatarText}>{card.avatar}</Text>
        </View>
      </View>

      <Text style={styles.cardName}>{card.name}</Text>
      <Text style={styles.cardSummary} numberOfLines={2}>
        {card.summary}
      </Text>

      <View style={styles.tagsRow}>
        {card.interests.map((interest) => (
          <View key={interest} style={styles.interestTag}>
            <Text style={styles.interestText}>{interest}</Text>
          </View>
        ))}
      </View>

      <LinearGradient
        colors={["rgba(7,13,27,0)", "rgba(7,13,27,0.88)"]}
        start={{ x: 0.5, y: 0.55 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.cardGradient}
      />
    </View>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [feedback, setFeedback] = React.useState<Feedback>("none");

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const pulse = useSharedValue(0);
  const heroDrift = useSharedValue(0);
  const deckBreath = useSharedValue(0);
  const chipFloat = useSharedValue(0);

  React.useEffect(() => {
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

    deckBreath.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0, {
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );

    chipFloat.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0, {
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );
  }, [chipFloat, deckBreath, heroDrift]);

  const advance = React.useCallback(() => {
    setIndex((value) => (value + 1) % CARDS.length);
  }, []);

  const triggerFeedback = React.useCallback(
    (type: Feedback) => {
      setFeedback(type);
      pulse.value = 0;
      pulse.value = withTiming(
        1,
        { duration: 210, easing: Easing.out(Easing.quad) },
        () => {
          pulse.value = withTiming(
            0,
            { duration: 240, easing: Easing.in(Easing.quad) },
            () => {
              runOnJS(setFeedback)("none");
            },
          );
        },
      );
    },
    [pulse],
  );

  const swipeOut = React.useCallback(
    (direction: "left" | "right") => {
      const isRight = direction === "right";
      translateX.value = withSpring(
        isRight ? width + 160 : -width - 160,
        {
          damping: 16,
          stiffness: 170,
        },
        (finished) => {
          if (finished) {
            runOnJS(advance)();
            translateX.value = 0;
            translateY.value = 0;
            rotate.value = 0;
          }
        },
      );

      runOnJS(triggerFeedback)(isRight ? "like" : "pass");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [advance, rotate, translateX, translateY, triggerFeedback, width],
  );

  const onAction = React.useCallback(
    (action: "pass" | "like" | "super") => {
      if (action === "pass") {
        swipeOut("left");
        return;
      }
      swipeOut("right");
    },
    [swipeOut],
  );

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotate.value = event.translationX / 20;
    })
    .onEnd((event) => {
      const right = event.translationX > 110 || event.velocityX > 900;
      const left = event.translationX < -110 || event.velocityX < -900;

      if (right) {
        runOnJS(swipeOut)("right");
        return;
      }

      if (left) {
        runOnJS(swipeOut)("left");
        return;
      }

      translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
      rotate.value = withSpring(0, { damping: 15, stiffness: 200 });
    });

  const frontCard = CARDS[index % CARDS.length];
  const nextCard = CARDS[(index + 1) % CARDS.length];

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const backStyle = useAnimatedStyle(() => {
    const amount = Math.min(Math.abs(translateX.value) / 140, 1);
    return {
      opacity: 0.78 + amount * 0.22,
      transform: [
        { scale: 0.94 + amount * 0.05 + deckBreath.value * 0.01 },
        { translateY: -3 * deckBreath.value },
      ],
    };
  });

  const edgeGlowStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
    shadowOpacity: feedback === "none" ? 0 : 0.5 * pulse.value,
    borderColor:
      feedback === "like"
        ? "rgba(26, 188, 156, 0.85)"
        : "rgba(231, 76, 60, 0.8)",
  }));

  const heroDotsStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -4 + heroDrift.value * 8 }],
    opacity: 0.7 + heroDrift.value * 0.3,
  }));

  const aiTagStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -2 + chipFloat.value * 4 }],
    opacity: 0.88 + chipFloat.value * 0.12,
  }));

  const metricsRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -4 + chipFloat.value * 8 }],
  }));

  const deckAuraStyle = useAnimatedStyle(() => ({
    opacity: 0.26 + deckBreath.value * 0.26,
    transform: [{ scale: 0.94 + deckBreath.value * 0.08 }],
  }));

  const actionsRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -1 + chipFloat.value * 2 }],
  }));

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.heroGlowLeft} />
          <View style={styles.heroGlowRight} />

          <Animated.View style={[styles.heroDotsLayer, heroDotsStyle]}>
            {HERO_DOTS.map((dot, indexDot) => (
              <View
                key={`home-hero-dot-${indexDot}`}
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

          <Animated.View entering={FadeInDown.delay(20).duration(470)}>
            <View style={styles.headerTopRow}>
              <View style={styles.logoPill}>
                <Ionicons
                  name="sparkles"
                  size={16}
                  color={KindraColors.white}
                />
                <Text style={styles.logoText}>SoulSync Update</Text>
              </View>
              <ScalePressable
                style={styles.iconButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Ionicons
                  name="notifications"
                  size={18}
                  color={KindraColors.white}
                />
              </ScalePressable>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(90).duration(480)}>
            <Text style={styles.headerTitle}>
              What&apos;s new with SoulSync
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(130).duration(480)}>
            <Text style={styles.headerSubtitle}>
              Swipe picks are now smarter, faster, and tuned to your vibe.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(170).duration(460)}
            style={[styles.aiTag, aiTagStyle]}
          >
            <Text style={styles.aiTagText}>Swipe section</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(230).duration(500)}
            style={[styles.metricsRow, metricsRowStyle]}
          >
            {DASHBOARD_METRICS.map((item) => (
              <View key={item.id} style={styles.metricPill}>
                <Text style={styles.metricValue}>{item.value}</Text>
                <Text style={styles.metricLabel}>{item.label}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        <Animated.View
          entering={FadeInUp.delay(240).duration(520)}
          style={styles.body}
        >
          <View style={styles.deckWrap}>
            <Animated.View style={[styles.deckAura, deckAuraStyle]} />

            <Animated.View style={[styles.card, styles.backCard, backStyle]}>
              <ProfileCard card={nextCard} />
            </Animated.View>

            <GestureDetector gesture={pan}>
              <Animated.View style={[styles.card, frontStyle]}>
                <Animated.View style={[styles.edgeGlow, edgeGlowStyle]} />
                <ProfileCard card={frontCard} />
              </Animated.View>
            </GestureDetector>

            {feedback !== "none" ? (
              <View style={styles.feedbackWrap} pointerEvents="none">
                <BlurView
                  intensity={32}
                  tint="light"
                  style={styles.feedbackBlur}
                >
                  <Text style={styles.feedbackText}>
                    {feedback === "like" ? "Connection found" : "Passed"}
                  </Text>
                </BlurView>
              </View>
            ) : null}
          </View>

          <Animated.View style={[styles.actionsRow, actionsRowStyle]}>
            <ScalePressable
              style={[styles.actionButton, styles.passButton]}
              onPress={() => onAction("pass")}
            >
              <Ionicons name="close" size={24} color={KindraColors.error} />
            </ScalePressable>

            <ScalePressable
              style={[styles.actionButton, styles.likeButton]}
              onPress={() => onAction("like")}
            >
              <Ionicons name="heart" size={28} color={KindraColors.white} />
            </ScalePressable>

            <ScalePressable
              style={[styles.actionButton, styles.starButton]}
              onPress={() => onAction("super")}
            >
              <Ionicons name="star" size={20} color={KindraColors.accent} />
            </ScalePressable>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: KindraColors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: KindraColors.background,
  },
  header: {
    backgroundColor: "#0A0F1A",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 26,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(62, 141, 255, 0.2)",
  },
  heroGlowLeft: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -110,
    left: -70,
    backgroundColor: "rgba(48, 120, 255, 0.13)",
  },
  heroGlowRight: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    bottom: -120,
    right: -90,
    backgroundColor: "rgba(31, 95, 235, 0.14)",
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
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoText: {
    color: KindraColors.white,
    fontFamily: KindraFonts.bodyBold,
    fontSize: 14,
    letterSpacing: 0.4,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  headerTitle: {
    marginTop: 12,
    color: KindraColors.primaryMid,
    fontFamily: "Inter_800ExtraBold",
    fontSize: 40,
    lineHeight: 42,
    letterSpacing: -1.1,
    maxWidth: 280,
  },
  headerSubtitle: {
    marginTop: 10,
    maxWidth: 250,
    color: "rgba(234, 240, 255, 0.82)",
    fontFamily: KindraFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  aiTag: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "rgba(62, 141, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(62, 141, 255, 0.4)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 50,
  },
  aiTagText: {
    color: KindraColors.white,
    fontFamily: KindraFonts.bodyMedium,
    fontSize: 12,
  },
  metricsRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  metricPill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(116, 133, 174, 0.28)",
    backgroundColor: "rgba(12, 21, 40, 0.72)",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  metricValue: {
    color: KindraColors.white,
    fontFamily: KindraFonts.bodyBold,
    fontSize: 14,
  },
  metricLabel: {
    marginTop: 1,
    color: KindraColors.textMuted,
    fontFamily: KindraFonts.body,
    fontSize: 10,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 116,
    marginTop: 8,
  },
  deckWrap: {
    flex: 1,
    justifyContent: "center",
    position: "relative",
  },
  deckAura: {
    position: "absolute",
    width: "90%",
    height: "70%",
    alignSelf: "center",
    borderRadius: 30,
    backgroundColor: "rgba(62, 141, 255, 0.2)",
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "78%",
    borderRadius: 24,
    backgroundColor: KindraColors.card,
    borderWidth: 1,
    borderColor: KindraColors.border,
    padding: 18,
    ...KindraShadow,
  },
  backCard: {
    transform: [{ scale: 0.95 }],
    opacity: 0.82,
  },
  edgeGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  cardInner: {
    flex: 1,
    alignItems: "center",
    paddingTop: 8,
    position: "relative",
  },
  scoreBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: KindraColors.accent,
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 6,
    zIndex: 2,
  },
  scoreText: {
    color: KindraColors.white,
    fontFamily: KindraFonts.bodyBold,
    fontSize: 11,
  },
  avatarRing: {
    marginTop: 24,
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 3,
    borderColor: KindraColors.primaryMid,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCore: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: KindraColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: KindraColors.primary,
    fontFamily: KindraFonts.heading,
    fontSize: 40,
  },
  cardName: {
    marginTop: 18,
    color: KindraColors.text,
    fontFamily: KindraFonts.heading,
    fontSize: 24,
  },
  cardSummary: {
    marginTop: 8,
    textAlign: "center",
    color: KindraColors.textSecondary,
    fontFamily: KindraFonts.body,
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 4,
  },
  tagsRow: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  interestTag: {
    backgroundColor: KindraColors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  interestText: {
    color: KindraColors.primaryMid,
    fontFamily: KindraFonts.bodyMedium,
    fontSize: 12,
  },
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  feedbackWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackBlur: {
    borderRadius: 40,
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: KindraColors.border,
  },
  feedbackText: {
    color: KindraColors.text,
    fontFamily: KindraFonts.bodyBold,
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginTop: 12,
  },
  actionButton: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    ...KindraShadow,
  },
  passButton: {
    width: 58,
    height: 58,
    backgroundColor: "rgba(255, 91, 127, 0.16)",
  },
  likeButton: {
    width: 72,
    height: 72,
    backgroundColor: KindraColors.primaryMid,
  },
  starButton: {
    width: 58,
    height: 58,
    backgroundColor: "rgba(62, 141, 255, 0.16)",
  },
});
