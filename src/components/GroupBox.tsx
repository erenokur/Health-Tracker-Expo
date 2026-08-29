import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * Always-visible bordered section with a title — used to visually separate
 * unrelated groups of settings (e.g. Language vs Cloud Sync) without the
 * collapse/expand behavior of CollapsibleSection.
 */
export function GroupBox({ title, children }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 14, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  body: { padding: 14 },
});
