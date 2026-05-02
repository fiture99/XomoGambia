import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryCard } from "@/components/CategoryCard";
import { CompanyCard } from "@/components/CompanyCard";
import { SearchBar } from "@/components/SearchBar";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { categories, companies } = useApp();
  const [query, setQuery] = useState("");

  const topRated = useMemo(
    () => [...companies].sort((a, b) => b.rating - a.rating).slice(0, 6),
    [companies]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.services.some((s) => s.toLowerCase().includes(q))
    );
  }, [query, companies]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.primary,
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 12,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.name}>{firstName}</Text>
          </View>
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: "rgba(255,255,255,0.15)" }]}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Feather name="bell" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>Find verified service companies in The Gambia</Text>
        <View style={styles.searchWrap}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search services, companies..." />
        </View>
      </View>

      {/* Search results overlay */}
      {query.trim().length > 0 ? (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentPad}>
          {filtered.length === 0 ? (
            <Text style={[styles.noResults, { color: colors.mutedForeground }]}>
              No companies found for "{query}"
            </Text>
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
              </Text>
              {filtered.map((c) => (
                <CompanyCard
                  key={c.id}
                  company={c}
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.push(`/company/${c.id}`);
                  }}
                />
              ))}
            </>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.contentPad,
            { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 80 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              { value: "15+", label: "Categories" },
              { value: "50+", label: "Companies" },
              { value: "500+", label: "Clients" },
            ].map((s) => (
              <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Categories */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Browse by Category</Text>
            <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onPress={() => {
                  Haptics.selectionAsync();
                  router.push(`/category/${cat.slug}`);
                }}
              />
            ))}
          </ScrollView>

          {/* Top rated */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Top Rated</Text>
            <View style={styles.verifiedTag}>
              <Feather name="check-circle" size={11} color="#15803D" />
              <Text style={styles.verifiedTagText}>All verified</Text>
            </View>
          </View>
          {topRated.map((c) => (
            <CompanyCard
              key={c.id}
              company={c}
              onPress={() => {
                Haptics.selectionAsync();
                router.push(`/company/${c.id}`);
              }}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 0 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  name: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  notifBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    marginBottom: 16,
  },
  searchWrap: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: -1,
    marginHorizontal: -4,
    padding: 4,
  },
  content: { flex: 1 },
  contentPad: { paddingHorizontal: 16, paddingTop: 16 },
  noResults: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 24 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  hScroll: { marginBottom: 24, marginHorizontal: -16, paddingHorizontal: 16 },
  verifiedTag: { flexDirection: "row", alignItems: "center", gap: 4 },
  verifiedTagText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#15803D" },
});
