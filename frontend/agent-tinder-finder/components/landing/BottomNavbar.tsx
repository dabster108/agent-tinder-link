import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  House,
  MessageCircleMore,
  SearchCheck,
  UserRound,
} from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { LandingColors } from "@/components/landing/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Item = {
  key: string;
  label: string;
  icon: React.ComponentType<{ color: string; size: number }>;
};

const navItems: Item[] = [
  { key: "home", label: "Home", icon: House },
  { key: "matches", label: "Matches", icon: SearchCheck },
  { key: "chat", label: "Chat", icon: MessageCircleMore },
  { key: "profile", label: "Profile", icon: UserRound },
];

type NavItemProps = {
  item: Item;
  active: boolean;
};

function NavItem({ item, active }: NavItemProps) {
  const press = useSharedValue(1);
  const Icon = item.icon;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        press.value = withSpring(0.92, { damping: 14, stiffness: 280 });
      }}
      onPressOut={() => {
        press.value = withSpring(1, { damping: 14, stiffness: 280 });
      }}
      style={[styles.item, active && styles.itemActive, animatedStyle]}
    >
      <Icon color={active ? "#DDF2FF" : "#8EA3C6"} size={18} />
      <Text style={[styles.label, active && styles.labelActive]}>
        {item.label}
      </Text>
    </AnimatedPressable>
  );
}

export function BottomNavbar() {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.nav}>
        {navItems.map((item, index) => (
          <NavItem key={item.key} item={item} active={index === 0} />
        ))}
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
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  nav: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(158, 198, 255, 0.24)",
    backgroundColor: LandingColors.navBase,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    shadowColor: "#2243A7",
    shadowOpacity: 0.34,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  item: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  itemActive: {
    backgroundColor: "rgba(89, 169, 255, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(178, 222, 255, 0.44)",
  },
  label: {
    color: "#94A8CA",
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  labelActive: {
    color: "#E5F4FF",
  },
});
