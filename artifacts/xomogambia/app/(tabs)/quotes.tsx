import { router } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { QuoteCard } from "@/components/QuoteCard";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function QuotesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { quotes, loadQuotes, getQuotesForProvider } = useApp();

  useEffect(() => {
    if (user?.id) loadQuotes(user.id, user.role === "provider" ? user.companyId : undefined);
  }, [user?.id, user?.companyId, user?.role, loadQuotes]);
  const visibleQuotes = user?.role === "provider" ? getQuotesForProvider(user.companyId) : quotes;

  const active = useMemo(
    () => visibleQuotes.filter((q) => q.status === "pending" || q.status === "received"),
    [visibleQuotes]
  );
  const archived = useMemo(
    () => visibleQuotes.filter((q) => q.status === "accepted" || q.status === "declined"),
    [visibleQuotes]
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>My Quotes</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {visibleQuotes.length} quote request{visibleQuotes.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {visibleQuotes.length === 0 ? (
        <EmptyState
          icon="file-text"
          title="No quote requests yet"
          subtitle="Browse companies and request quotes to compare pricing."
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 80 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {active.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Active</Text>
              {active.map((q) => (
                <QuoteCard key={q.id} quote={q} onPress={() => router.push(`/quote/${q.id}`)} />
              ))}
            </>
          )}
          {archived.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Archived</Text>
              {archived.map((q) => (
                <QuoteCard key={q.id} quote={q} onPress={() => router.push(`/quote/${q.id}`)} />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 2 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  sectionLabel: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 10, marginTop: 4 },
});
