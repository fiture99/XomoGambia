import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "gold";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = "default" }: BadgeProps) {
  const colors = useColors();

  const variantStyle = {
    default: { bg: colors.secondary, text: colors.mutedForeground },
    success: { bg: "#DCFCE7", text: "#15803D" },
    warning: { bg: "#FEF9C3", text: "#92400E" },
    error: { bg: "#FEE2E2", text: "#DC2626" },
    info: { bg: "#DBEAFE", text: "#1D4ED8" },
    gold: { bg: "#FEF3C7", text: "#B45309" },
  }[variant];

  return (
    <View style={[styles.badge, { backgroundColor: variantStyle.bg }]}>
      <Text style={[styles.label, { color: variantStyle.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});
