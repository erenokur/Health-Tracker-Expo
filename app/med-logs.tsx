import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { DataTable } from "../src/components/DataTable";
import { DateSpinnerRow, todayRange } from "../src/components/DateRangeFilter";
import { MenuButton } from "../src/components/MenuButton";
import { listMedLogs } from "../src/db/medLogs";
import { MedLog, DateFilter } from "../src/types";

export default function MedLogScreen() {
  const router = useRouter();
  const initial = todayRange();
  const [start, setStart] = useState<DateFilter>(initial.start);
  const [end, setEnd] = useState<DateFilter>(initial.end);
  const [logs, setLogs] = useState<MedLog[]>(() =>
    listMedLogs(initial.start, initial.end),
  );

  function applyFilter() {
    setLogs(listMedLogs(start, end));
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
          { header: "Tarih", flex: 1, render: (r) => r.timestamp.slice(5, 16) },
          {
            header: "İlaç Adı",
            flex: 1.5,
            render: (r) =>
              r.med_name.length > 15
                ? r.med_name.slice(0, 15) + "..."
                : r.med_name,
          },
          { header: "Aç/Tok", render: (r) => r.meal_type },
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
