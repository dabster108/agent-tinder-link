import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { UserRound } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { PremiumTheme } from "@/components/premium/theme";

export function DashboardHeader() {
  return (
    <Animated.View entering={FadeInDown.duration(520)} style={styles.wrap}>
      <Pressable style={styles.profileBtn}>
        <UserRound size={18} color={PremiumTheme.accents.blue} />
      </Pressable>
      <View>
        <Text style={styles.greeting}>Good Evening, Dikshanta</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PremiumTheme.surface.border,
    backgroundColor: "rgba(255, 255, 255, 0.78)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8FB8FF",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  greeting: {
    color: PremiumTheme.text.primary,
    fontSize: 19,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
});
