import React from "react";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Animated, {
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
import AnimationPresets from "@/constants/animationPresets";

type Message = {
  id: string;
  from: "sent" | "received";
  text: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    from: "received",
    text: "Hey, your profile feels intentional and calm. Want a quick coffee chat this week?",
  },
  {
    id: "2",
    from: "sent",
    text: "Absolutely. I usually prefer evenings. Thursday could work.",
  },
  {
    id: "3",
    from: "received",
    text: "Perfect. I can do 7 PM. Also your reading list is elite.",
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ChatScreen() {
  const params = useLocalSearchParams<{
    userId?: string;
    userName?: string;
    userAvatar?: string;
  }>();

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [messages, setMessages] = React.useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);

  const listRef = React.useRef<FlatList<Message>>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const glow = useSharedValue(0);
  const sendScale = useSharedValue(1);

  const canSend = draft.trim().length > 0;

  const userName =
    typeof params.userName === "string" && params.userName.trim().length > 0
      ? params.userName
      : "Mira";
  const userAvatar =
    typeof params.userAvatar === "string" && params.userAvatar.trim().length > 0
      ? params.userAvatar
      : userName.charAt(0).toUpperCase();

  React.useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: AnimationPresets.duration.extraLong,
          easing: AnimationPresets.easing.standard,
        }),
        withTiming(0, {
          duration: AnimationPresets.duration.extraLong,
          easing: AnimationPresets.easing.standard,
        }),
      ),
      -1,
      false,
    );
  }, [glow]);

  React.useEffect(() => {
    const id = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 60);
    return () => clearTimeout(id);
  }, [messages.length, isTyping]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + glow.value * 0.25,
    transform: [{ scale: 0.95 + glow.value * 0.1 }],
  }));

  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
    opacity: canSend ? 1 : 0.55,
  }));

  const onPressAny = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const onSend = React.useCallback(() => {
    const value = draft.trim();
    if (!value) {
      return;
    }

    onPressAny();
    sendScale.value = withSequence(
      withSpring(0.92, AnimationPresets.spring.default),
      withSpring(1, AnimationPresets.spring.default),
    );

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-sent`, from: "sent", text: value },
    ]);
    setDraft("");
    setIsTyping(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-received`,
          from: "received",
          text: "Love that. I can also ask my agent for a fun first-date plan.",
        },
      ]);
      setIsTyping(false);
    }, 900);
  }, [draft, onPressAny, sendScale]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[SoulSyncTheme.canvas, SoulSyncTheme.canvasAlt, "#1B2430"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.glow, glowStyle]} />

      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? tabBarHeight + 12 : 0}
        >
          <Animated.View
            entering={FadeInDown.duration(420)}
            style={styles.headerCard}
          >
            <Pressable style={styles.iconButton} onPress={onPressAny}>
              <Ionicons
                name="chevron-back"
                size={20}
                color={SoulSyncTheme.onDark}
              />
            </Pressable>

            <View style={styles.headerCenter}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarText}>{userAvatar}</Text>
              </View>
              <View>
                <Text style={styles.headerName}>{userName}</Text>
                <Text style={styles.headerStatus}>Active now</Text>
              </View>
            </View>

            <Pressable style={styles.iconButton} onPress={onPressAny}>
              <Ionicons
                name="call-outline"
                size={18}
                color={SoulSyncTheme.onDark}
              />
            </Pressable>
          </Animated.View>

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            decelerationRate="fast"
            bounces
            scrollEventThrottle={16}
            ListHeaderComponent={
              <Animated.View entering={FadeInUp.delay(60).duration(360)}>
                <View style={styles.dayChip}>
                  <Text style={styles.dayChipText}>Today</Text>
                </View>
              </Animated.View>
            }
            renderItem={({ item, index }) => (
              <Animated.View
                entering={FadeInUp.delay(90 + index * 45).duration(260)}
              >
                <View
                  style={[
                    styles.messageRow,
                    item.from === "sent" ? styles.sentRow : styles.receivedRow,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      item.from === "sent"
                        ? styles.sentBubble
                        : styles.receivedBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        item.from === "sent"
                          ? styles.sentText
                          : styles.receivedText,
                      ]}
                    >
                      {item.text}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}
            ListFooterComponent={
              isTyping ? (
                <Animated.View entering={FadeInUp.duration(260)}>
                  <View style={styles.receivedRow}>
                    <View
                      style={[
                        styles.bubble,
                        styles.receivedBubble,
                        styles.typingBubble,
                      ]}
                    >
                      <Text style={styles.typingText}>Agent is typing...</Text>
                    </View>
                  </View>
                </Animated.View>
              ) : null
            }
          />

          <View
            style={[
              styles.composerWrapAbsolute,
              // PremiumTabBar's inner height is 94; ensure composer clears it.
              // Add extra spacing so the composer doesn't touch the nav bar.
              { bottom: Math.max(insets.bottom, tabBarHeight, 94) + 28 },
            ]}
          >
            <Animated.View style={styles.composerCard}>
              <Pressable style={styles.attachButton} onPress={onPressAny}>
                <Ionicons name="add" size={18} color={SoulSyncTheme.red} />
              </Pressable>

              <Pressable style={styles.cameraButton} onPress={onPressAny}>
                <Ionicons
                  name="camera-outline"
                  size={18}
                  color={SoulSyncTheme.ink}
                />
              </Pressable>

              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Message"
                placeholderTextColor="rgba(23,21,21,0.4)"
                style={styles.input}
                returnKeyType="send"
                onSubmitEditing={onSend}
                maxLength={280}
              />

              <AnimatedPressable
                style={[styles.sendButton, sendButtonStyle]}
                onPress={onSend}
                disabled={!canSend}
              >
                <LinearGradient
                  colors={[SoulSyncTheme.red, "#F04B46"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sendGradient}
                >
                  <Ionicons name="send" size={15} color="#FFF" />
                </LinearGradient>
              </AnimatedPressable>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  glow: {
    position: "absolute",
    top: -110,
    right: -70,
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: "rgba(255,92,77,0.28)",
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 22,
    backgroundColor: "rgba(243,248,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(243,248,255,0.16)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(243,248,255,0.12)",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#FF7B61",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "DMSans_700Bold",
  },
  headerName: {
    color: SoulSyncTheme.onDark,
    fontSize: 15,
    fontFamily: "DMSans_700Bold",
  },
  headerStatus: {
    color: SoulSyncTheme.onDarkMuted,
    fontSize: 11,
    fontFamily: "DMSans_500Medium",
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  dayChip: {
    alignSelf: "center",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(244,247,251,0.92)",
  },
  dayChipText: {
    color: SoulSyncTheme.inkMuted,
    fontSize: 11,
    fontFamily: "DMSans_700Bold",
  },
  messageRow: {
    marginTop: 8,
    flexDirection: "row",
  },
  sentRow: {
    justifyContent: "flex-end",
  },
  receivedRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "84%",
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  sentBubble: {
    backgroundColor: SoulSyncTheme.red,
  },
  receivedBubble: {
    backgroundColor: SoulSyncTheme.cardSoft,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    ...SoulCardShadow,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "DMSans_500Medium",
  },
  sentText: {
    color: "#FFF",
  },
  receivedText: {
    color: SoulSyncTheme.ink,
  },
  typingBubble: {
    minWidth: 132,
  },
  typingText: {
    color: SoulSyncTheme.inkMuted,
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
  },
  composerWrap: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  composerCard: {
    borderRadius: 20,
    backgroundColor: SoulSyncTheme.cardSoft,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    minHeight: 58,
    paddingHorizontal: 11,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    ...SoulCardShadow,
    zIndex: 50,
    elevation: 20,
  },
  attachButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(255,92,77,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(15,23,34,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  composerWrapAbsolute: {
    position: "absolute",
    left: 16,
    right: 16,
    paddingHorizontal: 0,
  },
  input: {
    flex: 1,
    color: SoulSyncTheme.ink,
    fontSize: 15,
    fontFamily: "DMSans_500Medium",
    paddingVertical: 10,
  },
  sendButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  sendGradient: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
