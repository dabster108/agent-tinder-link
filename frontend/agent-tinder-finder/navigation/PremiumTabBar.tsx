import React from "react";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { KindraColors, KindraFonts } from "@/constants/kindraTheme";

type TabMeta = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const tabMeta: Record<string, TabMeta> = {
  index: { key: "index", label: "Home", icon: "home" },
  matches: { key: "matches", label: "Matches", icon: "heart" },
  chat: { key: "chat", label: "Chat", icon: "chatbubbles" },
  profile: { key: "profile", label: "Profile", icon: "person" },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function TabItem({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const press = useSharedValue(1);
  const indicator = useSharedValue(active ? 1 : 0);

  React.useEffect(() => {
    indicator.value = withTiming(active ? 1 : 0, { duration: 220 });
  }, [active, indicator]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
  }));

  const activeStyle = useAnimatedStyle(() => ({
    opacity: indicator.value,
    transform: [{ scaleX: 0.7 + indicator.value * 0.3 }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: 0.7 + indicator.value * 0.3,
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        press.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        press.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      style={[styles.item, animatedStyle]}
    >
      <Ionicons
        name={active ? `${icon}` : `${icon}-outline`}
        color={active ? KindraColors.primaryMid : KindraColors.textMuted}
        size={22}
      />
      <Animated.View style={[styles.activeDot, activeStyle]} />
      <Animated.Text
        style={[
          styles.label,
          labelStyle,
          active ? styles.labelActive : styles.labelInactive,
        ]}
      >
        {label}
      </Animated.Text>
    </AnimatedPressable>
  );
}

export function PremiumTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const visibleRoutes = state.routes.filter((route) => tabMeta[route.name]);

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.navInner}>
        {visibleRoutes.map((route) => {
          const isFocused =
            state.index === state.routes.findIndex((r) => r.key === route.key);
          const meta = tabMeta[route.name];
          if (!meta) return null;

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              active={isFocused}
              icon={meta.icon}
              label={meta.label}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: KindraColors.card,
    borderTopWidth: 1,
    borderTopColor: KindraColors.border,
    shadowColor: "#15344f",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -2 },
  },
  navInner: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 68,
    paddingTop: 2,
    paddingBottom: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: KindraColors.primaryMid,
    marginTop: 4,
    marginBottom: 4,
    shadowColor: KindraColors.primaryMid,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  label: {
    fontSize: 11,
    fontFamily: KindraFonts.bodyMedium,
    lineHeight: 14,
  },
  labelActive: {
    color: KindraColors.primaryMid,
    fontFamily: KindraFonts.bodyBold,
  },
  labelInactive: {
    color: KindraColors.textMuted,
  },
});
