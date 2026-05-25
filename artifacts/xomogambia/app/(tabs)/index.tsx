import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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
import { JobCard } from "@/components/JobCard";
import { QuoteCard } from "@/components/QuoteCard";
import { SearchBar } from "@/components/SearchBar";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { categories, companies, getCompaniesForProvider, jobs, loadJobs, quotes, loadQuotes, getJobsForProvider, getQuotesForProvider } = useApp();
  const [query, setQuery] = useState("");

  const isProvider = user?.role === "provider";

  useEffect(() => {
    if (isProvider && user?.id) {
      loadJobs(user.id, user.companyId);
      loadQuotes(user.id, user.companyId);
    }
  }, [isProvider, user?.id, user?.companyId, loadJobs, loadQuotes]);

  const providerCompany = useMemo(
    () => getCompaniesForProvider(user?.companyId)[0] ?? null,
    [getCompaniesForProvider, user?.companyId]
  );

  const providerJobs = useMemo(
    () => getJobsForProvider(user?.companyId),
    [getJobsForProvider, user?.companyId]
  );

  const providerQuotes = useMemo(
    () => getQuotesForProvider(user?.companyId),
    [getQuotesForProvider, user?.companyId]
  );

  const visibleCompanies = companies;

  const topRated = useMemo(
    () => [...visibleCompanies].sort((a, b) => b.rating - a.rating).slice(0, 6),
    [visibleCompanies]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return visibleCompanies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.services.some((s) => s.toLowerCase().includes(q))
    );
  }, [query, visibleCompanies]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const firstName = user?.name.split(" ")[0] ?? "there";

  if (isProvider) {
    const activeJobs = providerJobs.filter((j) => j.status === "upcoming" || j.status === "in_progress");
    const completedJobs = providerJobs.filter((j) => j.status === "completed");
    const pendingQuotes = providerQuotes.filter((q) => q.status === "pending");
    const recentJobs = providerJobs.slice(0, 3);
    const recentQuotes = providerQuotes.slice(0, 3);

    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.accent,
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
          <Text style={styles.headerSub}>Your service business at a glance</Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.contentPad,
            { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 80 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {providerCompany && (
            <TouchableOpacity
              style={[styles.companyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/company/${providerCompany.id}`)}
              activeOpacity={0.85}
            >
              <View style={styles.companyCardTop}>
                <View style={[styles.companyIcon, { backgroundColor: colors.accent + "20" }]}>
                  <Feather name="tool" size={22} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.companyName, { color: colors.foreground }]}>{providerCompany.name}</Text>
                  <Text style={[styles.companyLocation, { color: colors.mutedForeground }]}>
                    <Feather name="map-pin" size={12} /> {providerCompany.location}
                  </Text>
                </View>
                <View style={[styles.verifiedBadge, { backgroundColor: providerCompany.verified ? "#DCFCE7" : "#FEF9C3", borderColor: providerCompany.verified ? "#86EFAC" : "#FDE68A" }]}>
                  <Feather name={providerCompany.verified ? "check-circle" : "clock"} size={12} color={providerCompany.verified ? "#15803D" : "#92400E"} />
                  <Text style={[styles.verifiedText, { color: providerCompany.verified ? "#15803D" : "#92400E" }]}>
                    {providerCompany.verified ? "Verified" : "Pending"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.statsRow}>
            {[
              { value: activeJobs.length, label: "Active Jobs", icon: "briefcase", color: colors.primary },
              { value: pendingQuotes.length, label: "Pending Quotes", icon: "file-text", color: "#F59E0B" },
              { value: completedJobs.length, label: "Completed", icon: "check-circle", color: "#10B981" },
            ].map((s) => (
              <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name={s.icon as any} size={18} color={s.color} />
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          {recentJobs.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Jobs</Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/jobs")} activeOpacity={0.7}>
                  <Text style={[styles.seeAll, { color: colors.accent }]}>See all</Text>
                </TouchableOpacity>
              </View>
              {recentJobs.map((j) => (
                <JobCard key={j.id} job={j} onPress={() => router.push(`/job/${j.id}`)} />
              ))}
            </>
          )}

          {recentQuotes.length > 0 && (
            <>
              <View style={[styles.sectionHeader, { marginTop: recentJobs.length > 0 ? 8 : 0 }]}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Quotes</Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/quotes")} activeOpacity={0.7}>
                  <Text style={[styles.seeAll, { color: colors.accent }]}>See all</Text>
                </TouchableOpacity>
              </View>
              {recentQuotes.map((q) => (
                <QuoteCard key={q.id} quote={q} onPress={() => router.push(`/quote/${q.id}`)} />
              ))}
            </>
          )}

          {recentJobs.length === 0 && recentQuotes.length === 0 && (
            <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="inbox" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No activity yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                Once customers send you quote requests, they'll appear here.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
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
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    paddingVertical: 12,
    gap: 4,
  },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2, textAlign: "center" },
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
  companyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  companyCardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  companyIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  companyName: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 2 },
  companyLocation: { fontSize: 13, fontFamily: "Inter_400Regular" },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifiedText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  emptyBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});
