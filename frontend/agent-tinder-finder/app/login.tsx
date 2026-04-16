import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

import { useAuth } from "@/context/AuthContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SoulTheme = {
  red: "#E53935",
  redDark: "#C62828",
  textPrimary: "#121212",
  textOnDark: "#F8F6F3",
  textMuted: "rgba(248,246,243,0.7)",
  pageBg: "#0F0F0F",
  cardBg: "#F6F2EE",
  inputBg: "#FFFDFC",
  danger: "#D32F2F",
};

export default function LoginScreenRoute() {
  const router = useRouter();
  const { isAuthenticated, signIn } = useAuth();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isPasswordHidden, setIsPasswordHidden] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [focusedInput, setFocusedInput] = React.useState<
    "username" | "password" | null
  >(null);

  const pulse = useSharedValue(0);
  const drift = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1700, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );

    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2100, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2100, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [drift, pulse]);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, router]);

  const orbLeftStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -8 + pulse.value * 16 },
      { translateY: -6 + drift.value * 12 },
      { scale: 0.93 + pulse.value * 0.12 },
    ],
    opacity: 0.22 + pulse.value * 0.25,
  }));

  const orbRightStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: 10 - pulse.value * 18 },
      { translateY: 8 - drift.value * 14 },
      { scale: 0.92 + pulse.value * 0.14 },
    ],
    opacity: 0.2 + pulse.value * 0.22,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const onSubmit = React.useCallback(() => {
    if (isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    const ok = signIn(username, password);
    if (!ok) {
      setError("Invalid credentials. Please try again.");
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      router.replace("/(tabs)");
      setIsSubmitting(false);
    }, 360);
  }, [isSubmitting, password, router, signIn, username]);

  const onForgot = React.useCallback(() => {
    router.push("/forgot-password");
  }, [router]);

  return (
    <LinearGradient
      colors={["#0D0D0D", "#111111", "#151313"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <Animated.View style={[styles.orb, styles.orbLeft, orbLeftStyle]} />
      <Animated.View style={[styles.orb, styles.orbRight, orbRightStyle]} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Animated.View
            entering={FadeInDown.duration(520)}
            style={styles.headerWrap}
          >
            <Text style={styles.brand}>SoulSync</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue to your matches
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(80).duration(620)}
            style={styles.card}
          >
            <Text style={styles.label}>Username</Text>
            <View
              style={[
                styles.inputWrap,
                focusedInput === "username" && styles.inputWrapFocused,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={SoulTheme.redDark}
              />
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Email or username"
                placeholderTextColor="rgba(18,18,18,0.45)"
                style={styles.input}
                autoCapitalize="none"
                onFocus={() => setFocusedInput("username")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <Text style={[styles.label, styles.spacingTop]}>Password</Text>
            <View
              style={[
                styles.inputWrap,
                focusedInput === "password" && styles.inputWrapFocused,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={SoulTheme.redDark}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="rgba(18,18,18,0.45)"
                style={styles.input}
                secureTextEntry={isPasswordHidden}
                autoCapitalize="none"
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
              />
              <Pressable
                onPress={() => setIsPasswordHidden((value) => !value)}
                hitSlop={10}
              >
                <Ionicons
                  name={isPasswordHidden ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color={SoulTheme.redDark}
                />
              </Pressable>
            </View>

            <Pressable onPress={onForgot} style={styles.forgotWrap}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <AnimatedPressable
              style={[styles.submitButton, buttonAnimatedStyle]}
              onPress={onSubmit}
              onPressIn={() => {
                buttonScale.value = withSpring(0.97, {
                  damping: 15,
                  stiffness: 320,
                });
              }}
              onPressOut={() => {
                buttonScale.value = withSpring(1, {
                  damping: 15,
                  stiffness: 320,
                });
              }}
            >
              <LinearGradient
                colors={[SoulTheme.red, "#F04B46"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitGradient}
              >
                <Text style={styles.submitText}>
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Text>
              </LinearGradient>
            </AnimatedPressable>

            <View style={styles.socialRow}>
              <Pressable style={styles.ghostButton}>
                <Ionicons
                  name="logo-google"
                  size={17}
                  color={SoulTheme.textPrimary}
                />
                <Text style={styles.ghostText}>Sign in with Google</Text>
              </Pressable>
              <Pressable style={styles.ghostButton}>
                <Ionicons
                  name="logo-apple"
                  size={17}
                  color={SoulTheme.textPrimary}
                />
                <Text style={styles.ghostText}>Sign in with Apple</Text>
              </Pressable>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: SoulTheme.pageBg,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
    paddingHorizontal: 18,
    justifyContent: "center",
    gap: 18,
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
  },
  orbLeft: {
    width: 240,
    height: 240,
    top: -60,
    left: -60,
    backgroundColor: "rgba(229, 57, 53, 0.28)",
  },
  orbRight: {
    width: 300,
    height: 300,
    right: -120,
    bottom: -90,
    backgroundColor: "rgba(229, 57, 53, 0.22)",
  },
  headerWrap: {
    gap: 8,
  },
  brand: {
    color: SoulTheme.red,
    fontSize: 15,
    letterSpacing: 0.3,
    fontFamily: "Inter_600SemiBold",
  },
  title: {
    color: SoulTheme.textOnDark,
    fontSize: 36,
    lineHeight: 40,
    fontFamily: "Inter_800ExtraBold",
  },
  subtitle: {
    color: SoulTheme.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_500Medium",
    maxWidth: 340,
  },
  card: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: SoulTheme.cardBg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  label: {
    color: SoulTheme.textPrimary,
    fontSize: 13,
    marginBottom: 8,
    fontFamily: "Inter_600SemiBold",
  },
  spacingTop: {
    marginTop: 12,
  },
  inputWrap: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: SoulTheme.inputBg,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  inputWrapFocused: {
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(229, 57, 53, 0.3)",
  },
  input: {
    flex: 1,
    color: SoulTheme.textPrimary,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    paddingVertical: 10,
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginTop: 10,
  },
  forgotText: {
    color: SoulTheme.red,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  errorText: {
    marginTop: 8,
    color: SoulTheme.danger,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  submitButton: {
    marginTop: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  submitGradient: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.2,
  },
  socialRow: {
    marginTop: 12,
    gap: 10,
  },
  ghostButton: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(18,18,18,0.15)",
    backgroundColor: "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  ghostText: {
    color: SoulTheme.textPrimary,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
