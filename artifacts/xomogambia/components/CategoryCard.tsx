import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { ServiceCategory } from "@/context/AppContext";

interface CategoryCardProps {
  category: ServiceCategory;
  onPress: () => void;
  compact?: boolean;
}

export function CategoryCard({ category, onPress, compact = false }: CategoryCardProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[
        styles.card,
        compact ? styles.compact : styles.full,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: category.color + "20" }]}>
        <Feather name={category.icon as any} size={compact ? 20 : 24} color={category.color} />
      </View>
      <Text style={[styles.name, { color: colors.foreground, fontSize: compact ? 12 : 13 }]} numberOfLines={1}>
        {category.name}
      </Text>
      {!compact && (
        <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={1}>
          {category.description}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    padding: 12,
  },
  full: { width: 100, marginRight: 10 },
  compact: { width: 80, marginRight: 8 },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  name: { fontFamily: "Inter_600SemiBold", textAlign: "center", marginBottom: 2 },
  desc: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
});
