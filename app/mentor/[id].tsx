import { api } from "@/src/api/api";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const COLORS = {
    bg: "#0F0E17",
    card: "#1A1927",
    cardBorder: "#2A2840",
    accent: "#7C6FCD",
    accentLight: "#A89EE0",
    accentGlow: "rgba(124,111,205,0.15)",
    textPrimary: "#EEEAF8",
    textSecondary: "#7B7A8E",
    textMuted: "#4A4960",
    white: "#FFFFFF",
};

const LEVEL_COLORS: Record<string, { color: string; bg: string; border: string }> = {
    beginner: { color: "#34D399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.25)" },
    intermediate: { color: "#60A5FA", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.25)" },
    advanced: { color: "#F87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)" },
    expert: { color: "#C084FC", bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.25)" },
};

const AVATAR_COLORS = ["#7C6FCD", "#34D399", "#F59E0B", "#F87171", "#60A5FA", "#C084FC"];

function StatBox({ value, label, color }: { value: string | number; label: string; color: string }) {
    return (
        <View style={styles.statBox}>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function InfoRow({
    icon, label, value,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
}) {
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
                <Ionicons name={icon} size={15} color={COLORS.accentLight} />
            </View>
            <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );
}

function SkillRow({ name, level, isPrimary }: { name: string; level: string; isPrimary?: boolean }) {
    const key = level?.toLowerCase() ?? "beginner";
    const levelStyle = LEVEL_COLORS[key] ?? LEVEL_COLORS.beginner;
    return (
        <View style={[styles.skillRow, { borderColor: levelStyle.border, backgroundColor: levelStyle.bg }]}>
            <View style={[styles.skillAccentBar, { backgroundColor: levelStyle.color }]} />
            <View style={styles.skillRowContent}>
                <View style={styles.skillRowLeft}>
                    <Text style={styles.skillRowName}>{name}</Text>
                    {isPrimary && (
                        <View style={styles.primaryBadge}>
                            <Text style={styles.primaryBadgeText}>Primary</Text>
                        </View>
                    )}
                </View>
                <View style={[styles.levelPill, { backgroundColor: levelStyle.bg, borderColor: levelStyle.border }]}>
                    <Text style={[styles.levelPillText, { color: levelStyle.color }]}>{level}</Text>
                </View>
            </View>
        </View>
    );
}

export default function MentorProfile() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [mentor, setMentor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [requesting, setRequesting] = useState(false);
    const [sessionRequested, setSessionRequested] = useState(false);

    const heroFade = useRef(new Animated.Value(0)).current;
    const heroScale = useRef(new Animated.Value(0.94)).current;
    const contentFade = useRef(new Animated.Value(0)).current;

    const animateIn = () => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(heroFade, { toValue: 1, duration: 450, useNativeDriver: true }),
                Animated.spring(heroScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
            ]),
            Animated.timing(contentFade, { toValue: 1, duration: 380, useNativeDriver: true }),
        ]).start();
    };

    const fetchMentor = useCallback(async () => {
        try {
            const res = await api.get(`/mentors/${id}/`);
            setMentor(res.data);
        } catch (error: any) {
            console.log(error.response?.data);
        } finally {
            setLoading(false);
            animateIn();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => { fetchMentor(); }, [fetchMentor]);

    const handleRequestSession = async () => {
        try{
            setRequesting(true);
            await api.post('/sessions/', {
                userSkill: mentor.id,
            });
            setSessionRequested(true);
        }
        catch(error: any){
            console.log(error.response?.data);
        }finally{
            setRequesting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
                <ActivityIndicator size="large" color={COLORS.accent} />
                <Text style={styles.loaderText}>Loading mentor…</Text>
            </View>
        );
    }

    if (!mentor) {
        return (
            <View style={styles.root}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>👤</Text>
                    <Text style={styles.emptyTitle}>Mentor not found</Text>
                    <Text style={styles.emptySubtitle}>This profile may have been removed.</Text>
                </View>
            </View>
        );
    }

    // ── Derive display values from actual API shape ──
    const username = mentor.mentor.username;
    const bio = mentor.mentor.bio;
    const skillName = mentor.skill.name;
    const skillLevel = mentor.skill.level;
    const otherSkills: any[] = mentor.other_skills ?? [];
    const totalSkills = 1 + otherSkills.length;

    const initials = username.slice(0, 2).toUpperCase();
    const avatarColor = AVATAR_COLORS[username.charCodeAt(0) % AVATAR_COLORS.length];
    const primaryLevelStyle = LEVEL_COLORS[skillLevel?.toLowerCase()] ?? LEVEL_COLORS.beginner;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

            {/* ── HEADER ── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerLabel}>Mentor Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── HERO CARD ── */}
                <Animated.View
                    style={[styles.heroCard, { opacity: heroFade, transform: [{ scale: heroScale }] }]}
                >
                    {/* Colored top strip — unique per mentor */}
                    <View style={[styles.heroStrip, { backgroundColor: avatarColor }]} />

                    <View style={styles.heroBody}>
                        {/* Avatar */}
                        <View style={[styles.avatarRing, { borderColor: avatarColor }]}>
                            <View style={[styles.avatar, { backgroundColor: avatarColor + "22" }]}>
                                <Text style={[styles.avatarText, { color: avatarColor }]}>{initials}</Text>
                            </View>
                        </View>

                        <Text style={styles.heroName}>{username}</Text>

                        {bio ? (
                            <Text style={styles.heroBio}>{bio}</Text>
                        ) : (
                            <Text style={styles.heroBioMuted}>No bio added yet.</Text>
                        )}

                        {/* Available pill */}
                        <View style={styles.availablePill}>
                            <View style={styles.availableDot} />
                            <Text style={styles.availableText}>Available for sessions</Text>
                        </View>

                        <View style={styles.heroDivider} />

                        {/* Stats */}
                        <View style={styles.statsRow}>
                            <StatBox value={totalSkills} label="Skills" color={COLORS.accentLight} />
                            <View style={styles.statDivider} />
                            <StatBox value="4.9" label="Rating" color="#F59E0B" />
                        </View>
                    </View>
                </Animated.View>

                {/* ── ACTIONS ── */}
                <Animated.View style={[styles.actions, { opacity: contentFade }]}>
                    <TouchableOpacity
                        style={[styles.followBtn, isFollowing && styles.followBtnActive]}
                        onPress={() => setIsFollowing((p) => !p)}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={isFollowing ? "person-remove-outline" : "person-add-outline"}
                            size={17}
                            color={isFollowing ? COLORS.white : COLORS.accentLight}
                        />
                        <Text style={[styles.followBtnText, isFollowing && { color: COLORS.white }]}>
                            {isFollowing ? "Following" : "Follow"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.requestBtn, sessionRequested && styles.requestBtnDone]}
                        onPress={handleRequestSession}
                        activeOpacity={0.8}
                        disabled={requesting || sessionRequested}
                    >
                        {requesting ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                        ) : sessionRequested ? (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={17} color={COLORS.white} />
                                <Text style={styles.requestBtnText}>Requested!</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="calendar-outline" size={17} color={COLORS.white} />
                                <Text style={styles.requestBtnText}>Request Session</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </Animated.View>

                {/* ── DETAILS CARD ── */}
                <Animated.View style={[styles.section, { opacity: contentFade }]}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionDot, { backgroundColor: COLORS.accent }]} />
                        <Text style={styles.sectionTitle}>Details</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <InfoRow icon="person-outline" label="Username" value={username} />
                        <View style={styles.infoRowDivider} />
                        <InfoRow icon="school-outline" label="Teaching" value={skillName} />
                        <View style={styles.infoRowDivider} />
                        <InfoRow icon="bar-chart-outline" label="Level" value={skillLevel} />
                        <View style={styles.infoRowDivider} />
                        <InfoRow icon="layers-outline" label="Total Skills" value={`${totalSkills} skill${totalSkills !== 1 ? "s" : ""}`} />
                    </View>
                </Animated.View>

                {/* ── PRIMARY SKILL ── */}
                <Animated.View style={[styles.section, { opacity: contentFade }]}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionDot, { backgroundColor: primaryLevelStyle.color }]} />
                        <Text style={styles.sectionTitle}>Teaching</Text>
                    </View>
                    <SkillRow name={skillName} level={skillLevel} isPrimary />
                </Animated.View>

                {/* ── OTHER SKILLS ── */}
                {otherSkills.length > 0 && (
                    <Animated.View style={[styles.section, { opacity: contentFade }]}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionDot, { backgroundColor: COLORS.textMuted }]} />
                            <Text style={styles.sectionTitle}>Other Skills</Text>
                            <View style={styles.sectionBadge}>
                                <Text style={styles.sectionBadgeText}>{otherSkills.length}</Text>
                            </View>
                        </View>
                        <View style={styles.skillList}>
                            {otherSkills.map((skill: any) => (
                                <SkillRow key={skill.id} name={skill.skill_name} level={skill.level} />
                            ))}
                        </View>
                    </Animated.View>
                )}

                <View style={{ height: 32 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    loaderContainer: { flex: 1, backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center", gap: 12 },
    loaderText: { color: COLORS.textSecondary, fontSize: 14, marginTop: 8 },

    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 },
    headerLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: "600", letterSpacing: 0.3 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, justifyContent: "center", alignItems: "center" },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    heroCard: { backgroundColor: COLORS.card, borderRadius: 24, borderWidth: 1, borderColor: COLORS.cardBorder, overflow: "hidden", marginBottom: 16 },
    heroStrip: { height: 4, width: "100%", opacity: 0.8 },
    heroBody: { alignItems: "center", paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20 },
    avatarRing: { width: 88, height: 88, borderRadius: 44, borderWidth: 2.5, padding: 3, marginBottom: 14 },
    avatar: { flex: 1, borderRadius: 40, justifyContent: "center", alignItems: "center" },
    avatarText: { fontSize: 28, fontWeight: "800", letterSpacing: 0.5 },
    heroName: { color: COLORS.textPrimary, fontSize: 22, fontWeight: "800", letterSpacing: -0.5, marginBottom: 8 },
    heroBio: { color: COLORS.textSecondary, fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 12 },
    heroBioMuted: { color: COLORS.textMuted, fontSize: 13, fontStyle: "italic", marginBottom: 12 },
    availablePill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(52,211,153,0.10)", borderWidth: 1, borderColor: "rgba(52,211,153,0.22)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 20 },
    availableDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#34D399" },
    availableText: { color: "#34D399", fontSize: 12, fontWeight: "600" },
    heroDivider: { width: "100%", height: 1, backgroundColor: COLORS.cardBorder, marginBottom: 16 },
    statsRow: { flexDirection: "row", width: "100%", justifyContent: "space-evenly", alignItems: "center" },
    statBox: { alignItems: "center", flex: 1 },
    statValue: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
    statLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 3 },
    statDivider: { width: 1, height: 32, backgroundColor: COLORS.cardBorder },

    actions: { flexDirection: "row", gap: 12, marginBottom: 24 },
    followBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 16, backgroundColor: COLORS.accentGlow, borderWidth: 1, borderColor: COLORS.accent + "44" },
    followBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
    followBtnText: { color: COLORS.accentLight, fontSize: 14, fontWeight: "700" },
    requestBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 16, backgroundColor: COLORS.accent },
    requestBtnDone: { backgroundColor: "#34D399" },
    requestBtnText: { color: COLORS.white, fontSize: 14, fontWeight: "700" },

    section: { marginBottom: 20 },
    sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
    sectionDot: { width: 7, height: 7, borderRadius: 4 },
    sectionTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: "700", flex: 1, letterSpacing: -0.2 },
    sectionBadge: { backgroundColor: COLORS.cardBorder, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    sectionBadgeText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "600" },

    infoCard: { backgroundColor: COLORS.card, borderRadius: 18, borderWidth: 1, borderColor: COLORS.cardBorder, overflow: "hidden" },
    infoRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
    infoIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.accentGlow, justifyContent: "center", alignItems: "center" },
    infoTextWrap: { flex: 1 },
    infoLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
    infoValue: { color: COLORS.textPrimary, fontSize: 14, fontWeight: "600", marginTop: 2 },
    infoRowDivider: { height: 1, backgroundColor: COLORS.cardBorder, marginHorizontal: 16 },

    skillList: { gap: 10 },
    skillRow: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, overflow: "hidden" },
    skillAccentBar: { width: 3, alignSelf: "stretch" },
    skillRowContent: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 14 },
    skillRowLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
    skillRowName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: "600" },
    primaryBadge: { backgroundColor: COLORS.accentGlow, borderWidth: 1, borderColor: COLORS.accent + "44", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
    primaryBadgeText: { color: COLORS.accentLight, fontSize: 10, fontWeight: "700" },
    levelPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
    levelPillText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },

    emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: "700", marginBottom: 8 },
    emptySubtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: "center" },
});