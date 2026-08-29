import React, { useEffect, useState } from "react";
import { Text, TextInput, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { requestWidgetUpdate } from "react-native-android-widget";
import { MenuButton } from "../src/components/MenuButton";
import { DateTimePickerButton } from "../src/components/DateTimePickerButton";
import { getBpLog, updateBpLog, deleteBpLog, getLatestBpLog } from "../src/db/bpLogs";
import { parseDisplayTimestamp } from "../src/db/uuid";
import { LatestBpWidget } from "../src/widgets/LatestBpWidget";
import { useTheme } from "../src/theme/ThemeContext";
import { useLanguage } from "../src/i18n/LanguageContext";

async function refreshBpWidget() {
  const latest = getLatestBpLog();
  await requestWidgetUpdate({
    widgetName: "LatestBp",
    renderWidget: () => (
      <LatestBpWidget
        sys={latest?.sys}
        dia={latest?.dia}
        pulse={latest?.pulse ?? null}
        timestamp={latest?.timestamp}
      />
    ),
    widgetNotFound: () => {},
  });
}

export default function BpLogEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [pulse, setPulse] = useState("");
  const [note, setNote] = useState("");
  const [logDate, setLogDate] = useState(new Date());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    const log = getBpLog(id);
    if (log) {
      setSys(String(log.sys));
      setDia(String(log.dia));
      setPulse(log.pulse != null ? String(log.pulse) : "");
      setNote(log.note ?? "");
      setLogDate(parseDisplayTimestamp(log.timestamp));
    }
    setLoaded(true);
  }, [id]);

  function handleSave() {
    if (!id) return;
    const sysVal = parseInt(sys, 10);
    const diaVal = parseInt(dia, 10);
    if (isNaN(sysVal) || isNaN(diaVal)) {
      Alert.alert(t("common.error"), t("bpTracking.errRequired"));
      return;
    }
    updateBpLog(id, {
      sys: sysVal,
      dia: diaVal,
      pulse: pulse ? parseInt(pulse, 10) : null,
      note,
      customDate: logDate,
    });
    refreshBpWidget();
    Alert.alert(t("common.success"), t("bpLogEdit.updatedMsg"));
    router.back();
  }

  function handleDelete() {
    if (!id) return;
    Alert.alert(t("common.areYouSure"), t("bpLogEdit.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          deleteBpLog(id);
          refreshBpWidget();
          router.back();
        },
      },
    ]);
  }

  if (!loaded) return null;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>{t("bpLogEdit.title")}</Text>

        <DateTimePickerButton label={t("common.dateAndTime")} date={logDate} onChange={setLogDate} />

        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.border }]}
          placeholder={t("bpLogs.colSys")}
          keyboardType="number-pad"
          value={sys}
          onChangeText={setSys}
        />
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.border }]}
          placeholder={t("bpLogs.colDia")}
          keyboardType="number-pad"
          value={dia}
          onChangeText={setDia}
        />
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.border }]}
          placeholder={t("bpLogs.colPulse")}
          keyboardType="number-pad"
          value={pulse}
          onChangeText={setPulse}
        />
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.border }]}
          placeholder={t("bpTracking.notePlaceholder")}
          value={note}
          onChangeText={setNote}
        />

        <MenuButton label={t("medication.update")} variant="primary" onPress={handleSave} />
        <MenuButton label={t("common.delete")} variant="muted" onPress={handleDelete} />
        <MenuButton label={t("medication.cancelBack")} variant="muted" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
  },
});
