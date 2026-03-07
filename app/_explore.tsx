import { api } from "@/src/api/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  bg: "#0F0E17", card: "#1A1927", cardBorder: "#2A2840",
  accent: "#7C6FCD", accentLight: "#A89EE0", accentGlow: "rgba(124,111,205,0.15)",
  textPrimary: "#EEEAF8", textSecondary: "#7B7A8E", textMuted: "#4A4960",
  inputBg: "#141320", white: "#FFFFFF",
};

const LEVEL_COLORS: Record<string, { color: string; bg: string }> = {
  beginner: { color: "#34D399", bg: "rgba(52,211,153,0.12)" },
  intermediate: { color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
  advanced: { color: "#F87171", bg: "rgba(248,113,113,0.12)" },
  expert: { color: "#C084FC", bg: "rgba(192,132,252,0.12)" },
};

const AVATAR_COLORS = ["#7C6FCD", "#34D399", "#F59E0B", "#F87171", "#60A5FA", "#C084FC"];

function MentorCard({ item, index }: { item: any; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, delay: index * 60, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const level = item.level?.toLowerCase() ?? "beginner";
  const levelStyle = LEVEL_COLORS[level] ?? LEVEL_COLORS.beginner;
  const initials = item.username?.slice(0, 2).toUpperCase() ?? "??";
  const avatarColor = AVATAR_COLORS[item.username?.charCodeAt(0) % AVATAR_COLORS.length] ?? AVATAR_COLORS[0];

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.avatar, { backgroundColor: avatarColor + "22", borderColor: avatarColor + "55" }]}>
        <Text style={[styles.avatarText, { color: avatarColor }]}>{initials}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.username}</Text>
        <View style={styles.cardBadges}>
          <Text style={styles.cardSkill}>{item.skill_name}</Text>
          <View style={[styles.levelBadge, { backgroundColor: levelStyle.bg }]}>
            <Text style={[styles.levelBadgeText, { color: levelStyle.color }]}>{item.level}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.connectBtn} activeOpacity={0.8}>
        <Ionicons name="person-add-outline" size={16} color={COLORS.accentLight} />
      </TouchableOpacity>
    </Animated.View>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{hasQuery ? "🔍" : "🌐"}</Text>
      <Text style={styles.emptyTitle}>{hasQuery ? "No mentors found" : "Find your mentor"}</Text>
      <Text style={styles.emptySubtitle}>
        {hasQuery
          ? "Try a different skill or broaden your search."
          : "Search for a skill above to discover people who can teach you."}
      </Text>
    </View>
  );
}

export default function Explore() {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [mentors, setMentors] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loadingMentors, setLoadingMentors] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (search.length < 2) { setSuggestions([]); return; }
    const delay = setTimeout(() => fetchSkills(search), 400);
    return () => clearTimeout(delay);
  }, [search]);

  const fetchSkills = async (query: string) => {
    setSearching(true);
    try {
      const res = await api.get(`/skills/?search=${query}`);
      setSuggestions(res.data.results ?? res.data);
    } catch (err) { console.log(err); }
    finally { setSearching(false); }
  };

  const fetchMentors = async (skillId: number) => {
    setLoadingMentors(true); setMentors([]);
    try {
      const res = await api.get(`/mentors/?skill=${skillId}`);
      setMentors(res.data.results ?? res.data);
    } catch (err) { console.log(err); }
    finally { setLoadingMentors(false); }
  };

  const handleSelectSkill = (skill: any) => {
    setSelectedSkill(skill); setSearch(skill.name);
    setSuggestions([]); fetchMentors(skill.id);
  };

  const handleClear = () => {
    setSearch(""); setSelectedSkill(null);
    setSuggestions([]); setMentors([]);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <Animated.View style={[{ opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          {mentors.length > 0 && (
            <View style={styles.resultsBadge}>
              <Text style={styles.resultsBadgeText}>{mentors.length} found</Text>
            </View>
          )}
        </View>

        {/* Row 2 — title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSub}>Find mentors by skill</Text>
        </View>
      </Animated.View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
          {searching
            ? <ActivityIndicator size="small" color={COLORS.accentLight} style={{ marginRight: 10 }} />
            : <Ionicons name="search-outline" size={18} color={isFocused ? COLORS.accentLight : COLORS.textMuted} style={{ marginRight: 10 }} />
          }
          <TextInput
            placeholder="Search by skill..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={(t) => { setSearch(t); if (selectedSkill) setSelectedSkill(null); }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={styles.input}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {selectedSkill && (
          <View style={styles.selectedPill}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.accentLight} />
            <Text style={styles.selectedPillText}>{selectedSkill.name}</Text>
          </View>
        )}

        {suggestions.length > 0 && (
          <View style={styles.dropdown}>
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.dropdownItem, index === suggestions.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => handleSelectSkill(item)}
              >
                <Text style={styles.dropdownText}>{item.name}</Text>
                <Ionicons name="arrow-forward" size={14} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Results */}
      {loadingMentors ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Finding mentors…</Text>
        </View>
      ) : (
        <FlatList
          data={mentors}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={mentors.length > 0 ? (
            <Text style={styles.listHeader}>
              Mentors teaching <Text style={{ color: COLORS.accentLight }}>{selectedSkill?.name}</Text>
            </Text>
          ) : null}
          ListEmptyComponent={<EmptyState hasQuery={!!selectedSkill} />}
          renderItem={({ item, index }) => <MentorCard item={item} index={index} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, justifyContent: "center", alignItems: "center" },
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  titleBlock: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 28, fontWeight: "800", letterSpacing: -0.8 },
  headerSub: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  resultsBadge: { backgroundColor: COLORS.accentGlow, borderWidth: 1, borderColor: COLORS.accent + "44", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  resultsBadgeText: { color: COLORS.accentLight, fontSize: 12, fontWeight: "700" },
  searchContainer: { paddingHorizontal: 20, marginBottom: 8, zIndex: 10 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14 },
  inputWrapperFocused: { borderColor: COLORS.accent, backgroundColor: COLORS.card },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 15, padding: 0 },
  selectedPill: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8, alignSelf: "flex-start", backgroundColor: COLORS.accentGlow, borderWidth: 1, borderColor: COLORS.accent + "44", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  selectedPillText: { color: COLORS.accentLight, fontSize: 12, fontWeight: "600" },
  dropdown: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 16, marginTop: 8, overflow: "hidden" },
  dropdownItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  dropdownText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: "500" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: COLORS.textSecondary, fontSize: 14 },
  listContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  listHeader: { color: COLORS.textSecondary, fontSize: 13, fontWeight: "600", marginBottom: 14 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 20, padding: 16, marginBottom: 10, gap: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },
  cardInfo: { flex: 1, gap: 6 },
  cardName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: "700", letterSpacing: -0.2 },
  cardBadges: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardSkill: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "500" },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  levelBadgeText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  connectBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accentGlow, borderWidth: 1, borderColor: COLORS.accent + "44", justifyContent: "center", alignItems: "center" },
  emptyState: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 44, marginBottom: 14 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: "700", marginBottom: 8, letterSpacing: -0.3 },
  emptySubtitle: { color: COLORS.textSecondary, fontSize: 13, textAlign: "center", lineHeight: 20 },
});