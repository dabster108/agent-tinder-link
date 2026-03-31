import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
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
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
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

function Dot({ delay }: { delay: number }) {
  const progress = useSharedValue(0.4);

  useEffect(() => {
    progress.value = withRepeat(
      withDelay(
        delay,
        withTiming(1, { duration: 450, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [delay, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.7 + progress.value * 0.4 }],
  }));

  return <Animated.View style={[styles.typingDot, animatedStyle]} />;
}

function TypingIndicatorBubble() {
  return (
    <View style={[styles.bubble, styles.receivedBubble, styles.typingBubble]}>
      <Text style={styles.typingText}>Agent is thinking...</Text>
      <View style={styles.typingRow}>
        <Dot delay={0} />
        <Dot delay={120} />
        <Dot delay={240} />
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();

  const onPressAny = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <View style={styles.header}>
            <ScalePressable style={styles.headerIcon} onPress={onPressAny}>
              <Ionicons
                name="chevron-back"
                size={22}
                color={KindraColors.white}
              />
            </ScalePressable>

            <View style={styles.headerCenter}>
              <View style={styles.headerAvatarWrap}>
                <View style={styles.headerAvatar}>
                  <Text style={styles.headerAvatarText}>M</Text>
                </View>
                <View style={styles.onlineDot} />
              </View>
              <Text style={styles.headerName}>Mira</Text>
            </View>

            <ScalePressable style={styles.headerIcon} onPress={onPressAny}>
              <Ionicons name="videocam" size={20} color={KindraColors.white} />
            </ScalePressable>
          </View>

          <FlatList
            data={MESSAGES}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <Animated.View
                entering={FadeInUp.delay(70 + index * 60).duration(270)}
              >
                {item.timestamp ? (
                  <Text style={styles.timestamp}>{item.timestamp}</Text>
                ) : null}

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
              <Animated.View entering={FadeInUp.delay(300).duration(260)}>
                <View style={[styles.messageRow, styles.receivedRow]}>
                  <TypingIndicatorBubble />
                </View>
              </Animated.View>
            }
          />

          <View
            style={[
              styles.inputArea,
              { paddingBottom: Math.max(insets.bottom, 10) },
            ]}
          >
            <View style={styles.inputRow}>
              <TextInput
                placeholder="Write a message"
                placeholderTextColor={KindraColors.textMuted}
                style={styles.input}
              />

              <ScalePressable style={styles.sendButton} onPress={onPressAny}>
                <Ionicons
                  name="arrow-up"
                  size={18}
                  color={KindraColors.white}
                />
              </ScalePressable>
            </View>
          </View>
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
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  headerCenter: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
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
    bottom: 0,
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
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  timestamp: {
    alignSelf: "center",
    marginBottom: 8,
    color: KindraColors.textMuted,
    fontFamily: KindraFonts.body,
    fontSize: 10,
  },
  messageRow: {
    marginBottom: 10,
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
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  sentBubble: {
    backgroundColor: KindraColors.primaryMid,
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: KindraColors.card,
    borderBottomLeftRadius: 4,
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
    marginTop: 7,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: KindraColors.primaryMid,
  },
  inputArea: {
    borderTopWidth: 1,
    borderTopColor: KindraColors.border,
    backgroundColor: KindraColors.white,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  inputRow: {
    backgroundColor: KindraColors.background,
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    color: KindraColors.text,
    fontFamily: KindraFonts.body,
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KindraColors.primaryMid,
    ...KindraShadow,
  },
});
