import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { api } from "@/src/api/api";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#0F0E17",
  card: "#1A1927",
  cardBorder: "#2A2840",
  accent: "#7C6FCD",
  accentLight: "#A89EE0",
  accentGlow: "rgba(124, 111, 205, 0.15)",
  teach: "#34D399",
  teachBg: "rgba(52, 211, 153, 0.12)",
  learn: "#F59E0B",
  learnBg: "rgba(245, 158, 11, 0.12)",
  textPrimary: "#EEEAF8",
  textSecondary: "#7B7A8E",
  textMuted: "#4A4960",
  white: "#FFFFFF",
};

const LEVEL_COLORS: Record<string, { color: string; bg: string }> = {
  beginner: { color: "#34D399", bg: "rgba(52,211,153,0.12)" },
  intermediate: { color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
  advanced: { color: "#F87171", bg: "rgba(248,113,113,0.12)" },
  expert: { color: "#C084FC", bg: "rgba(192,132,252,0.12)" },
};

function SkillCard({ skill, index }: { skill: any; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const level = skill.level?.toLowerCase() ?? "beginner";
  const levelStyle = LEVEL_COLORS[level] ?? LEVEL_COLORS.beginner;

  return (
    <Animated.View
      style={[
        styles.skillCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.skillCardInner}>
        <View style={styles.skillLeft}>
          <Text style={styles.skillName}>{skill.skill_name}</Text>
          <View style={styles.skillBadges}>
            <View style={[styles.badge, { backgroundColor: levelStyle.bg }]}>
              <Text style={[styles.badgeText, { color: levelStyle.color }]}>
                {skill.level}
              </Text>
            </View>
            {skill.can_teach && (
              <View style={[styles.badge, { backgroundColor: COLORS.teachBg }]}>
                <Text style={[styles.badgeText, { color: COLORS.teach }]}>
                  Teaching
                </Text>
              </View>
            )}
            {skill.can_learn && (
              <View style={[styles.badge, { backgroundColor: COLORS.learnBg }]}>
                <Text style={[styles.badgeText, { color: COLORS.learn }]}>
                  Learning
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.skillDot} />
      </View>
    </Animated.View>
  );
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const statsFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
  }, []);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(statsFade, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fetchData = async () => {
    try {
      const userRes = await api.get("/auth/me/");
      const skillsRes = await api.get("users/me/skills/");
      setUser(userRes.data);
      setSkills(skillsRes.data.results ?? skillsRes.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      animateIn();
    }
  };

  const teachCount = skills.filter((s) => s.can_teach).length;
  const learnCount = skills.filter((s) => s.can_learn).length;

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loaderText}>Loading your skills…</Text>
      </View>
    );
  }

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <Animated.View
          style={[
            styles.header,
            { opacity: headerFade, transform: [{ translateY: headerSlide }] },
          ]}
        >
          <View>
            <Text style={styles.greetingLabel}>Good to see you 👋</Text>
            <Text style={styles.username}>{user?.username}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </Animated.View>

        {/* ── STATS ROW ── */}
        <Animated.View style={[styles.statsRow, { opacity: statsFade }]}>
          <View style={[styles.statCard, { borderColor: COLORS.teach + "44" }]}>
            <Text style={[styles.statNumber, { color: COLORS.teach }]}>
              {teachCount}
            </Text>
            <Text style={styles.statLabel}>Teaching</Text>
          </View>
          <View style={[styles.statCard, { borderColor: COLORS.learn + "44" }]}>
            <Text style={[styles.statNumber, { color: COLORS.learn }]}>
              {learnCount}
            </Text>
            <Text style={styles.statLabel}>Learning</Text>
          </View>
          <View style={[styles.statCard, { borderColor: COLORS.accent + "44" }]}>
            <Text style={[styles.statNumber, { color: COLORS.accentLight }]}>
              {skills.length}
            </Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </Animated.View>

        {/* ── QUICK ACTIONS ── */}
        <Animated.View style={[styles.actionsRow, { opacity: statsFade }]}>
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            activeOpacity={0.8}
            onPress={() => router.push("/_explore")}
          >
            <Text style={styles.actionIcon}>🔎</Text>
            <Text style={styles.actionBtnTextPrimary}>Explore Skills</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnSecondary}
            activeOpacity={0.8}
            onPress={() => router.push("/add-skill")}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionBtnTextSecondary}>Add Skill</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── SKILLS LIST ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Skills</Text>
            <Text style={styles.sectionCount}>{skills.length}</Text>
          </View>

          {skills.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🌱</Text>
              <Text style={styles.emptyTitle}>No skills yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your first skill to start swapping with others.
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push("/add-skill")}
              >
                <Text style={styles.emptyBtnText}>Add a Skill</Text>
              </TouchableOpacity>
            </View>
          ) : (
            skills.map((skill, i) => (
              <SkillCard key={skill.id} skill={skill} index={i} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Loader
  loaderContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loaderText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  greetingLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  username: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.accentGlow,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: COLORS.accentLight,
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 1,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -1,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // Actions
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 32,
  },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionBtnTextPrimary: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
  },
  actionBtnTextSecondary: {
    color: COLORS.textPrimary,
    fontWeight: "600",
    fontSize: 14,
  },

  // Section
  section: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  sectionCount: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "600",
    backgroundColor: COLORS.card,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },

  // Skill Card
  skillCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 10,
    overflow: "hidden",
  },
  skillCardInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  skillLeft: {
    flex: 1,
    gap: 8,
  },
  skillName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  skillBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "capitalize",
  },
  skillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    opacity: 0.5,
    marginLeft: 12,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderStyle: "dashed",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  emptyBtnText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
  },
});