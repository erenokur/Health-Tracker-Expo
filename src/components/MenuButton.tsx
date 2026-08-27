import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "default" | "primary" | "muted";
}

export function MenuButton({ label, onPress, variant = "default" }: Props) {
  const { colors } = useTheme();
  const bg =
    variant === "primary"
      ? colors.primary
      : variant === "muted"
      ? colors.buttonMuted
      : colors.buttonDefault;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg },
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 10, paddingVertical: 18, paddingHorizontal: 16, marginBottom: 14 },
  pressed: { opacity: 0.75 },
  text: { color: "#fff", fontSize: 18, fontWeight: "600", textAlign: "center" },
});
