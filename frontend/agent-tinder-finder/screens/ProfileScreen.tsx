import React from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import {
  KindraColors,
  KindraFonts,
  KindraShadow,
} from "@/constants/kindraTheme";

const INTERESTS = [
  "Design Systems",
  "AI Agents",
  "Running",
  "Travel",
  "Mindfulness",
  "Music",
  "Coffee Walks",
];

const SETTINGS = [
  { id: "1", title: "Privacy", icon: "lock-closed" },
  { id: "2", title: "Notifications", icon: "notifications" },
  { id: "3", title: "Agent Preferences", icon: "sparkles" },
  { id: "4", title: "Connected Accounts", icon: "link" },
  { id: "5", title: "Appearance", icon: "color-palette" },
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
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 16, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 320 });
      }}
      onPress={onPress}
    >
      {children}
    </AnimatedPressable>
  );
}

export default function ProfileScreen() {
  const onPressAny = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>D</Text>
              </View>
              <ScalePressable style={styles.avatarEdit} onPress={onPressAny}>
                <Ionicons
                  name="create"
                  size={14}
                  color={KindraColors.primary}
                />
              </ScalePressable>
            </View>

            <Text style={styles.name}>Dikshanta</Text>
            <Text style={styles.tagline}>
              Intentional builder, curious conversationalist, and thoughtful
              matcher.
            </Text>
          </View>

          <Animated.View
            entering={FadeInUp.duration(260)}
            style={styles.statsCard}
          >
            {[
              { label: "Matches", value: "128" },
              { label: "Connections", value: "74" },
              { label: "Chats", value: "42" },
            ].map((item, idx) => (
              <View key={item.label} style={styles.statCol}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
                {idx < 2 ? <View style={styles.statDivider} /> : null}
              </View>
            ))}
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(60).duration(260)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>About Me</Text>
            <View style={styles.aboutCard}>
              <View style={styles.aboutAccent} />
              <View style={styles.aboutBody}>
                <Text style={styles.aboutTitle}>Agent Summary</Text>
                <Text style={styles.aboutText}>
                  Your profile suggests you thrive in relationships that balance
                  ambition, emotional clarity, and playful curiosity. You
                  connect best with people who communicate directly and follow
                  through consistently.
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(110).duration(260)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>My Interests</Text>
            <View style={styles.interestWrap}>
              {INTERESTS.map((interest) => (
                <ScalePressable
                  key={interest}
                  style={styles.interestPill}
                  onPress={onPressAny}
                >
                  <Text style={styles.interestText}>{interest}</Text>
                </ScalePressable>
              ))}
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(150).duration(260)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Agent Insights</Text>
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Text style={styles.insightIcon}>🤖</Text>
                <Text style={styles.insightTitle}>What your agent knows</Text>
              </View>
              <Text style={styles.insightText}>
                You naturally build trust through clarity and calm pacing.
                Compatibility tends to rise when conversations include values,
                routines, and long-term intent.
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(210).duration(260)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.settingsList}>
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
                      color={KindraColors.primaryMid}
                    />
                  </View>
                  <Text style={styles.settingLabel}>{item.title}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={17}
                    color={KindraColors.textMuted}
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
  screen: {
    flex: 1,
    backgroundColor: KindraColors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: KindraColors.background,
  },
  content: {
    paddingBottom: 116,
  },
  header: {
    backgroundColor: KindraColors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: KindraColors.accent,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KindraColors.primaryLight,
  },
  avatarText: {
    color: KindraColors.primary,
    fontFamily: KindraFonts.heading,
    fontSize: 42,
  },
  avatarEdit: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KindraColors.white,
    borderWidth: 1,
    borderColor: KindraColors.border,
  },
  name: {
    marginTop: 12,
    color: KindraColors.white,
    fontFamily: KindraFonts.heading,
    fontSize: 26,
  },
  tagline: {
    marginTop: 4,
    color: KindraColors.primaryLight,
    fontFamily: KindraFonts.body,
    fontSize: 13,
    textAlign: "center",
    maxWidth: 290,
    lineHeight: 18,
  },
  statsCard: {
    marginHorizontal: 16,
    marginTop: -34,
    backgroundColor: KindraColors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: KindraColors.border,
    flexDirection: "row",
    paddingVertical: 14,
    ...KindraShadow,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  statValue: {
    color: KindraColors.primaryMid,
    fontFamily: KindraFonts.heading,
    fontSize: 22,
  },
  statLabel: {
    marginTop: 2,
    color: KindraColors.textMuted,
    fontFamily: KindraFonts.body,
    fontSize: 11,
  },
  statDivider: {
    position: "absolute",
    right: 0,
    width: 1,
    top: 8,
    bottom: 8,
    backgroundColor: KindraColors.border,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 10,
  },
  sectionTitle: {
    color: KindraColors.text,
    fontFamily: KindraFonts.bodyBold,
    fontSize: 15,
  },
  aboutCard: {
    backgroundColor: KindraColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: KindraColors.border,
    overflow: "hidden",
    flexDirection: "row",
    ...KindraShadow,
  },
  aboutAccent: {
    width: 4,
    backgroundColor: KindraColors.primaryMid,
  },
  aboutBody: {
    flex: 1,
    padding: 12,
  },
  aboutTitle: {
    color: KindraColors.text,
    fontFamily: KindraFonts.bodyBold,
    fontSize: 13,
    marginBottom: 4,
  },
  aboutText: {
    color: KindraColors.textSecondary,
    fontFamily: KindraFonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  interestWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestPill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: KindraColors.primaryLight,
  },
  interestText: {
    color: KindraColors.primaryMid,
    fontFamily: KindraFonts.bodyMedium,
    fontSize: 13,
  },
  insightCard: {
    backgroundColor: KindraColors.primary,
    borderRadius: 16,
    padding: 12,
    ...KindraShadow,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  insightIcon: {
    fontSize: 18,
  },
  insightTitle: {
    color: KindraColors.white,
    fontFamily: KindraFonts.heading,
    fontSize: 16,
  },
  insightText: {
    marginTop: 8,
    color: KindraColors.primaryLight,
    fontFamily: KindraFonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  settingsList: {
    gap: 8,
  },
  settingRow: {
    backgroundColor: KindraColors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: KindraColors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    ...KindraShadow,
  },
  settingIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KindraColors.primaryLight,
    marginRight: 10,
  },
  settingLabel: {
    flex: 1,
    color: KindraColors.text,
    fontFamily: KindraFonts.bodyMedium,
    fontSize: 14,
  },
});
