import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Job } from "@/context/AppContext";
import { Badge } from "./Badge";

interface JobCardProps {
  job: Job;
  onPress: () => void;
}

const STATUS_VARIANT: Record<Job["status"], "warning" | "info" | "success" | "error"> = {
  upcoming: "warning",
  in_progress: "info",
  completed: "success",
  cancelled: "error",
};

const STATUS_LABEL: Record<Job["status"], string> = {
  upcoming: "Upcoming",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function JobCard({ job, onPress }: JobCardProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={[styles.company, { color: colors.foreground }]} numberOfLines={1}>
            {job.companyName}
          </Text>
          <Text style={[styles.category, { color: colors.mutedForeground }]}>
            {job.categoryName}
          </Text>
          <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
            {job.description}
          </Text>
        </View>
        <View style={styles.right}>
          <Badge label={STATUS_LABEL[job.status]} variant={STATUS_VARIANT[job.status]} />
          <Text style={[styles.amount, { color: colors.primary }]}>
            D {job.amount.toLocaleString()}
          </Text>
          {!job.reviewed && job.status === "completed" && (
            <View style={[styles.reviewDot, { backgroundColor: colors.accent }]} />
          )}
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 12 },
  info: { flex: 1 },
  company: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  category: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6 },
  desc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  right: { alignItems: "flex-end", gap: 6 },
  amount: { fontSize: 15, fontFamily: "Inter_700Bold" },
  reviewDot: { width: 8, height: 8, borderRadius: 4 },
});
