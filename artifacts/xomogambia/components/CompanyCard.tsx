import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Company } from "@/context/AppContext";
import { CATEGORIES } from "@/context/AppContext";
import { StarRating } from "./StarRating";

interface CompanyCardProps {
  company: Company;
  onPress: () => void;
}

export function CompanyCard({ company, onPress }: CompanyCardProps) {
  const colors = useColors();
  const primaryCategory = CATEGORIES.find((c) => c.id === company.categoryIds[0]);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: primaryCategory?.color ?? colors.primary }]}>
        <Feather name={primaryCategory?.icon as any ?? "briefcase"} size={22} color="#fff" />
      </View>
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {company.name}
          </Text>
          {company.verified && (
            <View style={[styles.verifiedBadge, { backgroundColor: "#DCFCE7" }]}>
              <Feather name="check-circle" size={11} color="#15803D" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={12} color={colors.mutedForeground} />
          <Text style={[styles.location, { color: colors.mutedForeground }]}>
            {company.location}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <StarRating rating={company.rating} size={13} />
          <Text style={[styles.rating, { color: colors.foreground }]}>
            {company.rating.toFixed(1)}
          </Text>
          <Text style={[styles.reviews, { color: colors.mutedForeground }]}>
            ({company.reviewCount})
          </Text>
          <View style={styles.dot} />
          <Text style={[styles.jobs, { color: colors.mutedForeground }]}>
            {company.completedJobs} jobs
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  content: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: 3, gap: 6 },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1 },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  verifiedText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#15803D" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 6 },
  location: { fontSize: 12, fontFamily: "Inter_400Regular" },
  bottomRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  rating: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginLeft: 3 },
  reviews: { fontSize: 12, fontFamily: "Inter_400Regular" },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#D1D5DB" },
  jobs: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
