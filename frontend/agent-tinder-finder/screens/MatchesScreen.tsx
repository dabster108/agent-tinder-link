import React from "react";
import * as Haptics from "expo-haptics";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import {
  KindraColors,
  KindraFonts,
  KindraShadow,
} from "@/constants/kindraTheme";

type NewMatch = {
  id: string;
  name: string;
  avatar: string;
};

type Conversation = {
  id: string;
  name: string;
  avatar: string;
  preview: string;
  time: string;
  unread: boolean;
};

const NEW_MATCHES: NewMatch[] = [
  { id: "n1", name: "Mira", avatar: "M" },
  { id: "n2", name: "Rohan", avatar: "R" },
  { id: "n3", name: "Aanya", avatar: "A" },
  { id: "n4", name: "Kabir", avatar: "K" },
  { id: "n5", name: "Sara", avatar: "S" },
];

const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    name: "Mira",
    avatar: "M",
    preview: "Loved your idea on mindful dating prompts.",
    time: "2m",
    unread: true,
  },
  {
    id: "c2",
    name: "Rohan",
    avatar: "R",
    preview: "Friday coffee still works for me.",
    time: "15m",
    unread: false,
  },
  {
    id: "c3",
    name: "Aanya",
    avatar: "A",
    preview: "Your travel stories are actually elite.",
    time: "1h",
    unread: true,
  },
  {
    id: "c4",
    name: "Kabir",
    avatar: "K",
    preview: "Want to compare playlists this weekend?",
    time: "4h",
    unread: false,
  },
  {
    id: "c5",
    name: "Sara",
    avatar: "S",
    preview: "My agent says we should plan a call.",
    time: "1d",
    unread: false,
  },
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

export default function MatchesScreen() {
  const onPressItem = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <FlatList
          data={CONVERSATIONS}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Matches</Text>
                <Text style={styles.headerSubtitle}>3 new connections</Text>
                <View style={styles.headerPill}>
                  <Text style={styles.headerPillText}>AI-suggested today</Text>
                </View>
              </View>

              <View style={styles.topSection}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.newMatchesRow}
                >
                  {NEW_MATCHES.map((item, index) => (
                    <Animated.View
                      key={item.id}
                      entering={FadeInDown.delay(80 + index * 70).duration(300)}
                      style={styles.newMatchItem}
                    >
                      <ScalePressable onPress={onPressItem}>
                        <View style={styles.newAvatarWrap}>
                          <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>New</Text>
                          </View>
                          <View style={styles.newAvatarCore}>
                            <Text style={styles.newAvatarText}>
                              {item.avatar}
                            </Text>
                          </View>
                        </View>
                      </ScalePressable>
                      <Text style={styles.newMatchName}>{item.name}</Text>
                    </Animated.View>
                  ))}
                </ScrollView>
              </View>
            </View>
          }
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeIn.delay(100 + index * 55).duration(280)}
            >
              <ScalePressable
                style={styles.conversationCard}
                onPress={onPressItem}
              >
                {item.unread ? <View style={styles.unreadBar} /> : null}

                <View style={styles.rowAvatar}>
                  <Text style={styles.rowAvatarText}>{item.avatar}</Text>
                </View>

                <View style={styles.messageCol}>
                  <Text
                    style={[styles.nameText, item.unread && styles.nameUnread]}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.previewText} numberOfLines={1}>
                    {item.preview}
                  </Text>
                </View>

                <View style={styles.metaCol}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  {item.unread ? <View style={styles.unreadDot} /> : null}
                </View>
              </ScalePressable>
            </Animated.View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
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
  header: {
    backgroundColor: KindraColors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  headerTitle: {
    color: KindraColors.white,
    fontFamily: KindraFonts.heading,
    fontSize: 26,
  },
  headerSubtitle: {
    marginTop: 4,
    color: KindraColors.primaryLight,
    fontFamily: KindraFonts.body,
    fontSize: 13,
  },
  headerPill: {
    marginTop: 10,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(62, 141, 255, 0.4)",
    backgroundColor: "rgba(62, 141, 255, 0.2)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerPillText: {
    color: KindraColors.white,
    fontFamily: KindraFonts.bodyMedium,
    fontSize: 11,
  },
  topSection: {
    marginTop: 14,
    paddingHorizontal: 16,
  },
  newMatchesRow: {
    paddingRight: 8,
    gap: 14,
  },
  newMatchItem: {
    width: 74,
    alignItems: "center",
    gap: 8,
  },
  newAvatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: KindraColors.accent,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KindraColors.card,
    ...KindraShadow,
  },
  newAvatarCore: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(62, 141, 255, 0.2)",
  },
  newAvatarText: {
    color: KindraColors.white,
    fontFamily: KindraFonts.heading,
    fontSize: 28,
  },
  newMatchName: {
    color: KindraColors.textSecondary,
    fontFamily: KindraFonts.body,
    fontSize: 11,
    textAlign: "center",
  },
  newBadge: {
    position: "absolute",
    top: -7,
    right: -8,
    backgroundColor: KindraColors.accent,
    borderRadius: 30,
    paddingHorizontal: 6,
    paddingVertical: 3,
    zIndex: 2,
  },
  newBadgeText: {
    color: KindraColors.white,
    fontFamily: KindraFonts.bodyBold,
    fontSize: 9,
  },
  listContent: {
    paddingBottom: 116,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  conversationCard: {
    backgroundColor: KindraColors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: KindraColors.border,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    ...KindraShadow,
    position: "relative",
  },
  unreadBar: {
    position: "absolute",
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: KindraColors.primaryMid,
  },
  rowAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(62, 141, 255, 0.22)",
    marginRight: 10,
  },
  rowAvatarText: {
    color: KindraColors.white,
    fontFamily: KindraFonts.heading,
    fontSize: 24,
  },
  messageCol: {
    flex: 1,
    gap: 4,
  },
  nameText: {
    color: KindraColors.text,
    fontFamily: KindraFonts.bodyMedium,
    fontSize: 15,
  },
  nameUnread: {
    fontFamily: KindraFonts.bodyBold,
  },
  previewText: {
    color: KindraColors.textSecondary,
    fontFamily: KindraFonts.body,
    fontSize: 13,
  },
  metaCol: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 36,
  },
  timeText: {
    color: KindraColors.textMuted,
    fontFamily: KindraFonts.body,
    fontSize: 11,
  },
  unreadDot: {
    marginTop: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: KindraColors.primaryMid,
  },
});
