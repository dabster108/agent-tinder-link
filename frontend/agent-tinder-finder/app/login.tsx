import React from "react";
import {
  Alert,
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

import {
  KindraColors,
  KindraFonts,
  KindraShadow,
} from "@/constants/kindraTheme";
import { DefaultAdminCredentials, useAuth } from "@/context/AuthContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LoginScreenRoute() {
  const router = useRouter();
  const { isAuthenticated, signIn } = useAuth();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isPasswordHidden, setIsPasswordHidden] = React.useState(true);
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [focusedInput, setFocusedInput] = React.useState<
    "username" | "password" | null
  >(null);

  const pulse = useSharedValue(0);
  const drift = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const badgeScale = useSharedValue(1);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0, {
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );

    drift.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0, {
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );

    badgeScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 900, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 900, easing: Easing.in(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [badgeScale, drift, pulse]);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, router]);

  const orbLeftStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -10 + pulse.value * 18 },
      { translateY: -6 + drift.value * 12 },
      { scale: 0.95 + pulse.value * 0.14 },
    ],
    opacity: 0.24 + pulse.value * 0.3,
  }));

  const orbRightStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: 12 - pulse.value * 20 },
      { translateY: 8 - drift.value * 16 },
      { scale: 0.92 + pulse.value * 0.1 },
    ],
    opacity: 0.2 + pulse.value * 0.26,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
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
      setIsSubmitting(false);
      setError("Invalid credentials. Use admin / admin@123");
      return;
    }

    setTimeout(() => {
      router.replace("/(tabs)");
      setIsSubmitting(false);
    }, 420);
  }, [isSubmitting, password, router, signIn, username]);

  const onForgot = React.useCallback(() => {
    router.push("/forgot-password");
  }, [router]);

  const onUseDefault = React.useCallback(() => {
    setUsername(DefaultAdminCredentials.username);
    setPassword(DefaultAdminCredentials.password);
    Alert.alert("Default credentials filled", "Tap Sign In to continue.");
  }, []);

  return (
    <LinearGradient
      colors={["#060C18", "#0A1630", "#0A2048", "#123677"]}
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
            <Animated.View style={[styles.badge, badgeStyle]}>
              <Ionicons name="sparkles" size={14} color={KindraColors.white} />
              <Text style={styles.badgeText}>AI ADMIN ACCESS</Text>
            </Animated.View>

            <Text style={styles.welcome}>Welcome back</Text>
            <Text style={styles.title}>SoulSync Control Room</Text>
            <Text style={styles.subtitle}>
              Animated secure login for monitoring match intelligence in real
              time.
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
                color={KindraColors.textSecondary}
              />
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor={KindraColors.textMuted}
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
                color={KindraColors.textSecondary}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={KindraColors.textMuted}
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
                  color={KindraColors.textSecondary}
                />
              </Pressable>
            </View>

            <View style={styles.rowActions}>
              <Pressable onPress={onForgot} style={styles.forgotWrap}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>

              <Pressable onPress={onUseDefault} style={styles.quickFillWrap}>
                <Text style={styles.quickFillText}>Quick fill admin</Text>
              </Pressable>
            </View>

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
                colors={["#2D8BC8", "#4A8CFF", "#8D95FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitGradient}
              >
                <Text style={styles.submitText}>
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Text>
              </LinearGradient>
            </AnimatedPressable>

            <Text style={styles.defaultText}>
              Default admin: admin / admin@123
            </Text>
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
    top: -70,
    left: -40,
    backgroundColor: "rgba(62, 141, 255, 0.24)",
  },
  orbRight: {
    width: 310,
    height: 310,
    right: -120,
    bottom: -80,
    backgroundColor: "rgba(38, 98, 214, 0.2)",
  },
  headerWrap: {
    gap: 8,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: KindraColors.primaryMid,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  badgeText: {
    color: KindraColors.white,
    fontSize: 10,
    letterSpacing: 0.6,
    fontFamily: KindraFonts.bodyBold,
  },
  welcome: {
    color: KindraColors.primaryMid,
    fontSize: 14,
    fontFamily: KindraFonts.bodyMedium,
    letterSpacing: 0.2,
  },
  title: {
    color: KindraColors.text,
    fontSize: 34,
    lineHeight: 38,
    fontFamily: KindraFonts.heading,
  },
  subtitle: {
    color: KindraColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: KindraFonts.body,
    maxWidth: 340,
  },
  card: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: KindraColors.border,
    backgroundColor: "rgba(10, 18, 35, 0.86)",
    ...KindraShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    shadowOpacity: 0.28,
    elevation: 6,
  },
  label: {
    color: KindraColors.text,
    fontSize: 13,
    marginBottom: 8,
    fontFamily: KindraFonts.bodyBold,
  },
  spacingTop: {
    marginTop: 14,
  },
  inputWrap: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: KindraColors.border,
    backgroundColor: "rgba(13, 24, 47, 0.88)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  inputWrapFocused: {
    borderColor: KindraColors.primaryMid,
  },
  input: {
    flex: 1,
    color: KindraColors.text,
    fontFamily: KindraFonts.body,
    fontSize: 14,
    paddingVertical: 10,
  },
  rowActions: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotWrap: {
    alignSelf: "flex-start",
  },
  forgotText: {
    color: KindraColors.primaryMid,
    fontFamily: KindraFonts.bodyMedium,
    fontSize: 13,
  },
  quickFillWrap: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: KindraColors.border,
    backgroundColor: "rgba(14, 25, 48, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  quickFillText: {
    color: KindraColors.textSecondary,
    fontFamily: KindraFonts.bodyMedium,
    fontSize: 12,
  },
  errorText: {
    marginTop: 10,
    color: KindraColors.error,
    fontFamily: KindraFonts.bodyMedium,
    fontSize: 13,
  },
  submitButton: {
    marginTop: 14,
    borderRadius: 14,
    overflow: "hidden",
  },
  submitGradient: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: KindraColors.white,
    fontSize: 15,
    letterSpacing: 0.3,
    fontFamily: KindraFonts.bodyBold,
  },
  defaultText: {
    marginTop: 12,
    color: KindraColors.textSecondary,
    fontSize: 12,
    fontFamily: KindraFonts.body,
    textAlign: "center",
  },
});
