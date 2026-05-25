import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { useApp } from "@/context/AppContext";
import { type UserRole, useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import {
  authenticateWithBiometrics,
  isBiometricAvailable,
  isBiometricEnabled,
} from "@/lib/biometrics";

type Step = "role" | "details";

export default function AuthScreen() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const isRegister = mode !== "login";
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, loginWithCredentials, getStoredUser, getLastUser, user } = useAuth();
  const { isCompanyEmailTaken } = useApp();

  const [step, setStep] = useState<Step>(isRegister ? "role" : "details");
  const [role, setRole] = useState<UserRole>("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);

  useEffect(() => {
    if (!isRegister) {
      Promise.all([isBiometricAvailable(), isBiometricEnabled()]).then(
        ([available, enabled]) => {
          setBiometricAvailable(available);
          setBiometricEnabledState(enabled);
        }
      );
    }
  }, [isRegister]);

  async function handleBiometricLogin() {
    const ok = await authenticateWithBiometrics();
    if (ok) {
      const stored = user ?? (await getLastUser());
      if (stored) {
        router.replace(stored.role === "provider" ? "/(tabs)" : "/(tabs)");
      } else {
        setError("No saved account was found. Please sign in with your password first.");
      }
    } else {
      setError("Biometric authentication failed. Please use your password.");
    }
  }

  async function handleSubmit() {
    setError("");
    if (isRegister) {
      if (!name.trim()) { setError("Please enter your full name."); return; }
      if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email address."); return; }
      if (isCompanyEmailTaken(email.trim())) { setError("This email is already registered."); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
      if (password !== confirmPassword) { setError("Passwords do not match."); return; }
      setLoading(true);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await login(name.trim(), email.trim(), role, password);
        if (role === "provider") {
          router.replace("/provider/register");
        } else {
          router.replace("/(tabs)");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email address."); return; }
      if (!password) { setError("Please enter your password."); return; }
      setLoading(true);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const stored = await getStoredUser(email.trim());
        const ok = await loginWithCredentials(email.trim(), password);
        if (ok && stored) {
          if (stored.role === "provider" && !stored.companyId) {
            router.replace("/provider/register");
          } else {
            router.replace("/(tabs)");
          }
        } else {
          setError("Incorrect email or password. Please try again.");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  }

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0) + 20;
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24;
  const accentColor = role === "provider" ? colors.accent : colors.primary;

  if (isRegister && step === "role") {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop, paddingBottom }]} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
              <Feather name="shield" size={28} color="#fff" />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Join XomoGambia</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>How will you be using the platform?</Text>
          </View>

          <View style={styles.roleCards}>
            {[
              {
                value: "customer" as UserRole,
                icon: "briefcase",
                title: "Client / Customer",
                desc: "Browse verified companies, request quotes, and book services for your business or property.",
                color: colors.primary,
              },
              {
                value: "provider" as UserRole,
                icon: "tool",
                title: "Service Provider",
                desc: "Register your company, get verified, and receive job requests from hotels, offices and NGOs.",
                color: colors.accent,
              },
            ].map((opt) => {
              const selected = role === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.roleCard, { backgroundColor: colors.card, borderColor: selected ? opt.color : colors.border, borderWidth: selected ? 2 : 1 }]}
                  onPress={() => { Haptics.selectionAsync(); setRole(opt.value); }}
                  activeOpacity={0.85}
                >
                  <View style={[styles.roleIconBox, { backgroundColor: selected ? opt.color : colors.secondary }]}>
                    <Feather name={opt.icon as any} size={26} color={selected ? "#fff" : colors.mutedForeground} />
                  </View>
                  <Text style={[styles.roleTitle, { color: colors.foreground }]}>{opt.title}</Text>
                  <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>{opt.desc}</Text>
                  {selected && (
                    <View style={[styles.roleCheck, { backgroundColor: opt.color }]}>
                      <Feather name="check" size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.continueBtn, { backgroundColor: accentColor }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep("details"); }}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>Continue as {role === "provider" ? "Service Provider" : "Client"}</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.toggleBtn} onPress={() => router.replace("/auth?mode=login")} activeOpacity={0.7}>
            <Text style={[styles.toggleText, { color: colors.mutedForeground }]}>
              Already have an account?{" "}
              <Text style={[styles.toggleLink, { color: colors.primary }]}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop, paddingBottom }]} keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (isRegister ? setStep("role") : router.back())}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.logoBox, { backgroundColor: isRegister && role === "provider" ? colors.accent : colors.primary }]}>
            <Feather name={isRegister && role === "provider" ? "tool" : "shield"} size={28} color="#fff" />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {isRegister ? (role === "provider" ? "Provider account" : "Create your account") : "Welcome back"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {isRegister
              ? role === "provider"
                ? "We'll set up your company profile next"
                : "Join thousands of businesses finding trusted services"
              : "Sign in to access your jobs and quotes"}
          </Text>
        </View>

        {isRegister && (
          <View style={[styles.rolePill, { backgroundColor: role === "provider" ? "#FEF3C7" : "#EDF3EF", borderColor: role === "provider" ? "#E8A020" : colors.primary }]}>
            <Feather name={role === "provider" ? "tool" : "briefcase"} size={13} color={role === "provider" ? "#E8A020" : colors.primary} />
            <Text style={[styles.rolePillText, { color: role === "provider" ? "#E8A020" : colors.primary }]}>
              {role === "provider" ? "Service Provider" : "Client / Customer"}
            </Text>
            <TouchableOpacity onPress={() => setStep("role")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.rolePillChange, { color: colors.mutedForeground }]}>Change</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.form}>
          {isRegister && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.foreground }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Fatou Jallow"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Email Address</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.passwordInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                value={password}
                onChangeText={setPassword}
                placeholder={isRegister ? "At least 6 characters" : "Your password"}
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType={isRegister ? "next" : "done"}
                onSubmitEditing={isRegister ? undefined : handleSubmit}
              />
              <TouchableOpacity style={[styles.eyeBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setShowPassword((v) => !v)}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            {isRegister && (
              <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>Minimum 6 characters</Text>
            )}
          </View>

          {isRegister && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.foreground }]}>Confirm Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.passwordInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repeat your password"
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
                <TouchableOpacity style={[styles.eyeBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setShowConfirm((v) => !v)}>
                  <Feather name={showConfirm ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!!error && (
            <View style={[styles.errorBox, { backgroundColor: "#FEE2E2" }]}>
              <Feather name="alert-circle" size={14} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: isRegister && role === "provider" ? colors.accent : colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? "Please wait..." : isRegister ? (role === "provider" ? "Continue to Company Setup" : "Create Account") : "Sign In"}
            </Text>
            {!loading && <Feather name="arrow-right" size={18} color="#fff" />}
          </TouchableOpacity>

          {!isRegister && biometricAvailable && biometricEnabled && (
            <TouchableOpacity
              style={[styles.biometricBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handleBiometricLogin}
              activeOpacity={0.85}
            >
              <Feather name="cpu" size={20} color={colors.primary} />
              <Text style={[styles.biometricBtnText, { color: colors.foreground }]}>Sign in with Biometrics</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => router.replace(`/auth?mode=${isRegister ? "login" : "register"}`)}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, { color: colors.mutedForeground }]}>
              {isRegister ? "Already have an account? " : "Don't have an account? "}
              <Text style={[styles.toggleLink, { color: colors.primary }]}>{isRegister ? "Sign In" : "Register"}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.trustRow, { borderTopColor: colors.border }]}>
          {[{ icon: "lock", label: "Secure" }, { icon: "check-circle", label: "No spam" }, { icon: "users", label: "500+ clients" }].map((t) => (
            <View key={t.label} style={styles.trustItem}>
              <Feather name={t.icon as any} size={14} color={colors.mutedForeground} />
              <Text style={[styles.trustLabel, { color: colors.mutedForeground }]}>{t.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24, flexGrow: 1 },
  backBtn: { marginBottom: 24, alignSelf: "flex-start" },
  header: { marginBottom: 24, alignItems: "flex-start" },
  logoBox: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 8 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 21 },
  roleCards: { gap: 12, marginBottom: 20 },
  roleCard: { borderRadius: 16, padding: 18, position: "relative" },
  roleIconBox: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  roleTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 6 },
  roleDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  roleCheck: { position: "absolute", top: 14, right: 14, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  continueBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 14, paddingVertical: 16, gap: 8, marginBottom: 16 },
  continueBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  rolePill: { flexDirection: "row", alignItems: "center", borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7, gap: 6, marginBottom: 16, alignSelf: "flex-start" },
  rolePillText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  rolePillChange: { fontSize: 12, fontFamily: "Inter_400Regular", marginLeft: 4 },
  form: { gap: 16 },
  field: { gap: 6 },
  fieldHint: { fontSize: 11, fontFamily: "Inter_400Regular" },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  passwordRow: { flexDirection: "row", gap: 8 },
  passwordInput: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  eyeBtn: { width: 52, borderWidth: 1, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  errorBox: { flexDirection: "row", alignItems: "center", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  errorText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#DC2626", flex: 1 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 14, paddingVertical: 16, gap: 8, marginTop: 4 },
  submitBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  biometricBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1.5, paddingVertical: 14, gap: 10 },
  biometricBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  toggleBtn: { alignItems: "center" },
  toggleText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  toggleLink: { fontFamily: "Inter_600SemiBold" },
  trustRow: { flexDirection: "row", justifyContent: "space-around", borderTopWidth: 1, marginTop: 32, paddingTop: 20 },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  trustLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
});
