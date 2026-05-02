import { Feather } from "@expo/vector-icons";
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

export default function NewQuoteScreen() {
  const { companyId } = useLocalSearchParams<{ companyId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getCompany, addQuote } = useApp();
  const { user } = useAuth();

  const company = useMemo(() => getCompany(companyId ?? ""), [companyId, getCompany]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const primaryCategory = CATEGORIES.find((c) => c.id === company?.categoryIds[0]);

  function handleSubmit() {
    setError("");
    if (!description.trim()) {
      setError("Please describe the work you need done.");
      return;
    }
    if (!location.trim()) {
      setError("Please enter your location.");
      return;
    }
    if (!company) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addQuote({
      companyId: company.id,
      companyName: company.name,
      categoryId: company.categoryIds[0],
      categoryName: primaryCategory?.name ?? company.categoryIds[0],
      description: description.trim(),
      location: location.trim(),
      status: "pending",
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <View style={[styles.successRoot, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.successContent}>
          <View style={[styles.successIcon, { backgroundColor: "#DCFCE7" }]}>
            <Feather name="check-circle" size={40} color="#15803D" />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Quote Requested!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your request has been sent to {company?.name}. You'll receive their quote in the Quotes tab.
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace("/(tabs)/quotes")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>View My Quotes</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.mutedForeground }]}>Back to Company</Text>
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

        <Text style={[styles.title, { color: colors.foreground }]}>Request a Quote</Text>

        {company && (
          <View
            style={[styles.companyBox, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View
              style={[styles.companyAvatar, { backgroundColor: primaryCategory?.color ?? colors.primary }]}
            >
              <Feather name={primaryCategory?.icon as any ?? "briefcase"} size={20} color="#fff" />
            </View>
            <View style={styles.companyInfo}>
              <Text style={[styles.companyName, { color: colors.foreground }]}>{company.name}</Text>
              <Text style={[styles.companySub, { color: colors.mutedForeground }]}>
                {primaryCategory?.name} · {company.location}
              </Text>
            </View>
            {company.verified && (
              <View style={[styles.verifiedBadge, { backgroundColor: "#DCFCE7" }]}>
                <Feather name="check-circle" size={12} color="#15803D" />
              </View>
            )}
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Describe the Work</Text>
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              Be specific — mention scope, urgency, and any relevant details.
            </Text>
            <TextInput
              style={[
                styles.textarea,
                { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. We need to install 6 CCTV cameras across our hotel lobby, reception, and parking area..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Your Location</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
              ]}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Kairaba Avenue, Serекunda"
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="done"
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
            <Feather name="send" size={18} color="#fff" />
            <Text style={styles.submitBtnText}>Send Quote Request</Text>
          </TouchableOpacity>

          <View style={[styles.infoBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="info" size={14} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              Your request is free. The company will review it and send you a quote. You are not committed until you accept.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  successRoot: { flex: 1, paddingHorizontal: 24 },
  scroll: { paddingHorizontal: 20, flexGrow: 1 },
  backBtn: { marginBottom: 20, alignSelf: "flex-start" },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 16 },
  companyBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 24,
    gap: 12,
  },
  companyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  companyInfo: { flex: 1 },
  companyName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  companySub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  verifiedBadge: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  form: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular" },
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
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
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
  infoBox: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  infoText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  successContent: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  successTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 10, textAlign: "center" },
  successSub: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 32 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
    width: "100%",
    marginBottom: 12,
  },
  primaryBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  secondaryBtn: { alignItems: "center" },
  secondaryBtnText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
