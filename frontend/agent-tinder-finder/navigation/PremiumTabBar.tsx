import React from "react";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  House,
  MessageCircleMore,
  SearchCheck,
  UserRound,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { PremiumTheme } from "@/components/premium/theme";

type TabMeta = {
  key: string;
  label: string;
  icon: React.ComponentType<{ color?: string; size?: number }>;
};

const tabMeta: Record<string, TabMeta> = {
  index: { key: "index", label: "Home", icon: House },
  matches: { key: "matches", label: "Matches", icon: SearchCheck },
  chat: { key: "chat", label: "Chat", icon: MessageCircleMore },
  profile: { key: "profile", label: "Profile", icon: UserRound },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function TabItem({
  label,
  active,
  Icon,
  onPress,
}: {
  label: string;
  active: boolean;
  Icon: React.ComponentType<{ color?: string; size?: number }>;
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

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        press.value = withSpring(0.92, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        press.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      style={[styles.item, animatedStyle]}
    >
      <Animated.View style={[styles.activePill, activeStyle]}>
        <LinearGradient
          colors={[
            "rgba(116, 184, 255, 0.42)",
            "rgba(200, 207, 255, 0.45)",
            "rgba(255, 215, 236, 0.48)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Icon
        color={active ? PremiumTheme.text.primary : PremiumTheme.text.muted}
        size={18}
      />
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </AnimatedPressable>
  );
}

export function PremiumTabBar({ state, navigation }: BottomTabBarProps) {
  const visibleRoutes = state.routes.filter((route) => tabMeta[route.name]);

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <BlurView intensity={36} tint="light" style={styles.navContainer}>
        <View style={styles.navInner}>
          {visibleRoutes.map((route) => {
            const isFocused =
              state.index ===
              state.routes.findIndex((r) => r.key === route.key);
            const meta = tabMeta[route.name];
            if (!meta) return null;

            const onPress = () => {
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
                label={meta.label}
                Icon={meta.icon}
                onPress={onPress}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  navContainer: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: PremiumTheme.surface.border,
  },
  navInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: PremiumTheme.surface.overlay,
    paddingHorizontal: 6,
    paddingVertical: 8,
    gap: 6,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 8,
    gap: 4,
    overflow: "hidden",
  },
  activePill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(168, 194, 244, 0.54)",
    overflow: "hidden",
  },
  label: {
    color: PremiumTheme.text.muted,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  labelActive: {
    color: PremiumTheme.text.primary,
  },
});
