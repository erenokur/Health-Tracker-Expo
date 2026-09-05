import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { useRouter, useFocusEffect } from "expo-router";
import { DataTable } from "../src/components/DataTable";
import { DateTimePickerButton } from "../src/components/DateTimePickerButton";
import { CollapsibleSection } from "../src/components/CollapsibleSection";
import { MenuButton } from "../src/components/MenuButton";
import { listMedLogs, listDistinctMedLogNames, MedLogFilter } from "../src/db/medLogs";
import { MedLog } from "../src/types";
import { useTheme } from "../src/theme/ThemeContext";
import { useLanguage } from "../src/i18n/LanguageContext";

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}
function endOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(23, 59, 59, 999);
  return c;
}
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function formatDisplayTimestamp(ts: string): string {
  const [datePart, timePart] = ts.split(" ");
  const [y, m, d] = datePart.split("-");
  return `${d}.${m}.${y} ${timePart?.slice(0, 5) ?? ""}`;
}

export default function MedLogScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [startDate, setStartDate] = useState<Date>(() => startOfDay(daysAgo(7)));
  const [startTime, setStartTime] = useState<Date>(() => startOfDay(daysAgo(7)));
  const [endDate, setEndDate] = useState<Date>(() => endOfDay(new Date()));
  const [endTime, setEndTime] = useState<Date>(() => endOfDay(new Date()));
  const [medNameFilter, setMedNameFilter] = useState<string>("");

  const [medNames, setMedNames] = useState<string[]>(() => listDistinctMedLogNames());

  function combine(datePart: Date, timePart: Date): Date {
    const c = new Date(datePart);
    c.setHours(timePart.getHours(), timePart.getMinutes(), timePart.getSeconds());
    return c;
  }

  function buildFilter(): MedLogFilter {
    return {
      start: combine(startDate, startTime),
      end: combine(endDate, endTime),
      medName: medNameFilter || undefined,
    };
  }

  const [logs, setLogs] = useState<MedLog[]>([]);

  useFocusEffect(
    useCallback(() => {
      setMedNames(listDistinctMedLogNames());
      setLogs(listMedLogs(buildFilter()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, startTime, endDate, endTime, medNameFilter]),
  );

  function applyFilter() {
    setLogs(listMedLogs(buildFilter()));
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <CollapsibleSection title={t("filter.title")} defaultOpen={false}>
        <Text style={[styles.subLabel, { color: colors.textMuted }]}>
          {t("filter.start")}
        </Text>
        <View style={styles.row}>
          <View style={styles.half}>
            <DateTimePickerButton
              label={t("common.date")}
              mode="date"
              date={startDate}
              onChange={setStartDate}
            />
          </View>
          <View style={styles.half}>
            <DateTimePickerButton
              label={t("common.time")}
              mode="time"
              date={startTime}
              onChange={setStartTime}
            />
          </View>
        </View>

        <Text style={[styles.subLabel, { color: colors.textMuted }]}>{t("filter.end")}</Text>
        <View style={styles.row}>
          <View style={styles.half}>
            <DateTimePickerButton
              label={t("common.date")}
              mode="date"
              date={endDate}
              onChange={setEndDate}
            />
          </View>
          <View style={styles.half}>
            <DateTimePickerButton
              label={t("common.time")}
              mode="time"
              date={endTime}
              onChange={setEndTime}
            />
          </View>
        </View>

        <Text style={[styles.subLabel, { color: colors.textMuted, marginTop: 8 }]}>
          {t("filter.medication")}
        </Text>
        <Picker
          selectedValue={medNameFilter}
          onValueChange={setMedNameFilter}
          style={{ color: colors.text, backgroundColor: colors.inputBackground }}
        >
          <Picker.Item label={t("common.all")} value="" />
          {medNames.map((n) => (
            <Picker.Item key={n} label={n} value={n} />
          ))}
        </Picker>

        <MenuButton label={t("filter.apply")} onPress={applyFilter} />
      </CollapsibleSection>

      <DataTable
        data={logs}
        keyExtractor={(r) => r.id}
        onRowPress={(r) => router.push(`/med-log-edit?id=${r.id}`)}
        columns={[
          {
            header: t("common.date"),
            flex: 1.4,
            render: (r) => formatDisplayTimestamp(r.timestamp),
          },
          {
            header: t("medLogs.colName"),
            flex: 1.5,
            render: (r) =>
              r.med_name.length > 15 ? r.med_name.slice(0, 15) + "..." : r.med_name,
          },
          { header: t("medLogs.colMeal"), render: (r) => r.meal_type },
        ]}
      />

      <MenuButton
        label={t("common.back")}
        variant="muted"
        onPress={() => router.push("/log-menu")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  subLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  row: { flexDirection: "row", gap: 8 },
  half: { flex: 1 },
});
