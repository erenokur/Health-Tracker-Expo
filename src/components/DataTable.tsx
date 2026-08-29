import React from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { useLanguage } from "../i18n/LanguageContext";

export interface Column<T> {
  header: string;
  flex?: number;
  render: (row: T) => React.ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyLabel?: string;
  onRowPress?: (row: T) => void;
  contentContainerStyle?: any;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyLabel,
  onRowPress,
  contentContainerStyle,
}: Props<T>) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const empty = emptyLabel ?? t("common.noRecords");
  return (
    <View style={styles.container}>
      <View
        style={[styles.headerRow, { backgroundColor: colors.tableHeaderBg }]}
      >
        {columns.map((col, i) => (
          <Text
            key={col.header}
            style={[
              styles.headerCell,
              i > 0 && styles.cellDivider,
              i > 0 && { borderLeftColor: "rgba(255,255,255,0.25)" },
              { color: colors.tableHeaderText, flex: col.flex ?? 1 },
            ]}
          >
            {col.header}
          </Text>
        ))}
      </View>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        contentContainerStyle={contentContainerStyle}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.tableEmptyText }]}>
            {empty}
          </Text>
        }
        renderItem={({ item }) => {
          const rowContent = (
            <View
              style={[styles.row, { borderBottomColor: colors.tableRowBorder }]}
            >
              {columns.map((col, i) => {
                const content = col.render(item);
                return (
                  <View
                    key={col.header}
                    style={[
                      { flex: col.flex ?? 1 },
                      i > 0 && styles.cellDivider,
                      i > 0 && { borderLeftColor: colors.tableRowBorder },
                    ]}
                  >
                    {typeof content === "string" ? (
                      <Text
                        style={[styles.cell, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {content}
                      </Text>
                    ) : (
                      content
                    )}
                  </View>
                );
              })}
            </View>
          );

          if (!onRowPress) return rowContent;

          return (
            <Pressable onPress={() => onRowPress(item)}>{rowContent}</Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 4 },
  headerCell: { fontWeight: "bold", fontSize: 13, paddingHorizontal: 6 },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  cell: { fontSize: 13, paddingHorizontal: 6 },
  cellDivider: { borderLeftWidth: 1 },
  empty: { textAlign: "center", padding: 20 },
});
