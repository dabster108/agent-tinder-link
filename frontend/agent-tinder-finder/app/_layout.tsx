import {
  DefaultTheme,
  type Theme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  useFonts,
} from "@expo-google-fonts/dm-sans";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import * as SystemUI from "expo-system-ui";

import { KindraColors } from "@/constants/kindraTheme";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

const KindraTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: KindraColors.background,
    card: KindraColors.card,
    border: KindraColors.border,
    text: KindraColors.text,
    primary: KindraColors.primaryMid,
    notification: KindraColors.accent,
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    DMSerifDisplay_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(KindraColors.background);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={KindraTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar
        style="dark"
        translucent={false}
        backgroundColor={KindraColors.background}
      />
    </ThemeProvider>
  );
}
