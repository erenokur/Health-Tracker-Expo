import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

export interface Column<T> {
  header: string;
  flex?: number;
  render: (row: T) => string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyLabel?: string;
}

export function DataTable<T>({ columns, data, keyExtractor, emptyLabel = "Kayıt Bulunamadı" }: Props<T>) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {columns.map((col) => (
          <Text key={col.header} style={[styles.headerCell, { flex: col.flex ?? 1 }]}>
            {col.header}
          </Text>
        ))}
      </View>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        ListEmptyComponent={<Text style={styles.empty}>{emptyLabel}</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {columns.map((col) => (
              <Text key={col.header} style={[styles.cell, { flex: col.flex ?? 1 }]} numberOfLines={1}>
                {col.render(item)}
              </Text>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#333",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  headerCell: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cell: { fontSize: 13 },
  empty: { textAlign: "center", padding: 20, color: "#888" },
});
