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
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";

import { KindraColors, KindraFonts } from "@/constants/kindraTheme";

export default function ForgotPasswordScreenRoute() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");

  const onSubmit = React.useCallback(() => {
    if (!email.trim()) {
      Alert.alert("Missing email", "Please enter your email address first.");
      return;
    }

    Alert.alert(
      "Reset requested",
      "Password reset is not connected yet. Contact support for now.",
    );
  }, [email]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Animated.View entering={FadeInUp.duration(420)} style={styles.header}>
          <Pressable
            onPress={() => router.replace("/login")}
            style={styles.backBtn}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={KindraColors.primaryMid}
            />
            <Text style={styles.backText}>Back to login</Text>
          </Pressable>

          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your registered email and we will handle reset support.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(80).duration(520)}
          style={styles.card}
        >
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={KindraColors.textSecondary}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={KindraColors.textMuted}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Pressable style={styles.submitBtn} onPress={onSubmit}>
            <Text style={styles.submitText}>Send Reset Request</Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: KindraColors.background,
  },
  flex: {
    flex: 1,
    paddingHorizontal: 18,
    justifyContent: "center",
    gap: 16,
  },
  header: {
    gap: 8,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 2,
    marginBottom: 4,
  },
  backText: {
    color: KindraColors.primaryMid,
    fontSize: 13,
    fontFamily: KindraFonts.bodyMedium,
  },
  title: {
    color: KindraColors.text,
    fontSize: 30,
    lineHeight: 34,
    fontFamily: KindraFonts.heading,
  },
  subtitle: {
    color: KindraColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: KindraFonts.body,
    maxWidth: 320,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: KindraColors.border,
    backgroundColor: KindraColors.card,
    padding: 16,
    gap: 10,
  },
  label: {
    color: KindraColors.text,
    fontSize: 13,
    fontFamily: KindraFonts.bodyBold,
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
  input: {
    flex: 1,
    color: KindraColors.text,
    fontFamily: KindraFonts.body,
    fontSize: 14,
    paddingVertical: 10,
  },
  submitBtn: {
    marginTop: 4,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: KindraColors.primaryMid,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: KindraColors.white,
    fontSize: 14,
    letterSpacing: 0.2,
    fontFamily: KindraFonts.bodyBold,
  },
});
