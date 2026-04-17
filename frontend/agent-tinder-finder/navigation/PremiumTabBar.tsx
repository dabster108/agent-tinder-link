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

const tabOrder = ["index", "profile", "chat", "matches"] as const;

const SoulTheme = {
  red: "#F22D3D",
  redDeep: "#D91E2E",
  navBg: "#F22D3D",
  navShadow: "rgba(242, 45, 61, 0.4)",
  textInactive: "rgba(255,255,255,0.82)",
  textActive: "#FFFFFF",
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
    transform: [{ scaleX: 0.75 + indicator.value * 0.25 }],
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
        color={active ? SoulTheme.textActive : SoulTheme.textInactive}
        size={24}
      />
      <Animated.View style={[styles.activeDot, activeStyle]} />
    </AnimatedPressable>
  );
}

function CenterAction({ onPress }: { onPress: () => void }) {
  const press = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        press.value = withSpring(0.94, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        press.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      style={[styles.fab, animatedStyle]}
    >
      <Ionicons name="add" color="#FFFFFF" size={42} />
    </AnimatedPressable>
  );
}

export function PremiumTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const routesByName = React.useMemo(() => {
    return new Map(state.routes.map((route) => [route.name, route]));
  }, [state.routes]);

  const openExplore = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("explore");
  }, [navigation]);

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.navInner}>
        {tabOrder.slice(0, 2).map((tabName) => {
          const route = routesByName.get(tabName);
          if (!route) return null;

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

        <View style={styles.centerSlot}>
          <CenterAction onPress={openExplore} />
        </View>

        {tabOrder.slice(2).map((tabName) => {
          const route = routesByName.get(tabName);
          if (!route) return null;

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
    paddingHorizontal: 12,
  },
  navInner: {
    height: 94,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: SoulTheme.navBg,
    borderRadius: 30,
    shadowColor: SoulTheme.navShadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -3 },
    elevation: 18,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingTop: 4,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: "#FFFFFF",
    marginTop: 8,
    opacity: 0,
  },
  centerSlot: {
    width: 72,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -28,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SoulTheme.redDeep,
    borderWidth: 6,
    borderColor: "rgba(255,255,255,0.96)",
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 14,
  },
});
