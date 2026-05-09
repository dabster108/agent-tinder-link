import { Easing } from "react-native-reanimated";

const AnimationPresets = {
  easing: {
    standard: Easing.inOut(Easing.quad),
    softOut: Easing.out(Easing.quad),
    softIn: Easing.in(Easing.quad),
  },
  duration: {
    veryShort: 140,
    short: 220,
    medium: 360,
    long: 600,
    extraLong: 2200,
    pulse: 420,
  },
  spring: {
    default: { damping: 14, stiffness: 320 },
    soft: { damping: 16, stiffness: 300 },
  },
};

export default AnimationPresets;
