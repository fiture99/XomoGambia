import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CATEGORIES, useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function NewReviewScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { jobs, addReview, markJobReviewed, getCompany } = useApp();
  const { user } = useAuth();

  const job = useMemo(() => jobs.find((j) => j.id === jobId), [jobs, jobId]);
  const company = useMemo(() => getCompany(job?.companyId ?? ""), [job, getCompany]);
  const primaryCategory = CATEGORIES.find((c) => c.id === job?.categoryId);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit() {
    setError("");
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a short comment about your experience.");
      return;
    }
    if (!job || !user) return;

    addReview({
      companyId: job.companyId,
      userId: user.id,
      userName: user.name,
      rating,
      comment: comment.trim(),
    });
    markJobReviewed(job.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <View style={[styles.successRoot, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.successTop,
            { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16 },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Feather name="x" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <View style={styles.successContent}>
          <View style={[styles.successIcon, { backgroundColor: "#FEF3C7" }]}>
            <Feather name="star" size={36} color="#E8A020" />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Thank You!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your review has been posted for {company?.name}. Reviews help other clients find trusted services.
          </Text>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace("/(tabs)/jobs")}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Back to Jobs</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.foreground }]}>Leave a Review</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Share your experience to help other clients.
        </Text>

        {company && (
          <View style={[styles.companyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.companyAvatar, { backgroundColor: primaryCategory?.color ?? colors.primary }]}>
              <Feather name={primaryCategory?.icon as any ?? "briefcase"} size={20} color="#fff" />
            </View>
            <View style={styles.companyInfo}>
              <Text style={[styles.companyName, { color: colors.foreground }]}>{company.name}</Text>
              <Text style={[styles.categorySub, { color: colors.mutedForeground }]}>
                {job?.categoryName}
              </Text>
            </View>
          </View>
        )}

        {/* Star selector */}
        <View style={styles.starsSection}>
          <Text style={[styles.starsLabel, { color: colors.foreground }]}>Your Rating</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => {
                  Haptics.selectionAsync();
                  setRating(star);
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={40}
                  color={star <= rating ? "#E8A020" : colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={[styles.ratingLabel, { color: colors.mutedForeground }]}>
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </Text>
          )}
        </View>

        {/* Comment */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Your Review</Text>
          <TextInput
            style={[
              styles.textarea,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
            ]}
            value={comment}
            onChangeText={setComment}
            placeholder="Describe the quality of work, professionalism, and overall experience..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {!!error && (
          <View style={[styles.errorBox, { backgroundColor: "#FEE2E2" }]}>
            <Feather name="alert-circle" size={14} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Feather name="star" size={18} color="#fff" />
          <Text style={styles.submitBtnText}>Submit Review</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  successRoot: { flex: 1 },
  successTop: { paddingHorizontal: 20 },
  successContent: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  successIcon: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  successTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 10 },
  successSub: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 32 },
  doneBtn: { borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40, width: "100%", alignItems: "center" },
  doneBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  scroll: { paddingHorizontal: 20, flexGrow: 1 },
  backBtn: { marginBottom: 20, alignSelf: "flex-start" },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 20 },
  companyBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 24,
    gap: 12,
  },
  companyAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  companyInfo: { flex: 1 },
  companyName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  categorySub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  starsSection: { alignItems: "center", marginBottom: 24 },
  starsLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  starsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  ratingLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  field: { gap: 8, marginBottom: 16 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  textarea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 120,
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#DC2626", flex: 1 },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  submitBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});
