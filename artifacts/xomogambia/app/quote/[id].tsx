import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "@/components/Badge";
import { CATEGORIES, useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const STATUS_VARIANT = {
  pending: "warning",
  received: "info",
  accepted: "success",
  declined: "error",
} as const;

const STATUS_LABEL = {
  pending: "Pending",
  received: "Quote Received",
  accepted: "Accepted",
  declined: "Declined",
} as const;

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { quotes, updateQuoteStatus, addJob, getCompany, getQuotesForProvider } = useApp();
  const visibleQuotes = user?.role === "provider" ? getQuotesForProvider(user.companyId) : quotes;

  const quote = useMemo(() => visibleQuotes.find((q) => q.id === id), [visibleQuotes, id]);
  const company = useMemo(() => getCompany(quote?.companyId ?? ""), [quote, getCompany]);
  const primaryCategory = CATEGORIES.find((c) => c.id === quote?.categoryId);

  if (!quote) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>Quote not found.</Text>
      </View>
    );
  }

  function handleSimulateReceive() {
    const amount = Math.floor(Math.random() * 15000) + 2000;
    updateQuoteStatus(quote!.id, "received", amount);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleAccept() {
    if (!quote) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateQuoteStatus(quote.id, "accepted");
    addJob(user?.id ?? "guest", {
      companyId: quote.companyId,
      companyName: quote.companyName,
      categoryId: quote.categoryId,
      categoryName: quote.categoryName,
      description: quote.description,
      location: quote.location,
      status: "upcoming",
      amount: quote.amount ?? 0,
    });
    Alert.alert(
      "Job Created!",
      "The job has been booked. Track it in the Jobs tab.",
      [{ text: "View Jobs", onPress: () => router.replace("/(tabs)/jobs") }, { text: "OK" }]
    );
  }

  function handleDecline() {
    if (!quote) return;
    Alert.alert("Decline Quote", "Are you sure you want to decline this quote?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Decline",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          updateQuoteStatus(quote.id, "declined");
        },
      },
    ]);
  }

  const isLocked = quote.status === "accepted" || quote.status === "declined";
  const createdDate = new Date(quote.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + (isLocked ? 24 : 100),
          },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Quote Request</Text>
          <Badge
            label={STATUS_LABEL[quote.status]}
            variant={STATUS_VARIANT[quote.status]}
          />
        </View>
        <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
          Sent on {createdDate}
        </Text>

        {/* Company card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Company</Text>
          <View style={styles.companyRow}>
            <View
              style={[styles.companyAvatar, { backgroundColor: primaryCategory?.color ?? colors.primary }]}
            >
              <Feather name={primaryCategory?.icon as any ?? "briefcase"} size={20} color="#fff" />
            </View>
            <View style={styles.companyInfo}>
              <Text style={[styles.companyName, { color: colors.foreground }]}>{quote.companyName}</Text>
              <Text style={[styles.categoryText, { color: colors.mutedForeground }]}>
                {quote.categoryName} · {company?.location}
              </Text>
            </View>
            {company?.verified && (
              <View style={[styles.verifiedBadge, { backgroundColor: "#DCFCE7" }]}>
                <Feather name="check-circle" size={13} color="#15803D" />
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Work Description</Text>
          <Text style={[styles.description, { color: colors.foreground }]}>{quote.description}</Text>
          <View style={[styles.locationRow, { marginTop: 10 }]}>
            <Feather name="map-pin" size={13} color={colors.mutedForeground} />
            <Text style={[styles.locationText, { color: colors.mutedForeground }]}>{quote.location}</Text>
          </View>
        </View>

        {/* Amount if received */}
        {quote.amount !== undefined && (
          <View
            style={[styles.amountCard, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}
          >
            <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>Quoted Amount</Text>
            <Text style={[styles.amountValue, { color: colors.primary }]}>
              D {quote.amount.toLocaleString()}
            </Text>
            <Text style={[styles.amountSub, { color: colors.mutedForeground }]}>
              Inclusive of labour and materials
            </Text>
          </View>
        )}

        {/* Simulate receive for demo */}
        {quote.status === "pending" && (
          <View style={[styles.demoBox, { backgroundColor: "#FEF9C3", borderColor: "#FDE68A" }]}>
            <Feather name="zap" size={14} color="#92400E" />
            <Text style={[styles.demoText, { color: "#92400E" }]}>
              Demo: Tap below to simulate the company sending you a quote.
            </Text>
            <TouchableOpacity
              style={[styles.demoBtn, { backgroundColor: "#92400E" }]}
              onPress={handleSimulateReceive}
              activeOpacity={0.8}
            >
              <Text style={styles.demoBtnText}>Simulate Receiving Quote</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Actions */}
      {quote.status === "received" && (
        <View
          style={[
            styles.actionBar,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 8,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.declineBtn, { borderColor: colors.destructive }]}
            onPress={handleDecline}
            activeOpacity={0.7}
          >
            <Text style={[styles.declineBtnText, { color: colors.destructive }]}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
            onPress={handleAccept}
            activeOpacity={0.85}
          >
            <Feather name="check" size={18} color="#fff" />
            <Text style={styles.acceptBtnText}>Accept & Book</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, flexGrow: 1 },
  backBtn: { marginBottom: 20 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  dateText: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 20 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  companyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  companyAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  companyInfo: { flex: 1 },
  companyName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  categoryText: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  verifiedBadge: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  description: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  locationText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  notFound: { textAlign: "center", marginTop: 40, fontSize: 15 },
  amountCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    marginBottom: 12,
    alignItems: "center",
  },
  amountLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6 },
  amountValue: { fontSize: 36, fontFamily: "Inter_700Bold", marginBottom: 4 },
  amountSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  demoBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  demoText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  demoBtn: { borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  demoBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  declineBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 14,
    alignItems: "center",
  },
  declineBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  acceptBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 14,
    gap: 6,
  },
  acceptBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
