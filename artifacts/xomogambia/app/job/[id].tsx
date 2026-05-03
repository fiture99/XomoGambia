import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
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
import { useColors } from "@/hooks/useColors";

const STEPS = [
  { key: "upcoming", label: "Booked", icon: "calendar" },
  { key: "in_progress", label: "In Progress", icon: "tool" },
  { key: "completed", label: "Completed", icon: "check-circle" },
];

const STATUS_VARIANT = {
  upcoming: "warning",
  in_progress: "info",
  completed: "success",
  cancelled: "error",
} as const;

const STATUS_LABEL = {
  upcoming: "Upcoming",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
} as const;

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { jobs, updateJobStatus, getCompany } = useApp();


  const job = useMemo(() => jobs.find((j) => j.id === id), [jobs, id]);
  const company = useMemo(() => getCompany(job?.companyId ?? ""), [job, getCompany]);
  const primaryCategory = CATEGORIES.find((c) => c.id === job?.categoryId);

  if (!job) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>Job not found.</Text>
      </View>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === job.status);
  const isComplete = job.status === "completed";
  const isCancelled = job.status === "cancelled";
  const isPaid = job.paymentStatus === "paid";

  function handleAdvanceStatus() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (job!.status === "upcoming") updateJobStatus(job!.id, "in_progress");
    else if (job!.status === "in_progress") updateJobStatus(job!.id, "completed");
  }

  const createdDate = new Date(job.createdAt).toLocaleDateString("en-GB", {
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
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + (!isComplete && !isCancelled ? 100 : 24),
          },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Job Details</Text>
          <Badge label={STATUS_LABEL[job.status]} variant={STATUS_VARIANT[job.status]} />
        </View>
        <Text style={[styles.dateText, { color: colors.mutedForeground }]}>Booked on {createdDate}</Text>

        {/* Progress tracker */}
        {!isCancelled && (
          <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Progress</Text>
            <View style={styles.stepRow}>
              {STEPS.map((step, i) => {
                const done = i <= currentStepIndex;
                const active = i === currentStepIndex;
                return (
                  <React.Fragment key={step.key}>
                    <View style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepCircle,
                          {
                            backgroundColor: done ? colors.primary : colors.secondary,
                            borderColor: done ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Feather
                          name={step.icon as any}
                          size={14}
                          color={done ? "#fff" : colors.mutedForeground}
                        />
                      </View>
                      <Text
                        style={[
                          styles.stepLabel,
                          { color: active ? colors.primary : done ? colors.foreground : colors.mutedForeground },
                        ]}
                      >
                        {step.label}
                      </Text>
                    </View>
                    {i < STEPS.length - 1 && (
                      <View
                        style={[
                          styles.stepLine,
                          { backgroundColor: i < currentStepIndex ? colors.primary : colors.border },
                        ]}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        )}

        {/* Company */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Company</Text>
          <View style={styles.companyRow}>
            <View
              style={[styles.companyAvatar, { backgroundColor: primaryCategory?.color ?? colors.primary }]}
            >
              <Feather name={primaryCategory?.icon as any ?? "briefcase"} size={20} color="#fff" />
            </View>
            <View style={styles.companyInfo}>
              <Text style={[styles.companyName, { color: colors.foreground }]}>{job.companyName}</Text>
              <Text style={[styles.companySub, { color: colors.mutedForeground }]}>
                {job.categoryName} · {company?.location}
              </Text>
            </View>
          </View>
        </View>

        {/* Job info */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Job Description</Text>
          <Text style={[styles.description, { color: colors.foreground }]}>{job.description}</Text>
          <View style={[styles.locationRow, { marginTop: 10 }]}>
            <Feather name="map-pin" size={13} color={colors.mutedForeground} />
            <Text style={[styles.locationText, { color: colors.mutedForeground }]}>{job.location}</Text>
          </View>
        </View>

        {/* Amount */}
        <View
          style={[styles.amountCard, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}
        >
          <View>
            <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>Contract Value</Text>
            <Text style={[styles.amountValue, { color: colors.primary }]}>
              D {job.amount.toLocaleString()}
            </Text>
          </View>
          {isPaid && (
            <View style={styles.paidBadge}>
              <Feather name="check-circle" size={13} color="#15803D" />
              <Text style={styles.paidBadgeText}>PAID</Text>
            </View>
          )}
        </View>

        {/* Payment info if paid */}
        {isPaid && job.paymentMethod && (
          <View style={[styles.paymentInfoCard, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}>
            <Feather name="credit-card" size={16} color="#15803D" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.paymentInfoText, { color: "#15803D" }]}>
                Paid via {job.paymentMethod}
              </Text>
              {job.transactionRef && (
                <Text style={[styles.paymentInfoRef, { color: "#166534" }]}>Ref: {job.transactionRef}</Text>
              )}
            </View>
          </View>
        )}

        {/* Pay Now button if completed and unpaid */}
        {isComplete && !isPaid && (
          <TouchableOpacity
            style={[styles.payBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/payment/${job.id}`);
            }}
            activeOpacity={0.85}
          >
            <Feather name="credit-card" size={18} color="#fff" />
            <Text style={styles.payBtnText}>Pay Now · D {job.amount.toLocaleString()}</Text>
          </TouchableOpacity>
        )}

        {/* Leave review if completed and paid */}
        {isComplete && isPaid && !job.reviewed && (
          <TouchableOpacity
            style={[styles.reviewBtn, { backgroundColor: colors.accent }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/review/new?jobId=${job.id}`);
            }}
            activeOpacity={0.85}
          >
            <Feather name="star" size={18} color="#fff" />
            <Text style={styles.reviewBtnText}>Leave a Review</Text>
          </TouchableOpacity>
        )}
        {isComplete && job.reviewed && (
          <View style={[styles.reviewedBadge, { backgroundColor: "#DCFCE7" }]}>
            <Feather name="check-circle" size={16} color="#15803D" />
            <Text style={[styles.reviewedText, { color: "#15803D" }]}>You've reviewed this job</Text>
          </View>
        )}

        {/* Demo buttons */}
        {!isComplete && !isCancelled && (
          <View style={[styles.demoBox, { backgroundColor: "#FEF9C3", borderColor: "#FDE68A" }]}>
            <Feather name="zap" size={14} color="#92400E" />
            <Text style={[styles.demoText, { color: "#92400E" }]}>
              Demo: Advance the job status below.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action bar */}
      {!isComplete && !isCancelled && (
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
            style={[styles.advanceBtn, { backgroundColor: colors.primary }]}
            onPress={handleAdvanceStatus}
            activeOpacity={0.85}
          >
            <Feather name="arrow-right" size={18} color="#fff" />
            <Text style={styles.advanceBtnText}>
              {job.status === "upcoming" ? "Mark as In Progress" : "Mark as Completed"}
            </Text>
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
  progressCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 },
  stepRow: { flexDirection: "row", alignItems: "center" },
  stepItem: { alignItems: "center", gap: 6 },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  stepLine: { flex: 1, height: 2, marginHorizontal: 4, marginBottom: 18 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  companyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  companyAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  companyInfo: { flex: 1 },
  companyName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  companySub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  description: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  locationText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  notFound: { textAlign: "center", marginTop: 40, fontSize: 15 },
  amountCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  amountValue: { fontSize: 24, fontFamily: "Inter_700Bold" },
  reviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    marginBottom: 12,
  },
  reviewBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  reviewedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 12,
  },
  reviewedText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  demoBox: { borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: "row", gap: 8, alignItems: "flex-start" },
  demoText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  paidBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#DCFCE7", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  paidBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#15803D" },
  paymentInfoCard: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 12 },
  paymentInfoText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  paymentInfoRef: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  payBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 14, paddingVertical: 16, gap: 8, marginBottom: 12 },
  payBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  advanceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  advanceBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});
