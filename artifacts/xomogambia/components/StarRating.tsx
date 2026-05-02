import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StarRatingProps {
  rating: number;
  size?: number;
  color?: string;
  showNumber?: boolean;
}

function getStarType(star: number, rating: number): "star" | "star-half" | "star-outline" {
  if (rating >= star) return "star";
  if (rating >= star - 0.5) return "star-half";
  return "star-outline";
}

export function StarRating({ rating, size = 14, color = "#E8A020", showNumber = false }: StarRatingProps) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={getStarType(star, rating)}
          size={size}
          color={getStarType(star, rating) === "star-outline" ? "#E5E7EB" : color}
          style={{ marginRight: 1 }}
        />
      ))}
      {showNumber && (
        <Text style={[styles.number, { fontSize: size, color }]}>{rating.toFixed(1)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  number: { marginLeft: 4, fontFamily: "Inter_600SemiBold" },
});
