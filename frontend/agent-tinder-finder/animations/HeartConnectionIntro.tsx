import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { AppBackground } from "@/components/premium/AppBackground";
import { PremiumTheme } from "@/components/premium/theme";

type HeartConnectionIntroProps = {
  onComplete: () => void;
};

export function HeartConnectionIntro({
  onComplete,
}: HeartConnectionIntroProps) {
  const leftX = useSharedValue(-90);
  const rightX = useSharedValue(90);
  const lineProgress = useSharedValue(0);
  const pulse = useSharedValue(1);
  const fade = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 520 }),
        withTiming(1, { duration: 520 }),
      ),
      -1,
    );

    lineProgress.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });

    leftX.value = withSpring(-26, { damping: 14, stiffness: 120 });
    rightX.value = withSpring(26, { damping: 14, stiffness: 120 }, () => {
      fade.value = withTiming(0, { duration: 500 }, (done) => {
        if (done) {
          runOnJS(onComplete)();
        }
      });
    });
  }, [fade, leftX, lineProgress, onComplete, pulse, rightX]);

  const leftHeartStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: leftX.value }, { scale: pulse.value }],
  }));

  const rightHeartStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rightX.value }, { scale: pulse.value }],
  }));

  const lineStyle = useAnimatedStyle(() => ({
    width: `${lineProgress.value * 100}%`,
    opacity: 0.4 + lineProgress.value * 0.6,
  }));

  const wrapStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
  }));

  return (
    <Animated.View style={[styles.wrap, wrapStyle]}>
      <AppBackground />
      <View style={styles.centerContent}>
        <View style={styles.heartRow}>
          <Animated.View style={[styles.heartWrap, leftHeartStyle]}>
            <Text style={styles.heart}>❤</Text>
          </Animated.View>
          <Animated.View style={[styles.heartWrap, rightHeartStyle]}>
            <Text style={styles.heart}>❤</Text>
          </Animated.View>
          <Animated.View style={[styles.line, lineStyle]} />
        </View>
        <Text style={styles.title}>agent-tinder-finder</Text>
        <Text style={styles.subtitle}>
          Agents are learning your perfect connection
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  heartRow: {
    width: 260,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  line: {
    position: "absolute",
    height: 2,
    backgroundColor: PremiumTheme.accents.pink,
    shadowColor: PremiumTheme.accents.pink,
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  heartWrap: {
    position: "absolute",
  },
  heart: {
    fontSize: 42,
    color: PremiumTheme.accents.pink,
    textShadowColor: PremiumTheme.accents.pink,
    textShadowRadius: 14,
  },
  title: {
    color: PremiumTheme.text.primary,
    fontSize: 26,
    fontFamily: "Inter_800ExtraBold",
    letterSpacing: -0.4,
    textTransform: "lowercase",
  },
  subtitle: {
    color: PremiumTheme.text.secondary,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
