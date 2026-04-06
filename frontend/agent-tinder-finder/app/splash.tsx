import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { KindraFonts } from "@/constants/kindraTheme";
import { useAuth } from "@/context/AuthContext";

const PARTICLES = [
  { size: 10, left: 36, top: 120 },
  { size: 12, left: 312, top: 160 },
  { size: 8, left: 78, top: 570 },
  { size: 14, left: 286, top: 560 },
  { size: 9, left: 182, top: 96 },
];

export default function SplashScreenRoute() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const pulse = useSharedValue(1);
  const spin = useSharedValue(0);
  const glow = useSharedValue(0.5);
  const progress = useSharedValue(0);
  const float = useSharedValue(0);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.12, {
          duration: 820,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(0.98, {
          duration: 820,
          easing: Easing.in(Easing.quad),
        }),
      ),
      -1,
      false,
    );

    glow.value = withRepeat(
      withSequence(
        withTiming(0.95, {
          duration: 980,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0.45, {
          duration: 980,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );

    float.value = withRepeat(
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

    progress.value = withTiming(1, {
      duration: 2200,
      easing: Easing.out(Easing.cubic),
    });

    spin.value = withRepeat(
      withTiming(1, {
        duration: 4200,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [float, glow, progress, pulse, spin]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace(isAuthenticated ? "/(tabs)" : "/login");
    }, 2400);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, router]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }, { translateY: -float.value * 4 }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
    opacity: 0.5 + glow.value * 0.35,
  }));

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + glow.value * 0.08 }],
    opacity: 0.26 + glow.value * 0.35,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    opacity: 0.4 + progress.value * 0.6,
  }));

  const particleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -10 + float.value * 20 },
      { scale: 0.9 + glow.value * 0.2 },
    ],
    opacity: 0.3 + glow.value * 0.6,
  }));

  return (
    <LinearGradient
      colors={["#051320", "#0B2E49", "#0A5A8E", "#49B2CF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <View style={styles.bgShapeTop} />
      <View style={styles.bgShapeBottom} />

      {PARTICLES.map((item, index) => (
        <Animated.View
          key={`${item.left}-${index}`}
          style={[
            styles.particle,
            {
              width: item.size,
              height: item.size,
              borderRadius: item.size / 2,
              left: item.left,
              top: item.top,
            },
            particleStyle,
          ]}
        />
      ))}

      <Animated.View entering={FadeIn.duration(560)} style={styles.centerWrap}>
        <Animated.View style={[styles.halo, haloStyle]} />
        <Animated.View style={[styles.ring, ringStyle]} />
        <Animated.View style={[styles.logoOrb, pulseStyle]}>
          <Text style={styles.logoLetter}>S</Text>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(80).duration(540)}
          style={styles.brand}
        >
          SoulSync
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.delay(120).duration(560)}
          style={styles.tagline}
        >
          Your AI meets first, you meet later.
        </Animated.Text>

        <Animated.View
          entering={FadeInUp.delay(180).duration(560)}
          style={styles.loaderWrap}
        >
          <View style={styles.loaderTrack}>
            <Animated.View style={[styles.loaderFill, progressStyle]} />
          </View>
          <Text style={styles.loaderText}>
            Preparing your intelligent dashboard...
          </Text>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  bgShapeTop: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    top: -90,
    right: -60,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  bgShapeBottom: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    bottom: -170,
    left: -80,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  particle: {
    position: "absolute",
    backgroundColor: "rgba(217, 243, 255, 0.9)",
    shadowColor: "#D4F0FF",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  centerWrap: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  halo: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(167, 226, 255, 0.34)",
  },
  ring: {
    position: "absolute",
    width: 138,
    height: 138,
    borderRadius: 69,
    borderWidth: 1.6,
    borderColor: "rgba(236, 250, 255, 0.58)",
    borderStyle: "dashed",
  },
  logoOrb: {
    width: 94,
    height: 94,
    borderRadius: 47,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.24)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.64)",
  },
  logoLetter: {
    color: "#F8FDFF",
    fontSize: 44,
    fontFamily: KindraFonts.heading,
    marginTop: -2,
  },
  brand: {
    marginTop: 26,
    color: "#FFFFFF",
    fontSize: 38,
    letterSpacing: 0.4,
    fontFamily: KindraFonts.heading,
  },
  tagline: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontFamily: KindraFonts.body,
    textAlign: "center",
  },
  loaderWrap: {
    marginTop: 10,
    width: "100%",
    maxWidth: 290,
    gap: 8,
    alignItems: "center",
  },
  loaderTrack: {
    width: "100%",
    height: 5,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  loaderFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: "#E5F8FF",
  },
  loaderText: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 12,
    fontFamily: KindraFonts.bodyMedium,
  },
});
