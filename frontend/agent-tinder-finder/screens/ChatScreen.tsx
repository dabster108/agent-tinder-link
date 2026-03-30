import React from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";

import { AppBackground } from "@/components/premium/AppBackground";
import { GlassCard } from "@/components/premium/GlassCard";
import { TypingIndicator } from "@/components/premium/TypingIndicator";
import { PremiumTheme } from "@/components/premium/theme";

type ChatMessage = {
  id: string;
  content: string;
  sender: "user" | "other";
};

const messages: ChatMessage[] = [
  {
    id: "1",
    content: "My agent says we share a love for long runs and ambient music.",
    sender: "other",
  },
  {
    id: "2",
    content: "Same. Mine predicted we would vibe on creative projects too.",
    sender: "user",
  },
  {
    id: "3",
    content: "Want to plan a weekend coffee sprint?",
    sender: "other",
  },
];

function Bubble({ message }: { message: ChatMessage }) {
  if (message.sender === "user") {
    return (
      <LinearGradient
        colors={[
          PremiumTheme.gradient.electricBlue,
          PremiumTheme.gradient.softViolet,
          PremiumTheme.gradient.softPink,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.bubble, styles.userBubble]}
      >
        <Text style={styles.userText}>{message.content}</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.bubble, styles.otherBubble]}>
      <Text style={styles.otherText}>{message.content}</Text>
    </View>
  );
}

export default function ChatScreen() {
  return (
    <View style={styles.screen}>
      <AppBackground />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.content}>
          <Text style={styles.title}>Chat</Text>
          <Text style={styles.subtitle}>
            Conversation between you, your match, and AI context.
          </Text>

          <GlassCard style={styles.chatWrap}>
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <Animated.View
                  entering={FadeInUp.delay(100 + index * 70).duration(520)}
                  style={[
                    styles.messageRow,
                    item.sender === "user" && styles.userRow,
                  ]}
                >
                  <Bubble message={item} />
                </Animated.View>
              )}
              ListFooterComponent={
                <View style={[styles.messageRow, styles.otherRow]}>
                  <View style={[styles.bubble, styles.otherBubble]}>
                    <TypingIndicator />
                  </View>
                </View>
              }
            />
          </GlassCard>

          <View style={styles.inputWrap}>
            <TextInput
              placeholder="Type a message"
              placeholderTextColor={PremiumTheme.text.muted}
              style={styles.input}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 104,
    gap: 10,
  },
  title: {
    color: PremiumTheme.text.primary,
    fontSize: 30,
    fontFamily: "Inter_800ExtraBold",
    letterSpacing: -0.6,
  },
  subtitle: {
    color: PremiumTheme.text.secondary,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 6,
  },
  chatWrap: {
    flex: 1,
    gap: 8,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  userRow: {
    justifyContent: "flex-end",
  },
  otherRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "84%",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userBubble: {
    borderTopRightRadius: 6,
  },
  otherBubble: {
    backgroundColor: "rgba(152, 174, 240, 0.16)",
    borderWidth: 1,
    borderColor: PremiumTheme.surface.border,
    borderTopLeftRadius: 6,
  },
  userText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_500Medium",
  },
  otherText: {
    color: PremiumTheme.text.primary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
  inputWrap: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PremiumTheme.surface.border,
    backgroundColor: "rgba(255, 255, 255, 0.86)",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  input: {
    color: PremiumTheme.text.primary,
    paddingVertical: 10,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
});
