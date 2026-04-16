import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

import { SoulCardShadow, SoulSyncTheme } from "@/constants/soulSyncTheme";

const INTERESTS = [
  "Intentional dating",
  "Product design",
  "Running",
  "Road trips",
  "Live music",
  "Coffee walks",
  "Storytelling",
];

const SETTINGS = [
  { id: "1", title: "Privacy", icon: "lock-closed-outline" },
  { id: "2", title: "Notifications", icon: "notifications-outline" },
  { id: "3", title: "Agent Preferences", icon: "sparkles-outline" },
  { id: "4", title: "Connected Accounts", icon: "link-outline" },
  { id: "5", title: "Appearance", icon: "color-palette-outline" },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ScalePressable({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: object;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 16, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 320 });
      }}
    >
      {children}
    </AnimatedPressable>
  );
}

export default function ProfileScreen() {
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + pulse.value * 0.28,
    transform: [{ scale: 0.96 + pulse.value * 0.08 }],
  }));

  const onPressAny = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[SoulSyncTheme.canvas, SoulSyncTheme.canvasAlt, "#1A1312"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.glow, glowStyle]} />

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Animated.View
            entering={FadeInDown.duration(440)}
            style={styles.hero}
          >
            <Text style={styles.heroBrand}>SoulSync</Text>
            <Text style={styles.heroTitle}>Profile</Text>
            <Text style={styles.heroSubtitle}>
              Your match blueprint, refined by your agent.
            </Text>

            <View style={styles.profileCard}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarText}>D</Text>
              </View>

              <View style={styles.profileMeta}>
                <Text style={styles.name}>Dikshanta</Text>
                <Text style={styles.role}>Intentional communicator</Text>
                <Text style={styles.bio}>
                  Calm, curious, and long-term oriented. You connect best
                  through clear values and consistent energy.
                </Text>
              </View>

              <ScalePressable style={styles.editButton} onPress={onPressAny}>
                <Ionicons
                  name="create-outline"
                  size={15}
                  color={SoulSyncTheme.red}
                />
              </ScalePressable>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(60).duration(360)}
            style={styles.statsRow}
          >
            {[
              { label: "Matches", value: "128" },
              { label: "Agent Notes", value: "42" },
              { label: "Ready", value: "19" },
            ].map((item) => (
              <View key={item.label} style={styles.statCard}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(100).duration(360)}
            style={styles.block}
          >
            <Text style={styles.blockTitle}>Interests</Text>
            <View style={styles.chipWrap}>
              {INTERESTS.map((interest) => (
                <ScalePressable
                  key={interest}
                  style={styles.interestChip}
                  onPress={onPressAny}
                >
                  <Text style={styles.interestText}>{interest}</Text>
                </ScalePressable>
              ))}
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(140).duration(360)}
            style={styles.block}
          >
            <Text style={styles.blockTitle}>Agent Summary</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>
                Your conversations perform best when the opener is personal,
                concise, and future-facing. Your top trait blend: emotional
                clarity + thoughtful humor.
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(180).duration(360)}
            style={styles.block}
          >
            <Text style={styles.blockTitle}>Settings</Text>
            <View style={styles.settingsWrap}>
              {SETTINGS.map((item) => (
                <ScalePressable
                  key={item.id}
                  style={styles.settingRow}
                  onPress={onPressAny}
                >
                  <View style={styles.settingIconWrap}>
                    <Ionicons
                      name={item.icon as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color={SoulSyncTheme.red}
                    />
                  </View>
                  <Text style={styles.settingLabel}>{item.title}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={SoulSyncTheme.inkMuted}
                  />
                </ScalePressable>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SoulSyncTheme.canvas,
  },
  safeArea: {
    flex: 1,
  },
  glow: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(229,57,53,0.24)",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
    gap: 12,
  },
  hero: {
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 16,
  },
  heroBrand: {
    color: SoulSyncTheme.red,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  heroTitle: {
    marginTop: 6,
    color: SoulSyncTheme.onDark,
    fontSize: 28,
    fontFamily: "Inter_800ExtraBold",
  },
  heroSubtitle: {
    marginTop: 6,
    color: SoulSyncTheme.onDarkMuted,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Inter_500Medium",
  },
  profileCard: {
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: SoulSyncTheme.card,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    ...SoulCardShadow,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: SoulSyncTheme.red,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#FFF",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  profileMeta: {
    flex: 1,
  },
  name: {
    color: SoulSyncTheme.ink,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  role: {
    marginTop: 2,
    color: SoulSyncTheme.red,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  bio: {
    marginTop: 6,
    color: SoulSyncTheme.inkMuted,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "Inter_500Medium",
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: "rgba(229,57,53,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: SoulSyncTheme.card,
    paddingVertical: 12,
    alignItems: "center",
    ...SoulCardShadow,
  },
  statValue: {
    color: SoulSyncTheme.ink,
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    marginTop: 2,
    color: SoulSyncTheme.inkMuted,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  block: {
    marginTop: 2,
    gap: 10,
  },
  blockTitle: {
    color: SoulSyncTheme.onDark,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(246,242,238,0.94)",
    borderWidth: 1,
    borderColor: "rgba(229,57,53,0.28)",
  },
  interestText: {
    color: SoulSyncTheme.red,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  summaryCard: {
    borderRadius: 18,
    backgroundColor: SoulSyncTheme.card,
    padding: 12,
    ...SoulCardShadow,
  },
  summaryText: {
    color: SoulSyncTheme.inkMuted,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Inter_500Medium",
  },
  settingsWrap: {
    gap: 8,
  },
  settingRow: {
    borderRadius: 16,
    backgroundColor: SoulSyncTheme.card,
    paddingHorizontal: 12,
    paddingVertical: 11,
    alignItems: "center",
    flexDirection: "row",
    ...SoulCardShadow,
  },
  settingIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(229,57,53,0.12)",
    marginRight: 10,
  },
  settingLabel: {
    flex: 1,
    color: SoulSyncTheme.ink,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
