import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { DataTable } from "../src/components/DataTable";
import { DateTimePickerButton } from "../src/components/DateTimePickerButton";
import { MenuButton } from "../src/components/MenuButton";
import { listBpLogs } from "../src/db/bpLogs";
import { BpLog } from "../src/types";
import { useTheme } from "../src/theme/ThemeContext";

export default function BpLogScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [start, setStart] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [end, setEnd] = useState<Date>(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  });

  const [logs, setLogs] = useState<BpLog[]>(() => listBpLogs(start, end));

  function applyFilter() {
    setLogs(listBpLogs(start, end));
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <DateTimePickerButton
        label="Başlangıç Tarihi:"
        mode="date"
        date={start}
        onChange={setStart}
      />
      <DateTimePickerButton
        label="Bitiş Tarihi:"
        mode="date"
        date={end}
        onChange={setEnd}
      />
      <MenuButton label="FİLTREYİ UYGULA" onPress={applyFilter} />

      <DataTable
        data={logs}
        keyExtractor={(r) => r.id}
        columns={[
          {
            header: "Tarih",
            flex: 1.2,
            render: (r) => r.timestamp.slice(5, 16),
          },
          { header: "Büyük", render: (r) => String(r.sys) },
          { header: "Küçük", render: (r) => String(r.dia) },
          {
            header: "Nabız",
            render: (r) => (r.pulse != null ? String(r.pulse) : "-"),
          },
          {
            header: "Not",
            flex: 1.5,
            render: (r) =>
              r.note.length > 10 ? r.note.slice(0, 10) + "..." : r.note,
          },
        ]}
      />

      <MenuButton
        label="Geri Dön"
        variant="muted"
        onPress={() => router.push("/log-menu")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
});
