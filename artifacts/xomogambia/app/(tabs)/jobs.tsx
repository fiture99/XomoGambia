import { router } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { JobCard } from "@/components/JobCard";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function JobsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { jobs, loadJobs, getJobsForProvider } = useApp();

  useEffect(() => {
    if (user?.id) loadJobs(user.id);
  }, [user?.id, loadJobs]);
  const visibleJobs = user?.role === "provider" ? getJobsForProvider(user.companyId) : jobs;

  const active = useMemo(
    () => visibleJobs.filter((j) => j.status === "upcoming" || j.status === "in_progress"),
    [visibleJobs]
  );
  const done = useMemo(
    () => visibleJobs.filter((j) => j.status === "completed" || j.status === "cancelled"),
    [visibleJobs]
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
        <Text style={[styles.title, { color: colors.foreground }]}>My Jobs</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {visibleJobs.length} job{visibleJobs.length !== 1 ? "s" : ""} total
        </Text>
      </View>

      {visibleJobs.length === 0 ? (
        <EmptyState
          icon="briefcase"
          title="No jobs yet"
          subtitle="When you accept a quote, your job will appear here for tracking."
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
              {active.map((j) => (
                <JobCard key={j.id} job={j} onPress={() => router.push(`/job/${j.id}`)} />
              ))}
            </>
          )}
          {done.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Completed</Text>
              {done.map((j) => (
                <JobCard key={j.id} job={j} onPress={() => router.push(`/job/${j.id}`)} />
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
