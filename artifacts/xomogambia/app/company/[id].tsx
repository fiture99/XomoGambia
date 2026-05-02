import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StarRating } from "@/components/StarRating";
import { CATEGORIES, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function CompanyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getCompany, getReviews } = useApp();

  const company = useMemo(() => getCompany(id ?? ""), [id, getCompany]);
  const reviews = useMemo(() => getReviews(id ?? ""), [id, getReviews]);
  const primaryCategory = CATEGORIES.find((c) => c.id === company?.categoryIds[0]);

  if (!company) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>Company not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
        }}
      >
        {/* Hero */}
        <View
          style={[
            styles.hero,
            {
              backgroundColor: primaryCategory?.color ?? colors.primary,
              paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 8,
            },
          ]}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={[styles.heroAvatar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name={primaryCategory?.icon as any ?? "briefcase"} size={36} color="#fff" />
          </View>

          <View style={styles.heroNameRow}>
            <Text style={styles.heroName}>{company.name}</Text>
            {company.verified && (
              <View style={styles.verifiedBadge}>
                <Feather name="check-circle" size={14} color="#15803D" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          <View style={styles.heroMeta}>
            <Feather name="map-pin" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.heroMetaText}>{company.location}</Text>
            <View style={styles.heroDot} />
            <Feather name="clock" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.heroMetaText}>{company.yearsActive} years active</Text>
          </View>
        </View>

        {/* Stats strip */}
        <View style={[styles.statsStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.stripStat}>
            <Text style={[styles.stripValue, { color: colors.foreground }]}>
              {company.rating.toFixed(1)}
            </Text>
            <StarRating rating={company.rating} size={11} />
            <Text style={[styles.stripLabel, { color: colors.mutedForeground }]}>Rating</Text>
          </View>
          <View style={[styles.stripDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stripStat}>
            <Text style={[styles.stripValue, { color: colors.foreground }]}>
              {company.reviewCount}
            </Text>
            <Text style={[styles.stripLabel, { color: colors.mutedForeground }]}>Reviews</Text>
          </View>
          <View style={[styles.stripDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stripStat}>
            <Text style={[styles.stripValue, { color: colors.foreground }]}>
              {company.completedJobs}
            </Text>
            <Text style={[styles.stripLabel, { color: colors.mutedForeground }]}>Jobs Done</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* About */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {company.description}
          </Text>

          {/* Services */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Services Offered</Text>
          <View style={styles.servicesList}>
            {company.services.map((s) => (
              <View
                key={s}
                style={[styles.serviceChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              >
                <Feather name="check" size={13} color={colors.primary} />
                <Text style={[styles.serviceText, { color: colors.foreground }]}>{s}</Text>
              </View>
            ))}
          </View>

          {/* Contact */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Contact</Text>
          <TouchableOpacity
            style={[styles.contactRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Linking.openURL(`tel:${company.phone}`)}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIcon, { backgroundColor: "#EDF3EF" }]}>
              <Feather name="phone" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.contactText, { color: colors.foreground }]}>{company.phone}</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>

          {/* Reviews */}
          <View style={styles.reviewsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Reviews ({reviews.length})
            </Text>
          </View>
          {reviews.length === 0 ? (
            <Text style={[styles.noReviews, { color: colors.mutedForeground }]}>
              No reviews yet. Be the first!
            </Text>
          ) : (
            reviews.slice(0, 5).map((r) => (
              <View
                key={r.id}
                style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.reviewTop}>
                  <View style={[styles.reviewAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.reviewInitial}>{r.userName.charAt(0)}</Text>
                  </View>
                  <View style={styles.reviewMeta}>
                    <Text style={[styles.reviewName, { color: colors.foreground }]}>{r.userName}</Text>
                    <View style={styles.reviewRatingRow}>
                      <StarRating rating={r.rating} size={12} />
                      <Text style={[styles.reviewDate, { color: colors.mutedForeground }]}>{r.date}</Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.reviewComment, { color: colors.mutedForeground }]}>
                  {r.comment}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View
        style={[
          styles.ctaBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 8,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push(`/quote/new?companyId=${company.id}`);
          }}
          activeOpacity={0.85}
        >
          <Feather name="send" size={18} color="#fff" />
          <Text style={styles.ctaBtnText}>Request a Quote</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { textAlign: "center", marginTop: 40, fontSize: 15 },
  hero: { paddingHorizontal: 20, paddingBottom: 24 },
  backBtn: { marginBottom: 16 },
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroNameRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  heroName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", flex: 1 },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  verifiedText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#15803D" },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  heroMetaText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)" },
  heroDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.5)" },
  statsStrip: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 16,
  },
  stripStat: { flex: 1, alignItems: "center", gap: 3 },
  stripValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  stripLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  stripDivider: { width: 1, marginVertical: 4 },
  body: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 10, marginTop: 4 },
  description: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, marginBottom: 20 },
  servicesList: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  serviceChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  serviceText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  contactIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  contactText: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  reviewsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  noReviews: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 16 },
  reviewCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  reviewTop: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  reviewInitial: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  reviewMeta: { flex: 1 },
  reviewName: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  reviewRatingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  reviewDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  reviewComment: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  ctaBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  ctaBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});
