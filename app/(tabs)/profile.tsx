import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/src/context/auth_context";
import { useEffect, useRef, useState } from "react";
import { api } from "@/src/api/api";
import { router } from "expo-router";

const COLORS = {
  bg: "#0F0E17",
  card: "#1A1927",
  cardBorder: "#2A2840",
  accent: "#7C6FCD",
  accentLight: "#A89EE0",
  accentGlow: "rgba(124, 111, 205, 0.15)",
  teach: "#34D399",
  teachBg: "rgba(52, 211, 153, 0.12)",
  teachBorder: "rgba(52, 211, 153, 0.25)",
  learn: "#F59E0B",
  learnBg: "rgba(245, 158, 11, 0.12)",
  learnBorder: "rgba(245, 158, 11, 0.25)",
  danger: "#F87171",
  dangerBg: "rgba(248, 113, 113, 0.10)",
  dangerBorder: "rgba(248, 113, 113, 0.25)",
  textPrimary: "#EEEAF8",
  textSecondary: "#7B7A8E",
  textMuted: "#4A4960",
  white: "#FFFFFF",
};

const LEVEL_COLORS: Record<string, { color: string; bg: string }> = {
  beginner:     { color: "#34D399", bg: "rgba(52,211,153,0.12)" },
  intermediate: { color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
  advanced:     { color: "#F87171", bg: "rgba(248,113,113,0.12)" },
  expert:       { color: "#C084FC", bg: "rgba(192,132,252,0.12)" },
};

function SkillRow({ item, index, accentColor, accentBg, accentBorder }: {
  item: any;
  index: number;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, delay: index * 70, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 70, useNativeDriver: true }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const level = item.level?.toLowerCase() ?? "beginner";
  const levelStyle = LEVEL_COLORS[level] ?? LEVEL_COLORS.beginner;

  return (
    <Animated.View style={[styles.skillRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }], borderColor: accentBorder, backgroundColor: accentBg }]}>
      <View style={[styles.skillAccentBar, { backgroundColor: accentColor }]} />
      <View style={styles.skillRowContent}>
        <Text style={styles.skillRowName}>{item.skill_name}</Text>
        <View style={[styles.levelBadge, { backgroundColor: levelStyle.bg }]}>
          <Text style={[styles.levelBadgeText, { color: levelStyle.color }]}>{item.level}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function SectionBlock({ title, data, accentColor, accentBg, accentBorder, emptyMsg }: {
  title: string;
  data: any[];
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  emptyMsg: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionDot, { backgroundColor: accentColor }]} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={[styles.sectionBadge, { backgroundColor: accentBg }]}>
          <Text style={[styles.sectionBadgeText, { color: accentColor }]}>{data.length}</Text>
        </View>
      </View>
      {data.length === 0 ? (
        <View style={styles.emptySection}>
          <Text style={styles.emptySectionText}>{emptyMsg}</Text>
        </View>
      ) : (
        data.map((item, i) => (
          <SkillRow
            key={item.id}
            item={item}
            index={i}
            accentColor={accentColor}
            accentBg={accentBg}
            accentBorder={accentBorder}
          />
        ))
      )}
    </View>
  );
}

export default function Profile() {
  const { logout } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerScale = useRef(new Animated.Value(0.92)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animateIn = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(headerScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      ]),
      Animated.timing(contentFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const fetchProfile = async () => {
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

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loaderText}>Loading profile…</Text>
      </View>
    );
  }

  const teachSkills = skills.filter((s) => s.can_teach);
  const learnSkills = skills.filter((s) => s.can_learn);
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "??";

  // Derived: how many unique skill names across both
  const uniqueCount = new Set(skills.map((s) => s.skill_name)).size;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── PROFILE HERO ── */}
        <Animated.View
          style={[styles.hero, { opacity: headerFade, transform: [{ scale: headerScale }] }]}
        >
          {/* Avatar */}
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>

          <Text style={styles.heroName}>{user?.username}</Text>
          <Text style={styles.heroEmail}>{user?.email}</Text>

          {/* Mini stats under name */}
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatNum, { color: COLORS.teach }]}>{teachSkills.length}</Text>
              <Text style={styles.heroStatLabel}>Teaching</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatNum, { color: COLORS.learn }]}>{learnSkills.length}</Text>
              <Text style={styles.heroStatLabel}>Learning</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatNum, { color: COLORS.accentLight }]}>{uniqueCount}</Text>
              <Text style={styles.heroStatLabel}>Skills</Text>
            </View>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.75}>
            <Text style={styles.editBtnText}>✏️  Edit Profile</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── SKILL SECTIONS ── */}
        <Animated.View style={{ opacity: contentFade }}>

          <SectionBlock
            title="Skills I Teach"
            data={teachSkills}
            accentColor={COLORS.teach}
            accentBg={COLORS.teachBg}
            accentBorder={COLORS.teachBorder}
            emptyMsg="You haven't added any skills to teach yet."
          />

          <SectionBlock
            title="Skills I'm Learning"
            data={learnSkills}
            accentColor={COLORS.learn}
            accentBg={COLORS.learnBg}
            accentBorder={COLORS.learnBorder}
            emptyMsg="You haven't added any skills to learn yet."
          />

          {/* ── ADD SKILL CTA (if none) ── */}
          {skills.length === 0 && (
            <TouchableOpacity
              style={styles.addSkillCard}
              activeOpacity={0.8}
              onPress={() => router.push("/add-skill")}
            >
              <Text style={styles.addSkillIcon}>🌱</Text>
              <Text style={styles.addSkillText}>Add your first skill</Text>
              <Text style={styles.addSkillArrow}>→</Text>
            </TouchableOpacity>
          )}

          {/* ── ACCOUNT SECTION ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: COLORS.textMuted }]} />
              <Text style={styles.sectionTitle}>Account</Text>
            </View>

            <View style={styles.menuCard}>
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <Text style={styles.menuIcon}>🔔</Text>
                <Text style={styles.menuLabel}>Notifications</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <Text style={styles.menuIcon}>🔒</Text>
                <Text style={styles.menuLabel}>Privacy & Security</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <Text style={styles.menuIcon}>💬</Text>
                <Text style={styles.menuLabel}>Help & Feedback</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── LOGOUT ── */}
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.8}
            onPress={logout}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>SkillSwap v1.0.0</Text>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 48 },

  loaderContainer: {
    flex: 1, backgroundColor: COLORS.bg,
    justifyContent: "center", alignItems: "center", gap: 12,
  },
  loaderText: { color: COLORS.textSecondary, fontSize: 14, marginTop: 8 },

  // Hero
  hero: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 2, borderColor: COLORS.accent,
    padding: 3, marginBottom: 16,
    shadowColor: COLORS.accent, shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 0 }, shadowRadius: 12,
  },
  avatar: {
    flex: 1, borderRadius: 44,
    backgroundColor: COLORS.accentGlow,
    justifyContent: "center", alignItems: "center",
  },
  avatarText: {
    fontSize: 32, color: COLORS.accentLight,
    fontWeight: "800", letterSpacing: 1,
  },
  heroName: {
    color: COLORS.textPrimary, fontSize: 22,
    fontWeight: "800", letterSpacing: -0.5, marginBottom: 4,
  },
  heroEmail: {
    color: COLORS.textSecondary, fontSize: 13,
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.bg, borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 20,
    width: "100%", justifyContent: "space-evenly",
    marginBottom: 20,
  },
  heroStat: { alignItems: "center" },
  heroStatNum: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  heroStatLabel: {
    color: COLORS.textSecondary, fontSize: 11,
    textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2,
  },
  heroStatDivider: {
    width: 1, height: 32, backgroundColor: COLORS.cardBorder,
  },
  editBtn: {
    borderWidth: 1, borderColor: COLORS.cardBorder,
    borderRadius: 30, paddingHorizontal: 22, paddingVertical: 10,
  },
  editBtnText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: "600" },

  // Sections
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8,
  },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: {
    color: COLORS.textPrimary, fontSize: 15,
    fontWeight: "700", flex: 1, letterSpacing: -0.2,
  },
  sectionBadge: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  sectionBadgeText: { fontSize: 12, fontWeight: "700" },

  // Skill rows
  skillRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 14, borderWidth: 1,
    marginBottom: 8, overflow: "hidden",
  },
  skillAccentBar: { width: 3, alignSelf: "stretch" },
  skillRowContent: {
    flex: 1, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 14,
  },
  skillRowName: {
    color: COLORS.textPrimary, fontSize: 14, fontWeight: "600",
  },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  levelBadgeText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },

  emptySection: {
    paddingVertical: 18, paddingHorizontal: 16,
    backgroundColor: COLORS.card, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.cardBorder, borderStyle: "dashed",
  },
  emptySectionText: {
    color: COLORS.textMuted, fontSize: 13, textAlign: "center",
  },

  // Add skill CTA
  addSkillCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.accentGlow,
    borderWidth: 1, borderColor: COLORS.accent + "44",
    borderRadius: 16, padding: 18, marginBottom: 24, gap: 10,
  },
  addSkillIcon: { fontSize: 20 },
  addSkillText: { flex: 1, color: COLORS.accentLight, fontWeight: "600", fontSize: 14 },
  addSkillArrow: { color: COLORS.accent, fontSize: 18, fontWeight: "700" },

  // Account menu
  menuCard: {
    backgroundColor: COLORS.card, borderRadius: 18,
    borderWidth: 1, borderColor: COLORS.cardBorder, overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 18, paddingVertical: 16, gap: 12,
  },
  menuIcon: { fontSize: 18, width: 26 },
  menuLabel: { flex: 1, color: COLORS.textPrimary, fontSize: 14, fontWeight: "500" },
  menuArrow: { color: COLORS.textMuted, fontSize: 20, fontWeight: "300" },
  menuDivider: {
    height: 1, backgroundColor: COLORS.cardBorder,
    marginHorizontal: 18,
  },

  // Logout
  logoutBtn: {
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1, borderColor: COLORS.dangerBorder,
    borderRadius: 16, paddingVertical: 16,
    alignItems: "center", marginBottom: 20,
  },
  logoutText: { color: COLORS.danger, fontWeight: "700", fontSize: 15 },

  versionText: {
    color: COLORS.textMuted, fontSize: 12,
    textAlign: "center", letterSpacing: 0.5,
  },
});