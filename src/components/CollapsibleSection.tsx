import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({ title, defaultOpen = false, children }: Props) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <Pressable
        style={[styles.header, { backgroundColor: colors.surface }]}
        onPress={() => setOpen((v) => !v)}
      >
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.chevron, { color: colors.textMuted }]}>
          {open ? "▲" : "▼"}
        </Text>
      </Pressable>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  title: { fontSize: 15, fontWeight: "600" },
  chevron: { fontSize: 12 },
  body: { padding: 12, paddingTop: 4 },
});
