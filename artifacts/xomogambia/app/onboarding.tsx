import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const FEATURES = [
  { icon: "check-circle", label: "Verified companies only" },
  { icon: "star", label: "Real reviews from real clients" },
  { icon: "shield", label: "Secure booking & tracking" },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  function handleGetStarted() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/auth?mode=register");
  }

  function handleSignIn() {
    router.push("/auth?mode=login");
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.primary }]}>
      <View style={[styles.top, { paddingTop: insets.top + (Platform.OS === "web" ? 30 : 0) + 24 }]}>
        <View style={styles.logoRow}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>XomoGambia</Text>
        </View>
        <Text style={styles.tagline}>
          Verified service companies,{"\n"}trusted by Gambian businesses.
        </Text>
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Feather name={f.icon as any} size={16} color={colors.primary} />
              </View>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View
        style={[
          styles.bottom,
          {
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
          },
        ]}
      >
        <Text style={[styles.bottomTitle, { color: colors.foreground }]}>
          Find the right team for the job
        </Text>
        <Text style={[styles.bottomSub, { color: colors.mutedForeground }]}>
          Browse pre-vetted service companies across Greater Banjul, request quotes, and book with confidence.
        </Text>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={handleGetStarted}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleSignIn} activeOpacity={0.7}>
          <Text style={[styles.secondaryBtnText, { color: colors.mutedForeground }]}>
            Already have an account?{" "}
            <Text style={[styles.signInLink, { color: colors.primary }]}>Sign In</Text>
          </Text>
        </TouchableOpacity>

        <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
          {[
            { value: "200+", label: "Verified Companies" },
            { value: "500+", label: "Corporate Clients" },
            { value: "4.8", label: "Average Rating" },
          ].map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: { flex: 1, paddingHorizontal: 28, justifyContent: "center" },
  logoRow: { flexDirection: "row", alignItems: "center", marginBottom: 28, gap: 12 },
  logo: { width: 48, height: 48, borderRadius: 12 },
  appName: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  tagline: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    lineHeight: 30,
    marginBottom: 28,
  },
  features: { gap: 12 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureLabel: { fontSize: 15, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.95)" },
  bottom: { paddingHorizontal: 24, paddingTop: 28 },
  bottomTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 10 },
  bottomSub: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 24 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    marginBottom: 14,
  },
  primaryBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  secondaryBtn: { alignItems: "center", marginBottom: 24 },
  secondaryBtnText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  signInLink: { fontFamily: "Inter_600SemiBold" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    paddingTop: 20,
  },
  stat: { alignItems: "center" },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
});
