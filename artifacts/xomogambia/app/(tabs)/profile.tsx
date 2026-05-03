import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
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
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const MENU_ITEMS = [
  { icon: "help-circle", label: "Help & Support", onPress: () => {} },
  { icon: "info", label: "About XomoGambia", onPress: () => {} },
  { icon: "file-text", label: "Terms & Privacy", onPress: () => {} },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { jobs, quotes, userReviews, getCompany } = useApp();

  const isProvider = user?.role === "provider";
  const myCompany = isProvider && user?.companyId ? getCompany(user.companyId) : null;

  const completedJobs = jobs.filter((j) => j.status === "completed").length;

  function handleLogout() {
    if (Platform.OS === "web") {
      logout().then(() => router.replace("/onboarding"));
      return;
    }
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
          router.replace("/onboarding");
        },
      },
    ]);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: isProvider ? colors.accent : colors.primary }]}>
            <Text style={styles.avatarInitial}>
              {user?.name.charAt(0).toUpperCase() ?? "U"}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.foreground }]}>{user?.name}</Text>
          <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{user?.email}</Text>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: isProvider ? "#FEF3C7" : colors.secondary,
                borderColor: isProvider ? "#FDE68A" : "transparent",
              },
            ]}
          >
            <Feather
              name={isProvider ? "tool" : "briefcase"}
              size={12}
              color={isProvider ? "#E8A020" : colors.primary}
            />
            <Text
              style={[
                styles.roleBadgeText,
                { color: isProvider ? "#E8A020" : colors.primary },
              ]}
            >
              {isProvider ? "Service Provider" : "Client / Customer"}
            </Text>
          </View>
        </View>

        {/* Provider Company Status Card */}
        {isProvider && (
          <View style={styles.companySection}>
            {myCompany ? (
              <TouchableOpacity
                style={[
                  styles.companyCard,
                  {
                    backgroundColor: myCompany.verified ? "#ECFDF5" : "#FFFBEB",
                    borderColor: myCompany.verified ? "#6EE7B7" : "#FDE68A",
                  },
                ]}
                onPress={() => router.push(`/company/${myCompany.id}`)}
                activeOpacity={0.85}
              >
                <View style={styles.companyCardTop}>
                  <View style={[styles.companyIconWrap, { backgroundColor: myCompany.verified ? "#D1FAE5" : "#FEF3C7" }]}>
                    <Feather
                      name={myCompany.verified ? "check-circle" : "clock"}
                      size={20}
                      color={myCompany.verified ? "#059669" : "#D97706"}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.companyName, { color: colors.foreground }]}>{myCompany.name}</Text>
                    <Text style={[styles.companyStatus, { color: myCompany.verified ? "#059669" : "#D97706" }]}>
                      {myCompany.verified ? "Approved & Live" : "Pending Admin Review"}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                </View>
                {!myCompany.verified && (
                  <Text style={[styles.pendingHint, { color: colors.mutedForeground }]}>
                    Our team will verify your company within 1–3 business days.
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.registerPrompt, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push("/provider/register")}
                activeOpacity={0.85}
              >
                <View style={[styles.companyIconWrap, { backgroundColor: "#EDF3EF" }]}>
                  <Feather name="plus-circle" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.companyName, { color: colors.foreground }]}>Register Your Company</Text>
                  <Text style={[styles.companyStatus, { color: colors.mutedForeground }]}>
                    Submit your company for verification
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Stats */}
        {!isProvider && (
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { value: completedJobs, label: "Completed Jobs", icon: "check-circle" },
              { value: quotes.length, label: "Quote Requests", icon: "file-text" },
              { value: userReviews.length, label: "Reviews Given", icon: "star" },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <View style={styles.stat}>
                  <Feather name={s.icon as any} size={18} color={colors.primary} style={styles.statIcon} />
                  <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Quick actions — Customer only */}
        {!isProvider && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Access</Text>
            <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push("/(tabs)/jobs")}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIcon, { backgroundColor: "#EDF3EF" }]}>
                  <Feather name="briefcase" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.foreground }]}>My Jobs</Text>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
              <View style={[styles.menuSep, { backgroundColor: colors.border }]} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push("/(tabs)/quotes")}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIcon, { backgroundColor: "#EDF3EF" }]}>
                  <Feather name="file-text" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.foreground }]}>My Quotes</Text>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Settings */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>General</Text>
        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {MENU_ITEMS.map((item, i) => (
            <React.Fragment key={item.label}>
              {i > 0 && <View style={[styles.menuSep, { backgroundColor: colors.border }]} />}
              <TouchableOpacity style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
                <View style={[styles.menuIcon, { backgroundColor: colors.secondary }]}>
                  <Feather name={item.icon as any} size={18} color={colors.mutedForeground} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: colors.destructive }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Feather name="log-out" size={18} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  avatarSection: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarInitial: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#fff" },
  userName: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 2 },
  userEmail: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 10 },
  roleBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, gap: 5 },
  roleBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  companySection: { marginBottom: 20 },
  companyCard: { borderRadius: 16, borderWidth: 1.5, padding: 16 },
  registerPrompt: { flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  companyCardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  companyIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  companyName: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  companyStatus: { fontSize: 13, fontFamily: "Inter_500Medium" },
  pendingHint: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 10, lineHeight: 17 },
  statsCard: { flexDirection: "row", borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 24 },
  stat: { flex: 1, alignItems: "center" },
  statIcon: { marginBottom: 4 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 2 },
  divider: { width: 1, marginVertical: 4 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  menuCard: { borderRadius: 16, borderWidth: 1, marginBottom: 20, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  menuSep: { height: 1, marginLeft: 62 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1.5, paddingVertical: 14, gap: 8 },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
