import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CompanyCard } from "@/components/CompanyCard";
import { EmptyState } from "@/components/EmptyState";
import { SearchBar } from "@/components/SearchBar";
import { CATEGORIES, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getCompaniesByCategory } = useApp();
  const [query, setQuery] = useState("");

  const category = CATEGORIES.find((c) => c.slug === slug);
  const allCompanies = useMemo(
    () => getCompaniesByCategory(slug ?? ""),
    [slug, getCompaniesByCategory]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return allCompanies;
    const q = query.toLowerCase();
    return allCompanies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
    );
  }, [query, allCompanies]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Custom header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: category?.color ?? colors.primary,
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 8,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{category?.name ?? slug}</Text>
          <Text style={styles.headerSub}>
            {allCompanies.length} verified compan{allCompanies.length !== 1 ? "ies" : "y"}
          </Text>
        </View>
      </View>

      <View style={[styles.searchRow, { backgroundColor: colors.background }]}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search companies..." />
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="No companies found"
          subtitle="Try adjusting your search."
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
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
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { marginBottom: 12 },
  headerContent: {},
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 2 },
  searchRow: { paddingHorizontal: 16, paddingVertical: 12 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16 },
});
