import React, { useEffect, useState } from "react";
import { Text, ScrollView, StyleSheet, Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { MenuButton } from "../src/components/MenuButton";
import { listActiveMedicationNames } from "../src/db/medications";
import { addMedLog } from "../src/db/medLogs";
import { refreshWidgetUI } from "../src/widgets/widgetUpdater";
import { UsageMeal } from "../src/types";
import { DateTimePickerButton } from "../src/components/DateTimePickerButton";
import { useTheme } from "../src/theme/ThemeContext";
import { useLanguage } from "../src/i18n/LanguageContext";

export default function MedTrackingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [meds, setMeds] = useState<string[]>([]);
  const [selectedMed, setSelectedMed] = useState<string>("");
  const [meal, setMeal] = useState<UsageMeal>("Aç");
  const [logDate, setLogDate] = useState(new Date());

  useEffect(() => {
    const active = listActiveMedicationNames();
    setMeds(active);
    if (active.length > 0) setSelectedMed(active[0]);
  }, []);

  function handleSave() {
    if (!selectedMed) {
      Alert.alert(t("common.error"), t("medTracking.errNoMed"));
      return;
    }
    addMedLog(selectedMed, meal, logDate);
    refreshWidgetUI();
    Alert.alert(
      t("common.success"),
      `${selectedMed} ${t("medTracking.savedMsg")}`,
    );
    router.push("/tracking-menu");
  }

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("medTracking.title")}
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

        <Text style={[styles.label, { color: colors.text }]}>
          {t("medTracking.pickMed")}
        </Text>
        <Picker
          selectedValue={selectedMed}
          onValueChange={setSelectedMed}
          style={[
            styles.picker,
            { color: colors.text, backgroundColor: colors.inputBackground },
          ]}
        >
          {meds.length === 0 && (
            <Picker.Item label={t("medTracking.noActiveMed")} value="" />
          )}
          {meds.map((m) => (
            <Picker.Item key={m} label={m} value={m} />
          ))}
        </Picker>

        <Text style={[styles.label, { color: colors.text }]}>
          {t("medTracking.mealStatus")}
        </Text>
        <Picker
          selectedValue={meal}
          onValueChange={(v) => setMeal(v as UsageMeal)}
          style={[
            styles.picker,
            { color: colors.text, backgroundColor: colors.inputBackground },
          ]}
        >
          <Picker.Item label={t("medication.mealHungry")} value="Aç" />
          <Picker.Item label={t("medication.mealFull")} value="Tok" />
        </Picker>

        <MenuButton
          label={t("medTracking.save")}
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
  label: { fontWeight: "600", marginBottom: 6, marginTop: 10 },
  picker: { marginBottom: 10 },
});
