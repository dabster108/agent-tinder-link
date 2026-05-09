import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

  const pulse = useSharedValue(1);
  const glow = useSharedValue(0.5);
  const rotate = useSharedValue(0);
  const float = useSharedValue(0);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 900, easing: Easing.out(Easing.quad) }),
        withTiming(0.98, { duration: 900, easing: Easing.in(Easing.quad) }),
      ),
      -1,
      false,
    );

    glow.value = withRepeat(
      withSequence(
        withTiming(0.95, { duration: 980, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.42, { duration: 980, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );

    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );

    // rotate spinner continuously
    rotate.value = withRepeat(
      withTiming(360, { duration: 1400, easing: Easing.linear }),
      -1,
      false,
    );
  }, [float, glow, progress, pulse]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace(isAuthenticated ? "/(tabs)" : "/login");
    }, 2400);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, router]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }, { translateY: -float.value * 4 }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + glow.value * 0.1 }],
    opacity: 0.2 + glow.value * 0.36,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    opacity: 0.4 + progress.value * 0.6,
  }));

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
    opacity: 0.95,
  }));

  return (
    <View style={[styles.root, styles.rootWhite]}>
      <Animated.View entering={FadeIn.duration(420)} style={styles.centerWrap}>
        <Animated.View style={[styles.halo, haloStyle]} />

        <Animated.View style={[styles.logoOrb, pulseStyle]}>
          <Text style={styles.logoLetter}>S</Text>
        </Animated.View>

        <Animated.View style={[styles.spinnerRing, spinnerStyle]}>
          <View style={styles.spinnerArc} />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(80).duration(420)}
          style={styles.brandDark}
        >
          SoulSync
        </Animated.Text>
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
    width: 360,
    height: 360,
    borderRadius: 180,
    top: -130,
    right: -70,
    backgroundColor: "rgba(229,57,53,0.2)",
  },
  bgShapeBottom: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: 190,
    bottom: -180,
    left: -90,
    backgroundColor: "rgba(229,57,53,0.14)",
  },
  centerWrap: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  halo: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(229,57,53,0.34)",
  },
  logoOrb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(229,57,53,0.28)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },
  logoLetter: {
    color: "#FFFFFF",
    fontSize: 44,
    fontFamily: "Inter_700Bold",
    marginTop: -2,
  },
  brand: {
    marginTop: 24,
    color: "#FFFFFF",
    fontSize: 38,
    letterSpacing: 0.4,
    fontFamily: "Inter_800ExtraBold",
  },
  loaderWrap: {
    marginTop: 14,
    width: "100%",
    maxWidth: 220,
  },
  loaderTrack: {
    width: "100%",
    height: 5,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
  },
  loaderFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: "#E53935",
  },
  rootWhite: {
    backgroundColor: "#FFFFFF",
  },
  brandDark: {
    marginTop: 14,
    color: "#111111",
    fontSize: 28,
    letterSpacing: 0.2,
    fontFamily: "Inter_800ExtraBold",
  },
  spinnerRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  spinnerArc: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: "rgba(229,57,53,0.08)",
    borderLeftColor: "rgba(229,57,53,0.9)",
    transform: [{ rotate: "45deg" }],
  },
});
