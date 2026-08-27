import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";

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
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyLabel = "Kayıt Bulunamadı",
}: Props<T>) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View
        style={[styles.headerRow, { backgroundColor: colors.tableHeaderBg }]}
      >
        {columns.map((col) => (
          <Text
            key={col.header}
            style={[
              styles.headerCell,
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
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.tableEmptyText }]}>
            {emptyLabel}
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={[styles.row, { borderBottomColor: colors.tableRowBorder }]}
          >
            {columns.map((col) => {
              const content = col.render(item);
              return (
                <View key={col.header} style={{ flex: col.flex ?? 1 }}>
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
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 4 },
  headerCell: { fontWeight: "bold", fontSize: 13 },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  cell: { fontSize: 13 },
  empty: { textAlign: "center", padding: 20 },
});
