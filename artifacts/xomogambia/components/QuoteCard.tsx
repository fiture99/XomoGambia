import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { QuoteRequest } from "@/context/AppContext";
import { Badge } from "./Badge";

interface QuoteCardProps {
  quote: QuoteRequest;
  onPress: () => void;
}

const STATUS_VARIANT: Record<QuoteRequest["status"], "warning" | "info" | "success" | "error"> = {
  pending: "warning",
  received: "info",
  accepted: "success",
  declined: "error",
};

const STATUS_LABEL: Record<QuoteRequest["status"], string> = {
  pending: "Pending",
  received: "Quote Received",
  accepted: "Accepted",
  declined: "Declined",
};

export function QuoteCard({ quote, onPress }: QuoteCardProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={[styles.company, { color: colors.foreground }]} numberOfLines={1}>
            {quote.companyName}
          </Text>
          <Text style={[styles.category, { color: colors.mutedForeground }]}>
            {quote.categoryName}
          </Text>
          <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
            {quote.description}
          </Text>
        </View>
        <View style={styles.right}>
          <Badge label={STATUS_LABEL[quote.status]} variant={STATUS_VARIANT[quote.status]} />
          {quote.amount && (
            <Text style={[styles.amount, { color: colors.primary }]}>
              D {quote.amount.toLocaleString()}
            </Text>
          )}
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={styles.chevron} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 12 },
  info: { flex: 1 },
  company: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  category: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6 },
  desc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  right: { alignItems: "flex-end", gap: 6 },
  amount: { fontSize: 15, fontFamily: "Inter_700Bold" },
  chevron: { marginTop: 4 },
});
