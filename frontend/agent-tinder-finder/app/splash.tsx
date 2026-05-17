import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useAuth } from "@/context/AuthContext";

export default function SplashScreenRoute() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const orbScale = useSharedValue(1);
  const glow = useSharedValue(0.4);
  const rotate = useSharedValue(0);
  const float = useSharedValue(0);
  const progress = useSharedValue(0);
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    orbScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 900, easing: Easing.out(Easing.cubic) }),
        withTiming(0.96, { duration: 900, easing: Easing.in(Easing.cubic) }),
      ),
      -1,
      false,
    );

    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.34, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );

    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1700, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );

    progress.value = withTiming(1, {
      duration: 2500,
      easing: Easing.out(Easing.cubic),
    });

    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
      -1,
      false,
    );

    rotate.value = withRepeat(
      withTiming(360, { duration: 3600, easing: Easing.linear }),
      -1,
      false,
    );
  }, [float, glow, orbScale, progress, rotate, shimmer]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace(isAuthenticated ? "/(tabs)" : "/login");
    }, 2650);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, router]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }, { translateY: -float.value * 7 }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + glow.value * 0.12 }],
    opacity: 0.15 + glow.value * 0.32,
  }));

  const blobTopStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -float.value * 12 },
      { scale: 1 + glow.value * 0.04 },
    ],
    opacity: 0.38 + glow.value * 0.22,
  }));

  const blobBottomStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: float.value * 12 },
      { scale: 1 + glow.value * 0.06 },
    ],
    opacity: 0.3 + glow.value * 0.2,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    opacity: 0.45 + progress.value * 0.55,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -100 + shimmer.value * 220 }],
    opacity: 0.3 + glow.value * 0.35,
  }));

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
    opacity: 0.55 + glow.value * 0.3,
  }));

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#05090F", "#0C1420", "#1A2432"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.bgShapeTop, blobTopStyle]} />
      <Animated.View style={[styles.bgShapeBottom, blobBottomStyle]} />

      <Animated.View entering={FadeIn.duration(420)} style={styles.centerWrap}>
        <Animated.View style={[styles.halo, haloStyle]} />

        <Animated.View style={[styles.logoOrb, orbStyle]}>
          <LinearGradient
            colors={["#FF8C6A", "#FF5C4D", "#E64537"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logoLetter}>S</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.spinnerRing, spinnerStyle]}>
          <View style={styles.spinnerArc} />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(80).duration(420)}
          style={styles.brand}
        >
          SoulSync
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(160).duration(460)}
          style={styles.tagline}
        >
          AI matchmaking, reimagined
        </Animated.Text>

        <View style={styles.loaderWrap}>
          <View style={styles.loaderTrack}>
            <Animated.View style={[styles.loaderFill, progressStyle]} />
            <Animated.View style={[styles.loaderShimmer, shimmerStyle]} />
          </View>
        </View>
      </Animated.View>
    </View>
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
    width: 420,
    height: 420,
    borderRadius: 210,
    top: -160,
    right: -120,
    backgroundColor: "rgba(255,92,77,0.22)",
  },
  bgShapeBottom: {
    position: "absolute",
    width: 440,
    height: 440,
    borderRadius: 220,
    bottom: -220,
    left: -130,
    backgroundColor: "rgba(102,160,255,0.22)",
  },
  centerWrap: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 24,
  },
  halo: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(255,92,77,0.34)",
  },
  logoOrb: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(243,248,255,0.2)",
    backgroundColor: "rgba(243,248,255,0.08)",
    overflow: "hidden",
  },
  logoGradient: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    color: "#FFFFFF",
    fontSize: 46,
    fontFamily: "DMSerifDisplay_400Regular",
    marginTop: -2,
  },
  brand: {
    marginTop: 24,
    color: "#F3F8FF",
    fontSize: 42,
    letterSpacing: 0.2,
    fontFamily: "DMSerifDisplay_400Regular",
  },
  tagline: {
    marginTop: 2,
    color: "rgba(243,248,255,0.72)",
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontFamily: "DMSans_700Bold",
  },
  loaderWrap: {
    marginTop: 18,
    width: "100%",
    maxWidth: 240,
  },
  loaderTrack: {
    width: "100%",
    height: 6,
    borderRadius: 99,
    backgroundColor: "rgba(243,248,255,0.16)",
    overflow: "hidden",
  },
  loaderFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: "#FF5C4D",
  },
  loaderShimmer: {
    position: "absolute",
    left: 0,
    width: 80,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 99,
  },
  spinnerRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  spinnerArc: {
    position: "absolute",
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 7,
    borderColor: "rgba(243,248,255,0.08)",
    borderTopColor: "rgba(255,140,106,0.95)",
    transform: [{ rotate: "-18deg" }],
  },
});
