import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
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

export default function ProviderRegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const { addCompany } = useApp();

  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("+220 ");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [servicesText, setServicesText] = useState("");
  const [yearsActive, setYearsActive] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function toggleCategory(id: string) {
    Haptics.selectionAsync();
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    setError("");
    if (!companyName.trim()) { setError("Company name is required."); return; }
    if (selectedCategories.length === 0) { setError("Please select at least one service category."); return; }
    if (!location.trim()) { setError("Please enter your operating location."); return; }
    if (!phone.trim() || phone.trim().length < 8) { setError("Please enter a valid phone number."); return; }
    if (!description.trim() || description.trim().length < 30) { setError("Please write a description of at least 30 characters."); return; }

    const services = servicesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (services.length === 0) { setError("Please list at least one service (comma-separated)."); return; }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newCompany = addCompany({
      name: companyName.trim(),
      categoryIds: selectedCategories,
      description: description.trim(),
      location: location.trim(),
      phone: phone.trim(),
      services,
      yearsActive: parseInt(yearsActive) || 1,
    });

    await updateUser({ companyId: newCompany.id });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <View style={[styles.successRoot, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.successTop,
            {
              paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 24,
              backgroundColor: colors.primary,
            },
          ]}
        />
        <View style={styles.successContent}>
          <View style={[styles.successIconWrap, { backgroundColor: "#DCFCE7" }]}>
            <Feather name="check-circle" size={40} color="#15803D" />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Application Submitted!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your company <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{companyName}</Text> has been submitted for review. Our admin team will verify your details within 1–3 business days.
          </Text>

          <View style={[styles.infoBox, { backgroundColor: "#FEF9C3", borderColor: "#FDE68A" }]}>
            <Feather name="clock" size={16} color="#92400E" />
            <Text style={[styles.infoText, { color: "#92400E" }]}>
              You'll receive confirmation once your company is approved. You can track your status in the Profile tab.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace("/(tabs)")}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Go to Home</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
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
        {/* Header */}
        <View style={styles.pageHeader}>
          <View style={[styles.headerIcon, { backgroundColor: colors.accent }]}>
            <Feather name="tool" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.pageTitle, { color: colors.foreground }]}>Register Your Company</Text>
            <Text style={[styles.pageSub, { color: colors.mutedForeground }]}>
              Hi {user?.name?.split(" ")[0]}! Fill in your company details to apply for verification.
            </Text>
          </View>
        </View>

        <View style={[styles.stepBadge, { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }]}>
          <Feather name="info" size={13} color="#92400E" />
          <Text style={[styles.stepBadgeText, { color: "#92400E" }]}>
            Your listing will be reviewed by our team before going live on the marketplace.
          </Text>
        </View>

        {/* Company Name */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Company Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="e.g. Gamtel Power Solutions"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="words"
          />
        </View>

        {/* Categories */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Service Categories *</Text>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>Select all that apply</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const selected = selectedCategories.includes(cat.id);
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selected ? cat.color + "20" : colors.card,
                      borderColor: selected ? cat.color : colors.border,
                      borderWidth: selected ? 2 : 1,
                    },
                  ]}
                  onPress={() => toggleCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <Feather name={cat.icon as any} size={14} color={selected ? cat.color : colors.mutedForeground} />
                  <Text style={[styles.categoryChipText, { color: selected ? cat.color : colors.foreground }]}>
                    {cat.name}
                  </Text>
                  {selected && <Feather name="check" size={12} color={cat.color} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Location */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Operating Location *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Banjul, Serekunda, Kololi"
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        {/* Phone */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Phone Number *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="+220 7001234"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
          />
        </View>

        {/* Years Active */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Years in Business</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            value={yearsActive}
            onChangeText={setYearsActive}
            placeholder="e.g. 5"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Company Description *</Text>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Describe your expertise, experience, and what makes your company stand out. Minimum 30 characters.
          </Text>
          <TextInput
            style={[
              styles.textarea,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Leading electrical contractors in Greater Banjul with over 10 years of experience..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Services */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Services Offered *</Text>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            List your specific services, separated by commas.
          </Text>
          <TextInput
            style={[
              styles.textarea,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
            ]}
            value={servicesText}
            onChangeText={setServicesText}
            placeholder="e.g. Wiring & Rewiring, Solar Installations, Emergency Repairs, Generator Connections"
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
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
          style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: 1 }]}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Feather name="send" size={18} color="#fff" />
          <Text style={styles.submitBtnText}>Submit for Review</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  successRoot: { flex: 1 },
  successTop: { height: 80 },
  successContent: { flex: 1, alignItems: "center", paddingHorizontal: 28, paddingTop: 32 },
  successIconWrap: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  successTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 12, textAlign: "center" },
  successSub: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 20 },
  infoBox: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 14, gap: 10, marginBottom: 28 },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  doneBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 14, paddingVertical: 16, gap: 8, width: "100%" },
  doneBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  scroll: { paddingHorizontal: 20, flexGrow: 1 },
  pageHeader: { flexDirection: "row", alignItems: "flex-start", gap: 14, marginBottom: 16 },
  headerIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 2 },
  pageTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 4 },
  pageSub: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  stepBadge: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 12, gap: 8, marginBottom: 20 },
  stepBadgeText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  field: { gap: 6, marginBottom: 16 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  textarea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 100, lineHeight: 20 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  categoryChip: { flexDirection: "row", alignItems: "center", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, gap: 5 },
  categoryChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  errorBox: { flexDirection: "row", alignItems: "center", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8, marginBottom: 12 },
  errorText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#DC2626", flex: 1 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 14, paddingVertical: 16, gap: 8 },
  submitBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});
