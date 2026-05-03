import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import {
  authenticateWithBiometrics,
  getBiometricType,
  isBiometricAvailable,
  isBiometricEnabled,
  setBiometricEnabled,
} from "@/lib/biometrics";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [biometricType, setBiometricType] = useState<"fingerprint" | "face" | "iris" | "none">("none");

  const [saving, setSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    Promise.all([
      isBiometricAvailable(),
      isBiometricEnabled(),
      getBiometricType(),
    ]).then(([available, enabled, type]) => {
      setBiometricAvailable(available);
      setBiometricEnabledState(enabled);
      setBiometricType(type);
    });
  }, []);

  async function handleSaveProfile() {
    setProfileError("");
    setProfileSaved(false);
    if (!name.trim()) { setProfileError("Name cannot be empty."); return; }
    setSaving(true);
    await updateUser({ name: name.trim() });
    setSaving(false);
    setProfileSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setProfileSaved(false), 2500);
  }

  async function handleChangePassword() {
    setPasswordError("");
    setPasswordSaved(false);
    if (!currentPassword) { setPasswordError("Please enter your current password."); return; }
    if (currentPassword !== user?.password) { setPasswordError("Current password is incorrect."); return; }
    if (newPassword.length < 6) { setPasswordError("New password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match."); return; }
    setSaving(true);
    await updateUser({ password: newPassword });
    setSaving(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setPasswordSaved(false), 2500);
  }

  async function handleToggleBiometric(value: boolean) {
    if (value) {
      const ok = await authenticateWithBiometrics();
      if (!ok) {
        Alert.alert(
          "Biometric Failed",
          "Could not verify your identity. Please try again.",
          [{ text: "OK" }]
        );
        return;
      }
    }
    Haptics.selectionAsync();
    await setBiometricEnabled(value);
    setBiometricEnabledState(value);
  }

  const biometricLabel =
    biometricType === "face"
      ? "Face ID"
      : biometricType === "fingerprint"
      ? "Fingerprint"
      : biometricType === "iris"
      ? "Iris Scan"
      : "Biometrics";

  const biometricIcon =
    biometricType === "face" ? "smile" : biometricType === "fingerprint" ? "cpu" : "shield";

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 8,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>Account Settings</Text>
        </View>

        {/* Profile section */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Profile</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
              value={name}
              onChangeText={(v) => { setName(v); setProfileSaved(false); }}
              placeholder="Your full name"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Email Address</Text>
            <View style={[styles.disabledInput, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Text style={[styles.disabledText, { color: colors.mutedForeground }]}>{user?.email}</Text>
              <Feather name="lock" size={14} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>Email cannot be changed</Text>
          </View>

          {!!profileError && (
            <View style={[styles.alertBox, { backgroundColor: "#FEE2E2" }]}>
              <Feather name="alert-circle" size={14} color="#DC2626" />
              <Text style={styles.alertError}>{profileError}</Text>
            </View>
          )}
          {profileSaved && (
            <View style={[styles.alertBox, { backgroundColor: "#DCFCE7" }]}>
              <Feather name="check-circle" size={14} color="#15803D" />
              <Text style={styles.alertSuccess}>Profile updated successfully.</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
            onPress={handleSaveProfile}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Feather name="save" size={16} color="#fff" />
            <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save Profile"}</Text>
          </TouchableOpacity>
        </View>

        {/* Password section */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Password</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Current Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.passwordInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showCurrent}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.eyeBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => setShowCurrent((v) => !v)}
              >
                <Feather name={showCurrent ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>New Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.passwordInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showNew}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.eyeBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => setShowNew((v) => !v)}
              >
                <Feather name={showNew ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Confirm New Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.passwordInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat new password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.eyeBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => setShowConfirm((v) => !v)}
              >
                <Feather name={showConfirm ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          {!!passwordError && (
            <View style={[styles.alertBox, { backgroundColor: "#FEE2E2" }]}>
              <Feather name="alert-circle" size={14} color="#DC2626" />
              <Text style={styles.alertError}>{passwordError}</Text>
            </View>
          )}
          {passwordSaved && (
            <View style={[styles.alertBox, { backgroundColor: "#DCFCE7" }]}>
              <Feather name="check-circle" size={14} color="#15803D" />
              <Text style={styles.alertSuccess}>Password changed successfully.</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
            onPress={handleChangePassword}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Feather name="key" size={16} color="#fff" />
            <Text style={styles.saveBtnText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        {/* Biometrics section */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Security</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {biometricAvailable ? (
            <View style={styles.biometricRow}>
              <View style={[styles.biometricIcon, { backgroundColor: biometricEnabled ? "#EDF3EF" : colors.secondary }]}>
                <Feather name={biometricIcon as any} size={22} color={biometricEnabled ? colors.primary : colors.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.biometricLabel, { color: colors.foreground }]}>{biometricLabel} Login</Text>
                <Text style={[styles.biometricSub, { color: colors.mutedForeground }]}>
                  {biometricEnabled
                    ? `Sign in using ${biometricLabel} instead of your password`
                    : `Enable ${biometricLabel} for faster sign-in`}
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleToggleBiometric}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
          ) : (
            <View style={styles.biometricUnavailableRow}>
              <View style={[styles.biometricIcon, { backgroundColor: colors.secondary }]}>
                <Feather name="shield-off" size={22} color={colors.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.biometricLabel, { color: colors.foreground }]}>Biometric Login</Text>
                <Text style={[styles.biometricSub, { color: colors.mutedForeground }]}>
                  {Platform.OS === "web"
                    ? "Biometric login is available on the native app only"
                    : "No biometric hardware found on this device"}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, flexGrow: 1 },
  pageHeader: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 24 },
  backBtn: { padding: 2 },
  pageTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  sectionTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 24, gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  hint: { fontSize: 11, fontFamily: "Inter_400Regular" },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, fontFamily: "Inter_400Regular" },
  disabledInput: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13 },
  disabledText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  passwordRow: { flexDirection: "row", gap: 8 },
  passwordInput: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, fontFamily: "Inter_400Regular" },
  eyeBtn: { width: 52, borderWidth: 1, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  alertBox: { flexDirection: "row", alignItems: "center", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  alertError: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#DC2626", flex: 1 },
  alertSuccess: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#15803D", flex: 1 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 12, paddingVertical: 13, gap: 8 },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  biometricRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  biometricUnavailableRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  biometricIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  biometricLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  biometricSub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
});
