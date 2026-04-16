import React from "react";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
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

  React.useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
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
      withSpring(0.92, { damping: 14, stiffness: 320 }),
      withSpring(1, { damping: 14, stiffness: 320 }),
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
        colors={[SoulSyncTheme.canvas, SoulSyncTheme.canvasAlt, "#1A1312"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.glow, glowStyle]} />

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
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
                <Text style={styles.avatarText}>M</Text>
              </View>
              <View>
                <Text style={styles.headerName}>Mira</Text>
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
              styles.composerWrap,
              {
                paddingBottom: Math.max(insets.bottom, 10),
                marginBottom: tabBarHeight + 4,
              },
            ]}
          >
            <Animated.View style={styles.composerCard}>
              <Pressable style={styles.attachButton} onPress={onPressAny}>
                <Ionicons name="add" size={18} color={SoulSyncTheme.red} />
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
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(229,57,53,0.24)",
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
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
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: SoulSyncTheme.red,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  headerName: {
    color: SoulSyncTheme.onDark,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  headerStatus: {
    color: SoulSyncTheme.onDarkMuted,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 10,
  },
  dayChip: {
    alignSelf: "center",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(246,242,238,0.9)",
  },
  dayChipText: {
    color: SoulSyncTheme.inkMuted,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
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
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sentBubble: {
    backgroundColor: SoulSyncTheme.red,
  },
  receivedBubble: {
    backgroundColor: SoulSyncTheme.card,
    ...SoulCardShadow,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: "Inter_500Medium",
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
    fontFamily: "Inter_500Medium",
  },
  composerWrap: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  composerCard: {
    borderRadius: 18,
    backgroundColor: SoulSyncTheme.card,
    minHeight: 56,
    paddingHorizontal: 10,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    ...SoulCardShadow,
  },
  attachButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(229,57,53,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    color: SoulSyncTheme.ink,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
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
