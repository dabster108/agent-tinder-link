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
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
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
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
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
        colors={["rgba(255,255,255,0)", "rgba(244,246,249,0.9)"]}
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
      transform: [{ scale: 0.95 + amount * 0.05 }],
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

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.logoPill}>
              <Ionicons name="sparkles" size={16} color={KindraColors.white} />
              <Text style={styles.logoText}>Kindra</Text>
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

          <Text style={styles.headerTitle}>Discover your people</Text>

          <View style={styles.aiTag}>
            <Text style={styles.aiTagText}>✦ AI-powered matching</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.deckWrap}>
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

          <View style={styles.actionsRow}>
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
          </View>
        </View>
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
    backgroundColor: KindraColors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 26,
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
    fontFamily: KindraFonts.heading,
    fontSize: 22,
    letterSpacing: 0.3,
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
    marginTop: 18,
    color: KindraColors.white,
    fontFamily: KindraFonts.heading,
    fontSize: 28,
    lineHeight: 35,
    maxWidth: 250,
  },
  aiTag: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: KindraColors.accent,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 50,
  },
  aiTagText: {
    color: KindraColors.white,
    fontFamily: KindraFonts.bodyMedium,
    fontSize: 12,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 116,
    marginTop: -14,
  },
  deckWrap: {
    flex: 1,
    justifyContent: "center",
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
    backgroundColor: "#FFE5E5",
  },
  likeButton: {
    width: 72,
    height: 72,
    backgroundColor: KindraColors.primaryMid,
  },
  starButton: {
    width: 58,
    height: 58,
    backgroundColor: KindraColors.accentLight,
  },
});
