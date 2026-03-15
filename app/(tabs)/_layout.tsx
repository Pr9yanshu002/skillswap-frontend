import { router, Tabs, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Animated,
  GestureResponderEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useRef } from "react";
import { useAuth } from "@/src/context/auth_context";

const COLORS = {
  bg: "#0F0E17",
  card: "#1A1927",
  cardBorder: "#2A2840",
  accent: "#7C6FCD",
  accentLight: "#A89EE0",
  accentGlow: "rgba(124, 111, 205, 0.18)",
  textSecondary: "#4A4960",
  textPrimary: "#EEEAF8",
};

// ── Custom Tab Bar Button with animated press + glow indicator ──
function TabBarBtn({
  children,
  onPress,
  accessibilityState,
  label,
  route,
}: {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  accessibilityState?: { selected?: boolean };
  label: string;
  route: string;
}) {
  const pathName = usePathname();
  
  const isActive = pathName === route;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  console.log("isActive", isActive);
  console.log(`[${label}] accessibilityState:`, JSON.stringify(accessibilityState));

  useEffect(() => {
    Animated.timing(glowAnim, {
      toValue: isActive ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [glowAnim, isActive]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 30,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const glowBg = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(124,111,205,0)", "rgba(124,111,205,0.18)"],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.tabBtnOuter}
    >
      <Animated.View
        style={[
          styles.tabBtnInner,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Glow pill behind icon */}
        <Animated.View
          style={[styles.glowPill, { backgroundColor: glowBg }]}
        />

        {/* Icon */}
        <View style={styles.iconWrap}>{children}</View>

        {/* Label */}
        <Text
          style={[
            styles.tabLabel,
            isActive ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}
        >
          {label}
        </Text>

        {/* Active dot */}
        {isActive && <View style={styles.activeDot} />}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const { token, loading } = useAuth();

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/login");
    }
  }, [loading, token]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.accentLight,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarButton: (props) => (
            <TabBarBtn {...props} label="Home" route="/">
              <Ionicons
                name={props.accessibilityState?.selected ? "home" : "home-outline"}
                size={22}
                color={
                  props.accessibilityState?.selected
                    ? COLORS.accentLight
                    : COLORS.textSecondary
                }
              />
            </TabBarBtn>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarButton: (props) => (
            <TabBarBtn {...props} label="Profile" route="/profile">
              <Ionicons
                name={props.accessibilityState?.selected ? "person" : "person-outline"}
                size={22}
                color={
                  props.accessibilityState?.selected
                    ? COLORS.accentLight
                    : COLORS.textSecondary
                }
              />
            </TabBarBtn>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
  },

  tabBar: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    height: Platform.OS === "ios" ? 82 : 68,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    paddingTop: 8,
    paddingHorizontal: 16,
    elevation: 0,
    shadowOpacity: 0,
  },

  tabBtnOuter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  tabBtnInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 6,
    position: "relative",
  },

  glowPill: {
    position: "absolute",
    width: 64,
    height: 40,
    borderRadius: 20,
  },

  iconWrap: {
    marginBottom: 3,
  },

  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  tabLabelActive: {
    color: COLORS.accentLight,
  },

  tabLabelInactive: {
    color: COLORS.textSecondary,
  },

  activeDot: {
    position: "absolute",
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
});