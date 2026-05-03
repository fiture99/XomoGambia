import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function PendingApprovalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 24 }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.iconWrap, { backgroundColor: "#FEF3C7" }]}>
          <Feather name="clock" size={28} color="#D97706" />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Approval Pending</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Thanks {user?.name ?? ""}. Your provider account is waiting for admin approval before you can access the marketplace.
        </Text>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          We’ll review your company details and let you know once it’s approved.
        </Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => router.replace("/settings")} activeOpacity={0.85}>
          <Text style={styles.btnText}>Go to Account Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },
  card: { borderWidth: 1, borderRadius: 20, padding: 24, alignItems: "center" },
  iconWrap: { width: 64, height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 8 },
  hint: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, marginBottom: 20 },
  btn: { borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14 },
  btnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 15 },
});