import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, ActivityIndicator, Keyboard, Animated, StatusBar,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { api } from "@/src/api/api";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
    bg: "#0F0E17", card: "#1A1927", cardBorder: "#2A2840",
    accent: "#7C6FCD", accentLight: "#A89EE0", accentGlow: "rgba(124,111,205,0.15)",
    teach: "#34D399", teachBg: "rgba(52,211,153,0.12)", teachBorder: "rgba(52,211,153,0.30)",
    learn: "#F59E0B", learnBg: "rgba(245,158,11,0.12)", learnBorder: "rgba(245,158,11,0.30)",
    textPrimary: "#EEEAF8", textSecondary: "#7B7A8E", textMuted: "#4A4960",
    inputBg: "#141320", white: "#FFFFFF",
};

const LEVELS = [
    { key: "beginner", label: "Beginner", icon: "🌱", color: "#34D399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.30)" },
    { key: "intermediate", label: "Intermediate", icon: "⚡", color: "#60A5FA", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.30)" },
    { key: "advanced", label: "Advanced", icon: "🔥", color: "#F87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.30)" },
    { key: "expert", label: "Expert", icon: "💎", color: "#C084FC", bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.30)" },
];

function LevelCard({ item, selected, onPress }: { item: typeof LEVELS[0]; selected: boolean; onPress: () => void }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const handlePress = () => {
        Animated.sequence([
            Animated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true, speed: 40 }),
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
        ]).start();
        onPress();
    };
    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={1} style={{ flex: 1 }}>
            <Animated.View style={[styles.levelCard, { transform: [{ scale: scaleAnim }] }, selected && { backgroundColor: item.bg, borderColor: item.border }]}>
                <Text style={styles.levelIcon}>{item.icon}</Text>
                <Text style={[styles.levelLabel, selected && { color: item.color }]}>{item.label}</Text>
                {selected && <View style={[styles.levelDot, { backgroundColor: item.color }]} />}
            </Animated.View>
        </TouchableOpacity>
    );
}

function ToggleCard({ label, subtitle, icon, active, activeColor, activeBg, activeBorder, onPress }: {
    label: string; subtitle: string; icon: string; active: boolean;
    activeColor: string; activeBg: string; activeBorder: string; onPress: () => void;
}) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const handlePress = () => {
        Animated.sequence([
            Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 40 }),
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
        ]).start();
        onPress();
    };
    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={1} style={{ flex: 1 }}>
            <Animated.View style={[styles.toggleCard, { transform: [{ scale: scaleAnim }] }, active && { backgroundColor: activeBg, borderColor: activeBorder }]}>
                <View style={styles.toggleCardTop}>
                    <Text style={styles.toggleIcon}>{icon}</Text>
                    <View style={[styles.toggleCheck, active && { backgroundColor: activeColor, borderColor: activeColor }]}>
                        {active && <Ionicons name="checkmark" size={12} color={COLORS.white} />}
                    </View>
                </View>
                <Text style={[styles.toggleLabel, active && { color: activeColor }]}>{label}</Text>
                <Text style={styles.toggleSubtitle}>{subtitle}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

export default function AddSkill() {
    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [selectedSkill, setSelectedSkill] = useState<any>(null);
    const [level, setLevel] = useState("beginner");
    const [canTeach, setCanTeach] = useState(false);
    const [canLearn, setCanLearn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const contentFade = useRef(new Animated.Value(0)).current;
    const contentSlide = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(contentFade, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(contentSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        if (search.length < 2) { setSuggestions([]); return; }
        const delay = setTimeout(() => fetchSkills(search), 400);
        return () => clearTimeout(delay);
    }, [search]);

    const fetchSkills = async (query: string) => {
        try {
            const res = await api.get("/skills/", { params: { search: query } });
            setSuggestions(res.data.results ?? res.data);
        } catch (err) { console.log(err); }
    };

    const handleSelectSkill = (skill: any) => {
        setSelectedSkill(skill); setSearch(skill.name);
        setSuggestions([]); Keyboard.dismiss();
    };

    const handleClearSkill = () => { setSelectedSkill(null); setSearch(""); setSuggestions([]); };

    const handleSubmit = async () => {
        if (!selectedSkill) { alert("Please select a skill"); return; }
        if (!canTeach && !canLearn) { alert("Please select Teach or Learn"); return; }
        setLoading(true);
        try {
            await api.post("users/skills/", { skill: selectedSkill.id, level, can_teach: canTeach, can_learn: canLearn });
            router.back();
        } catch (err) { console.log(err); alert("Failed to add skill"); }
        finally { setLoading(false); }
    };

    const isReady = selectedSkill && (canTeach || canLearn);

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add a Skill</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Animated.View style={{ opacity: contentFade, transform: [{ translateY: contentSlide }] }}>

                    {/* Search */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Search Skill</Text>
                        <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
                            <Ionicons name="search-outline" size={18} color={isFocused ? COLORS.accentLight : COLORS.textMuted} style={{ marginRight: 10 }} />
                            <TextInput
                                placeholder="e.g. Python, Guitar, Photography..."
                                placeholderTextColor={COLORS.textMuted}
                                value={search}
                                onChangeText={(t) => { setSearch(t); if (selectedSkill) setSelectedSkill(null); }}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                style={styles.input}
                            />
                            {search.length > 0 && (
                                <TouchableOpacity onPress={handleClearSkill}>
                                    <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                                </TouchableOpacity>
                            )}
                        </View>
                        {selectedSkill && (
                            <View style={styles.selectedPill}>
                                <Ionicons name="checkmark-circle" size={16} color={COLORS.accentLight} />
                                <Text style={styles.selectedPillText}>{selectedSkill.name}</Text>
                            </View>
                        )}
                        {suggestions.length > 0 && (
                            <View style={styles.dropdown}>
                                {suggestions.map((item, index) => (
                                    <TouchableOpacity key={item.id} style={[styles.dropdownItem, index === suggestions.length - 1 && { borderBottomWidth: 0 }]} onPress={() => handleSelectSkill(item)}>
                                        <Text style={styles.dropdownText}>{item.name}</Text>
                                        <Ionicons name="add" size={16} color={COLORS.textMuted} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Level */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Your Level</Text>
                        <View style={styles.levelGrid}>
                            {LEVELS.map((item) => (
                                <LevelCard key={item.key} item={item} selected={level === item.key} onPress={() => setLevel(item.key)} />
                            ))}
                        </View>
                    </View>

                    {/* Intent */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>I want to…</Text>
                        <View style={styles.toggleRow}>
                            <ToggleCard label="Teach" subtitle="Share what I know" icon="🎓" active={canTeach} activeColor={COLORS.teach} activeBg={COLORS.teachBg} activeBorder={COLORS.teachBorder} onPress={() => setCanTeach(!canTeach)} />
                            <ToggleCard label="Learn" subtitle="Pick up something new" icon="📚" active={canLearn} activeColor={COLORS.learn} activeBg={COLORS.learnBg} activeBorder={COLORS.learnBorder} onPress={() => setCanLearn(!canLearn)} />
                        </View>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity style={[styles.submitBtn, !isReady && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={loading || !isReady} activeOpacity={0.85}>
                        {loading ? <ActivityIndicator color={COLORS.white} /> : (
                            <><Ionicons name="add-circle-outline" size={18} color={COLORS.white} /><Text style={styles.submitText}>Add Skill</Text></>
                        )}
                    </TouchableOpacity>
                    {!isReady && (
                        <Text style={styles.hintText}>
                            {!selectedSkill ? "Search and select a skill to continue" : "Choose at least one — Teach or Learn"}
                        </Text>
                    )}

                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.bg },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, justifyContent: "center", alignItems: "center" },
    headerTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: "700", letterSpacing: -0.3 },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 48, paddingTop: 8 },
    section: { marginBottom: 28 },
    sectionLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 },
    inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14 },
    inputWrapperFocused: { borderColor: COLORS.accent, backgroundColor: COLORS.card },
    input: { flex: 1, color: COLORS.textPrimary, fontSize: 15, padding: 0 },
    selectedPill: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, alignSelf: "flex-start", backgroundColor: COLORS.accentGlow, borderWidth: 1, borderColor: COLORS.accent + "44", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    selectedPillText: { color: COLORS.accentLight, fontSize: 13, fontWeight: "600" },
    dropdown: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 16, marginTop: 8, overflow: "hidden" },
    dropdownItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
    dropdownText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: "500" },
    levelGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    levelCard: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 10, alignItems: "center", gap: 6, minWidth: "22%" },
    levelIcon: { fontSize: 20 },
    levelLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: "600", textAlign: "center" },
    levelDot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
    toggleRow: { flexDirection: "row", gap: 12 },
    toggleCard: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 20, padding: 18, gap: 6 },
    toggleCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
    toggleIcon: { fontSize: 24 },
    toggleCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: COLORS.textMuted, justifyContent: "center", alignItems: "center" },
    toggleLabel: { color: COLORS.textPrimary, fontSize: 16, fontWeight: "700", letterSpacing: -0.3 },
    toggleSubtitle: { color: COLORS.textMuted, fontSize: 12 },
    submitBtn: { backgroundColor: COLORS.accent, borderRadius: 18, paddingVertical: 17, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 8 },
    submitBtnDisabled: { opacity: 0.4 },
    submitText: { color: COLORS.white, fontWeight: "700", fontSize: 16 },
    hintText: { color: COLORS.textMuted, fontSize: 12, textAlign: "center", marginTop: 12 },
});