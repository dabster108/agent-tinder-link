import React, { useEffect } from "react";
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
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
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

type Message = {
  id: string;
  from: "sent" | "received";
  text: string;
  timestamp?: string;
};

const MESSAGES: Message[] = [
  {
    id: "1",
    from: "received",
    text: "Hey, your profile feels really grounded and intentional.",
    timestamp: "Today 10:42 AM",
  },
  {
    id: "2",
    from: "sent",
    text: "Thank you. My agent says we both prioritize calm communication.",
  },
  {
    id: "3",
    from: "received",
    text: "That tracks. Want to do a short call this week?",
    timestamp: "Today 10:45 AM",
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
  const hover = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: -1.5 * hover.value }],
    opacity: 0.86 + hover.value * 0.14,
  }));

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 16, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 320 });
      }}
      onHoverIn={() => {
        hover.value = withTiming(1, { duration: 170 });
      }}
      onHoverOut={() => {
        hover.value = withTiming(0, { duration: 170 });
      }}
      onPress={onPress}
    >
      {children}
    </AnimatedPressable>
  );
}

function Dot({ delay }: { delay: number }) {
  const progress = useSharedValue(0.35);

  useEffect(() => {
    progress.value = withRepeat(
      withDelay(
        delay,
        withSequence(
          withTiming(1, {
            duration: 420,
            easing: Easing.out(Easing.quad),
          }),
          withTiming(0.35, {
            duration: 560,
            easing: Easing.inOut(Easing.quad),
          }),
        ),
      ),
      -1,
      false,
    );
  }, [delay, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.66 + progress.value * 0.48 }],
  }));

  return <Animated.View style={[styles.typingDot, animatedStyle]} />;
}

function TypingIndicatorBubble() {
  return (
    <View style={[styles.bubble, styles.receivedBubble, styles.typingBubble]}>
      <Text style={styles.typingText}>
        Agent is drafting a better opener...
      </Text>
      <View style={styles.typingRow}>
        <Dot delay={0} />
        <Dot delay={110} />
        <Dot delay={220} />
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const composerBottomOffset = Math.max(tabBarHeight, 74) + 8;
  const listRef = React.useRef<FlatList<Message>>(null);

  const [messages, setMessages] = React.useState<Message[]>(MESSAGES);
  const [draft, setDraft] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const replyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const ambient = useSharedValue(0);
  const composerFocus = useSharedValue(0);
  const sendReady = useSharedValue(0);
  const sendBurst = useSharedValue(0);

  const canSend = draft.trim().length > 0;

  React.useEffect(() => {
    ambient.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0, {
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );
  }, [ambient]);

  React.useEffect(() => {
    sendReady.value = withTiming(canSend ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [canSend, sendReady]);

  React.useEffect(() => {
    const id = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 60);
    return () => clearTimeout(id);
  }, [messages.length, isTyping]);

  React.useEffect(() => {
    return () => {
      if (replyTimer.current) {
        clearTimeout(replyTimer.current);
      }
    };
  }, []);

  const onPressAny = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const sendMessage = React.useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendBurst.value = 0;
    sendBurst.value = withSequence(
      withTiming(1, {
        duration: 120,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(0, {
        duration: 190,
        easing: Easing.inOut(Easing.quad),
      }),
    );

    const messageId = `${Date.now()}-sent`;
    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        from: "sent",
        text: trimmed,
      },
    ]);
    setDraft("");
    setIsTyping(true);

    if (replyTimer.current) {
      clearTimeout(replyTimer.current);
    }

    replyTimer.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-received`,
          from: "received",
          text: "Nice one. Want me to suggest a playful follow-up?",
        },
      ]);
      setIsTyping(false);
    }, 950);
  }, [draft, sendBurst]);

  const ambientOrbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -14 + ambient.value * 28 }],
    opacity: 0.28 + ambient.value * 0.24,
  }));

  const composerShellStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      composerFocus.value,
      [0, 1],
      [KindraColors.border, "rgba(75, 149, 255, 0.78)"],
    ),
    shadowOpacity: 0.1 + composerFocus.value * 0.26,
    transform: [{ translateY: -composerFocus.value * 2 }],
  }));

  const composerGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.08 + composerFocus.value * 0.28,
  }));

  const sendButtonStyle = useAnimatedStyle(() => ({
    opacity: 0.56 + sendReady.value * 0.44,
    transform: [
      { scale: 0.84 + sendReady.value * 0.16 + sendBurst.value * 0.06 },
      { translateY: (1 - sendReady.value) * 3 },
    ],
  }));

  const sendIconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: sendBurst.value * 2.2 },
      { translateY: -sendBurst.value * 1.2 },
    ],
  }));

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <View style={styles.header}>
            <Animated.View entering={FadeInDown.delay(20).duration(420)}>
              <ScalePressable style={styles.headerIcon} onPress={onPressAny}>
                <Ionicons
                  name="chevron-back"
                  size={22}
                  color={KindraColors.white}
                />
              </ScalePressable>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(70).duration(430)}
              style={styles.headerCenter}
            >
              <View style={styles.headerAvatarWrap}>
                <View style={styles.headerAvatar}>
                  <Text style={styles.headerAvatarText}>M</Text>
                </View>
                <View style={styles.onlineDot} />
              </View>
              <Text style={styles.headerName}>Mira</Text>
              <Text style={styles.headerStatus}>online now</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(120).duration(420)}>
              <ScalePressable style={styles.headerIcon} onPress={onPressAny}>
                <Ionicons
                  name="videocam"
                  size={20}
                  color={KindraColors.white}
                />
              </ScalePressable>
            </Animated.View>
          </View>

          <View style={styles.messagesWrap}>
            <Animated.View
              style={[styles.ambientOrb, styles.ambientLeft, ambientOrbStyle]}
            />
            <Animated.View
              style={[styles.ambientOrb, styles.ambientRight, ambientOrbStyle]}
            />

            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <Animated.View entering={FadeInUp.delay(80).duration(420)}>
                  <View style={styles.dayChip}>
                    <Text style={styles.dayChipText}>Today</Text>
                  </View>
                </Animated.View>
              }
              renderItem={({ item, index }) => (
                <Animated.View
                  entering={FadeInUp.delay(120 + index * 45).duration(300)}
                >
                  {item.timestamp ? (
                    <Text style={styles.timestamp}>{item.timestamp}</Text>
                  ) : null}

                  <View
                    style={[
                      styles.messageRow,
                      item.from === "sent"
                        ? styles.sentRow
                        : styles.receivedRow,
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
                  <Animated.View entering={FadeInUp.delay(120).duration(280)}>
                    <View style={[styles.messageRow, styles.receivedRow]}>
                      <TypingIndicatorBubble />
                    </View>
                  </Animated.View>
                ) : null
              }
            />
          </View>

          <Animated.View
            style={[
              styles.inputArea,
              {
                paddingBottom: Math.max(insets.bottom, 10),
                marginBottom: composerBottomOffset,
              },
            ]}
          >
            <Animated.View style={[styles.composerShell, composerShellStyle]}>
              <Animated.View
                pointerEvents="none"
                style={[styles.composerGlow, composerGlowStyle]}
              />

              <ScalePressable style={styles.attachButton} onPress={onPressAny}>
                <Ionicons
                  name="add"
                  size={20}
                  color={KindraColors.primaryMid}
                />
              </ScalePressable>

              <View style={styles.inputWrap}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Message Mira"
                  placeholderTextColor={KindraColors.textMuted}
                  style={styles.input}
                  onSubmitEditing={sendMessage}
                  returnKeyType="send"
                  multiline
                  maxLength={280}
                  onFocus={() => {
                    composerFocus.value = withTiming(1, {
                      duration: 220,
                      easing: Easing.out(Easing.cubic),
                    });
                  }}
                  onBlur={() => {
                    composerFocus.value = withTiming(0, {
                      duration: 220,
                      easing: Easing.inOut(Easing.quad),
                    });
                  }}
                />
              </View>

              <AnimatedPressable
                style={styles.sendButtonHitbox}
                onPress={sendMessage}
                disabled={!canSend}
              >
                <Animated.View
                  style={[
                    styles.sendButton,
                    sendButtonStyle,
                    !canSend && styles.sendButtonDisabled,
                  ]}
                >
                  <LinearGradient
                    colors={["#5CA3FF", "#2E72F3"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sendGradient}
                  >
                    <Animated.View style={sendIconStyle}>
                      <Ionicons
                        name="send"
                        size={16}
                        color={KindraColors.white}
                      />
                    </Animated.View>
                  </LinearGradient>
                </Animated.View>
              </AnimatedPressable>
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: KindraColors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(62, 141, 255, 0.23)",
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  headerCenter: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  headerAvatarWrap: {
    position: "relative",
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KindraColors.primaryLight,
  },
  headerAvatarText: {
    color: KindraColors.primary,
    fontFamily: KindraFonts.heading,
    fontSize: 22,
  },
  onlineDot: {
    position: "absolute",
    right: -1,
    bottom: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: KindraColors.success,
    borderWidth: 1,
    borderColor: KindraColors.white,
  },
  headerName: {
    color: KindraColors.white,
    fontFamily: KindraFonts.heading,
    fontSize: 18,
  },
  headerStatus: {
    color: KindraColors.primaryLight,
    fontFamily: KindraFonts.body,
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  messagesWrap: {
    flex: 1,
    position: "relative",
  },
  ambientOrb: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(62, 141, 255, 0.16)",
    zIndex: 0,
  },
  ambientLeft: {
    left: -110,
    top: 46,
  },
  ambientRight: {
    right: -120,
    bottom: 40,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    zIndex: 1,
  },
  dayChip: {
    alignSelf: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(117, 136, 180, 0.35)",
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  dayChipText: {
    color: KindraColors.textMuted,
    fontFamily: KindraFonts.bodyMedium,
    fontSize: 11,
  },
  timestamp: {
    alignSelf: "center",
    marginBottom: 8,
    color: KindraColors.textMuted,
    fontFamily: KindraFonts.body,
    fontSize: 10,
  },
  messageRow: {
    marginBottom: 11,
    flexDirection: "row",
  },
  sentRow: {
    justifyContent: "flex-end",
  },
  receivedRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 19,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  sentBubble: {
    backgroundColor: KindraColors.primaryMid,
    borderBottomRightRadius: 6,
    shadowColor: "#1f7eff",
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  receivedBubble: {
    backgroundColor: KindraColors.card,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(116, 133, 174, 0.22)",
    ...KindraShadow,
  },
  messageText: {
    fontFamily: KindraFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  sentText: {
    color: KindraColors.white,
  },
  receivedText: {
    color: KindraColors.text,
  },
  typingBubble: {
    paddingTop: 10,
    paddingBottom: 9,
  },
  typingText: {
    color: KindraColors.textSecondary,
    fontFamily: KindraFonts.body,
    fontSize: 12,
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: KindraColors.primaryMid,
  },
  inputArea: {
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderTopWidth: 1,
    borderTopColor: "rgba(28, 42, 71, 0.9)",
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  composerShell: {
    borderRadius: 26,
    borderWidth: 1,
    backgroundColor: "rgba(7, 13, 27, 0.94)",
    minHeight: 56,
    paddingVertical: 7,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "flex-end",
    position: "relative",
    shadowColor: "#000",
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  composerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    backgroundColor: "rgba(75, 149, 255, 0.15)",
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(62, 141, 255, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(75, 149, 255, 0.28)",
    marginBottom: 3,
  },
  inputWrap: {
    flex: 1,
    paddingHorizontal: 8,
  },
  input: {
    color: KindraColors.text,
    fontFamily: KindraFonts.body,
    fontSize: 14,
    paddingVertical: 8,
    maxHeight: 108,
    minHeight: 36,
  },
  sendButtonHitbox: {
    padding: 2,
    marginBottom: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    ...KindraShadow,
  },
  sendGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    shadowOpacity: 0,
  },
});
