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
  const progress = useSharedValue(0);
  const float = useSharedValue(0);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.12, {
          duration: 900,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(0.98, {
          duration: 900,
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
        withTiming(0.42, {
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
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0, {
          duration: 1600,
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

  return (
    <LinearGradient
      colors={["#0E0E0E", "#141212", "#1E1211", "#2B0F0F"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <View style={styles.bgShapeTop} />
      <View style={styles.bgShapeBottom} />

      <Animated.View entering={FadeIn.duration(560)} style={styles.centerWrap}>
        <Animated.View style={[styles.halo, haloStyle]} />
        <Animated.View style={[styles.logoOrb, pulseStyle]}>
          <Text style={styles.logoLetter}>S</Text>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(80).duration(540)}
          style={styles.brand}
        >
          SoulSync
        </Animated.Text>

        <View style={styles.loaderWrap}>
          <View style={styles.loaderTrack}>
            <Animated.View style={[styles.loaderFill, progressStyle]} />
          </View>
        </View>
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
});
