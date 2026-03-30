import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";

import { HeartConnectionIntro } from "@/animations/HeartConnectionIntro";
import { AppBackground } from "@/components/premium/AppBackground";
import { AgentStatusCard } from "@/components/premium/dashboard/AgentStatusCard";
import { DashboardHeader } from "@/components/premium/dashboard/Header";
import { QuoteCard } from "@/components/premium/dashboard/QuoteCard";
import { StartDemoButton } from "@/components/premium/dashboard/StartDemoButton";

export default function HomeScreen() {
  const [introDone, setIntroDone] = React.useState(false);

  return (
    <View style={styles.screen}>
      <AppBackground />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Animated.View entering={FadeIn.duration(520)} style={styles.content}>
          <DashboardHeader />

          <View style={styles.stackCenter}>
            <QuoteCard />
            <StartDemoButton />
            <AgentStatusCard />
          </View>
        </Animated.View>
      </SafeAreaView>

      {!introDone ? (
        <HeartConnectionIntro onComplete={() => setIntroDone(true)} />
      ) : null}
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
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 104,
  },
  stackCenter: {
    flex: 1,
    justifyContent: "space-evenly",
    gap: 14,
  },
});
