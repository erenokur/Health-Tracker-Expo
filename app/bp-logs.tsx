import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { DataTable } from "../src/components/DataTable";
import { DateTimePickerButton } from "../src/components/DateTimePickerButton";
import { CollapsibleSection } from "../src/components/CollapsibleSection";
import { MenuButton } from "../src/components/MenuButton";
import { listBpLogs, BpLogFilter } from "../src/db/bpLogs";
import { BpLog } from "../src/types";
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

export default function BpLogScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [startDate, setStartDate] = useState<Date>(() => startOfDay(daysAgo(7)));
  const [startTime, setStartTime] = useState<Date>(() => startOfDay(daysAgo(7)));
  const [endDate, setEndDate] = useState<Date>(() => endOfDay(new Date()));
  const [endTime, setEndTime] = useState<Date>(() => endOfDay(new Date()));

  const [minSys, setMinSys] = useState("");
  const [maxSys, setMaxSys] = useState("");
  const [minDia, setMinDia] = useState("");
  const [maxDia, setMaxDia] = useState("");
  const [minPulse, setMinPulse] = useState("");
  const [maxPulse, setMaxPulse] = useState("");

  function combine(datePart: Date, timePart: Date): Date {
    const c = new Date(datePart);
    c.setHours(timePart.getHours(), timePart.getMinutes(), timePart.getSeconds());
    return c;
  }

  function buildFilter(): BpLogFilter {
    return {
      start: combine(startDate, startTime),
      end: combine(endDate, endTime),
      minSys: minSys ? parseInt(minSys, 10) : undefined,
      maxSys: maxSys ? parseInt(maxSys, 10) : undefined,
      minDia: minDia ? parseInt(minDia, 10) : undefined,
      maxDia: maxDia ? parseInt(maxDia, 10) : undefined,
      minPulse: minPulse ? parseInt(minPulse, 10) : undefined,
      maxPulse: maxPulse ? parseInt(maxPulse, 10) : undefined,
    };
  }

  const [logs, setLogs] = useState<BpLog[]>(() => listBpLogs(buildFilter()));

  function applyFilter() {
    setLogs(listBpLogs(buildFilter()));
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
          {t("filter.sysRange")}
        </Text>
        <View style={styles.row}>
          <TextInput
            style={[
              styles.rangeInput,
              { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.border },
            ]}
            placeholder={t("common.min")}
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            value={minSys}
            onChangeText={setMinSys}
          />
          <TextInput
            style={[
              styles.rangeInput,
              { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.border },
            ]}
            placeholder={t("common.max")}
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            value={maxSys}
            onChangeText={setMaxSys}
          />
        </View>

        <Text style={[styles.subLabel, { color: colors.textMuted, marginTop: 8 }]}>
          {t("filter.diaRange")}
        </Text>
        <View style={styles.row}>
          <TextInput
            style={[
              styles.rangeInput,
              { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.border },
            ]}
            placeholder={t("common.min")}
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            value={minDia}
            onChangeText={setMinDia}
          />
          <TextInput
            style={[
              styles.rangeInput,
              { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.border },
            ]}
            placeholder={t("common.max")}
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            value={maxDia}
            onChangeText={setMaxDia}
          />
        </View>

        <Text style={[styles.subLabel, { color: colors.textMuted, marginTop: 8 }]}>
          {t("filter.pulseRange")}
        </Text>
        <View style={styles.row}>
          <TextInput
            style={[
              styles.rangeInput,
              { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.border },
            ]}
            placeholder={t("common.min")}
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            value={minPulse}
            onChangeText={setMinPulse}
          />
          <TextInput
            style={[
              styles.rangeInput,
              { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.border },
            ]}
            placeholder={t("common.max")}
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            value={maxPulse}
            onChangeText={setMaxPulse}
          />
        </View>

        <MenuButton label={t("filter.apply")} onPress={applyFilter} />
      </CollapsibleSection>

      <DataTable
        data={logs}
        keyExtractor={(r) => r.id}
        onRowPress={(r) => router.push(`/bp-log-edit?id=${r.id}`)}
        columns={[
          {
            header: t("common.date"),
            flex: 1.6,
            render: (r) => formatDisplayTimestamp(r.timestamp),
          },
          { header: t("bpLogs.colSys"), render: (r) => String(r.sys) },
          { header: t("bpLogs.colDia"), render: (r) => String(r.dia) },
          {
            header: t("bpLogs.colPulse"),
            render: (r) => (r.pulse != null ? String(r.pulse) : "-"),
          },
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
  rangeInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
});
