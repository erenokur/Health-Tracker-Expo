import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "default" | "primary" | "muted";
}

export function MenuButton({ label, onPress, variant = "default" }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "muted" && styles.muted,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#334155",
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  primary: { backgroundColor: "#16A34A" },
  muted: { backgroundColor: "#475569" },
  pressed: { opacity: 0.75 },
  text: { color: "#fff", fontSize: 18, fontWeight: "600", textAlign: "center" },
});
