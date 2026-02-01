import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/src/context/auth_context";
import { router } from "expo-router";
import { useEffect } from "react";
export default function Home() {
    const {token, loading} = useAuth();

    useEffect(() => {
        if (!loading && !token) {
            router.replace({pathname: "/login"});
        }
    }, [loading, token]);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Welcome to SkillSwap 👋</Text>
            <Text style={styles.sub}>Find mentors. Share skills. Grow together.</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>🔍 Find Mentors</Text>
                <Text style={styles.cardText}>Discover people who can teach you new skills.</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>📅 My Sessions</Text>
                <Text style={styles.cardText}>Track your upcoming learning sessions.</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>⭐ My Reviews</Text>
                <Text style={styles.cardText}>See feedback from your learning partners.</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F6FA", padding: 20 },
    header: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
    sub: { color: "#555", marginBottom: 20 },

    card: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 12,
        marginBottom: 15,
        elevation: 3,
    },
    cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
    cardText: { color: "#666" },
})