import React, { useState } from "react";
import { Text, TextInput, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { requestWidgetUpdate } from "react-native-android-widget";
import { MenuButton } from "../src/components/MenuButton";
import { addBpLog, getLatestBpLog } from "../src/db/bpLogs";
import { LatestBpWidget } from "../src/widgets/LatestBpWidget";
import { DateTimePickerButton } from "../src/components/DateTimePickerButton";
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

export default function BpTrackingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [pulse, setPulse] = useState("");
  const [note, setNote] = useState("");
  const [logDate, setLogDate] = useState(new Date());

  function handleSave() {
    if (!sys || !dia) {
      Alert.alert(t("common.error"), t("bpTracking.errRequired"));
      return;
    }
    addBpLog({
      sys: parseInt(sys, 10),
      dia: parseInt(dia, 10),
      pulse: pulse ? parseInt(pulse, 10) : null,
      note,
      customDate: logDate,
    });
    refreshBpWidget();
    Alert.alert(t("common.success"), t("bpTracking.savedMsg"));
    setSys("");
    setDia("");
    setPulse("");
    setNote("");
    setLogDate(new Date());
    router.push("/tracking-menu");
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>{t("bpTracking.title")}</Text>
        <DateTimePickerButton
          label={t("common.dateAndTime")}
          date={logDate}
          onChange={setLogDate}
        />
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.border }]}
          placeholder={t("bpTracking.sysPlaceholder")}
          keyboardType="number-pad"
          value={sys}
          onChangeText={setSys}
        />
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.border }]}
          placeholder={t("bpTracking.diaPlaceholder")}
          keyboardType="number-pad"
          value={dia}
          onChangeText={setDia}
        />
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.border }]}
          placeholder={t("bpTracking.pulsePlaceholder")}
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
        <MenuButton label={t("bpTracking.save")} variant="primary" onPress={handleSave} />
        <MenuButton
          label={t("common.back")}
          variant="muted"
          onPress={() => router.push("/tracking-menu")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    fontSize: 18,
  },
});
