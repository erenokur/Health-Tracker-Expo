import React, { useState } from "react";
import {
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MenuButton } from "../src/components/MenuButton";
import { addBpLog } from "../src/db/bpLogs";
import { refreshWidgetUI } from "../src/widgets/widgetUpdater";
import { DateTimePickerButton } from "../src/components/DateTimePickerButton";
import { useTheme } from "../src/theme/ThemeContext";
import { useLanguage } from "../src/i18n/LanguageContext";

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
    refreshWidgetUI();
    Alert.alert(t("common.success"), t("bpTracking.savedMsg"));
    setSys("");
    setDia("");
    setPulse("");
    setNote("");
    setLogDate(new Date());
    router.push("/tracking-menu");
  }

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("bpTracking.title")}
        </Text>

        <View style={styles.dateRow}>
          <View style={styles.flex}>
            <DateTimePickerButton
              label={t("common.date")}
              mode="date"
              date={logDate}
              onChange={setLogDate}
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={styles.flex}>
            <DateTimePickerButton
              label={t("common.time")}
              mode="time"
              date={logDate}
              onChange={setLogDate}
            />
          </View>
        </View>

        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
            },
          ]}
          placeholder={t("bpTracking.sysPlaceholder")}
          keyboardType="number-pad"
          value={sys}
          onChangeText={setSys}
        />
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
            },
          ]}
          placeholder={t("bpTracking.diaPlaceholder")}
          keyboardType="number-pad"
          value={dia}
          onChangeText={setDia}
        />
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
            },
          ]}
          placeholder={t("bpTracking.pulsePlaceholder")}
          keyboardType="number-pad"
          value={pulse}
          onChangeText={setPulse}
        />
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
            },
          ]}
          placeholder={t("bpTracking.notePlaceholder")}
          value={note}
          onChangeText={setNote}
        />
        <MenuButton
          label={t("bpTracking.save")}
          variant="primary"
          onPress={handleSave}
        />
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
  dateRow: { flexDirection: "row", justifyContent: "space-between" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    fontSize: 18,
  },
});
