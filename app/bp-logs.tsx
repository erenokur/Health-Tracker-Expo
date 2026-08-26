import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { DataTable } from "../src/components/DataTable";
import { DateSpinnerRow, todayRange } from "../src/components/DateRangeFilter";
import { MenuButton } from "../src/components/MenuButton";
import { listBpLogs } from "../src/db/bpLogs";
import { BpLog, DateFilter } from "../src/types";

export default function BpLogScreen() {
  const router = useRouter();
  const initial = todayRange();
  const [start, setStart] = useState<DateFilter>(initial.start);
  const [end, setEnd] = useState<DateFilter>(initial.end);
  const [logs, setLogs] = useState<BpLog[]>(() =>
    listBpLogs(initial.start, initial.end),
  );

  function applyFilter() {
    setLogs(listBpLogs(start, end));
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <DateSpinnerRow
        label="Başlangıç Tarihi:"
        value={start}
        onChange={setStart}
      />
      <DateSpinnerRow label="Bitiş Tarihi:" value={end} onChange={setEnd} />
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
  container: { flex: 1, padding: 12, backgroundColor: "#f8fafc" },
});
