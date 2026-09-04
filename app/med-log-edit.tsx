import React, { useEffect, useState } from "react";
import { Text, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MenuButton } from "../src/components/MenuButton";
import { DateTimePickerButton } from "../src/components/DateTimePickerButton";
import { getMedLog, updateMedLog, deleteMedLog } from "../src/db/medLogs";
import { listActiveMedicationNames } from "../src/db/medications";
import { parseDisplayTimestamp } from "../src/db/uuid";
import { UsageMeal } from "../src/types";
import { refreshWidgetUI } from "../src/widgets/widgetUpdater";
import { useTheme } from "../src/theme/ThemeContext";
import { useLanguage } from "../src/i18n/LanguageContext";

export default function MedLogEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [medNames, setMedNames] = useState<string[]>([]);
  const [selectedMed, setSelectedMed] = useState("");
  const [meal, setMeal] = useState<UsageMeal>("Aç");
  const [logDate, setLogDate] = useState(new Date());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    const log = getMedLog(id);
    const active = listActiveMedicationNames();

    const names =
      log && !active.includes(log.med_name)
        ? [log.med_name, ...active]
        : active;
    setMedNames(names);

    if (log) {
      setSelectedMed(log.med_name);
      setMeal(log.meal_type as UsageMeal);
      setLogDate(parseDisplayTimestamp(log.timestamp));
    }
    setLoaded(true);
  }, [id]);

  function handleSave() {
    if (!id) return;
    if (!selectedMed) {
      Alert.alert(t("common.error"), t("medTracking.errNoMed"));
      return;
    }
    updateMedLog(id, selectedMed, meal, logDate);
    refreshWidgetUI();
    Alert.alert(t("common.success"), t("medLogEdit.updatedMsg"));
    router.back();
  }

  function handleDelete() {
    if (!id) return;
    Alert.alert(t("common.areYouSure"), t("medLogEdit.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          deleteMedLog(id);
          refreshWidgetUI();
          router.back();
        },
      },
    ]);
  }

  if (!loaded) return null;

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("medLogEdit.title")}
        </Text>

        <DateTimePickerButton
          label={t("common.dateAndTime")}
          date={logDate}
          onChange={setLogDate}
        />

        <Text style={[styles.label, { color: colors.text }]}>
          {t("filter.medication")}
        </Text>
        <Picker
          selectedValue={selectedMed}
          onValueChange={setSelectedMed}
          style={[
            styles.picker,
            { color: colors.text, backgroundColor: colors.inputBackground },
          ]}
        >
          {medNames.map((m) => (
            <Picker.Item key={m} label={m} value={m} />
          ))}
        </Picker>

        <Text style={[styles.label, { color: colors.text }]}>
          {t("medication.mealType")}
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
          label={t("medication.update")}
          variant="primary"
          onPress={handleSave}
        />
        <MenuButton
          label={t("common.delete")}
          variant="muted"
          onPress={handleDelete}
        />
        <MenuButton
          label={t("medication.cancelBack")}
          variant="muted"
          onPress={() => router.back()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  label: { fontWeight: "600", marginTop: 8, marginBottom: 4 },
  picker: { marginBottom: 12 },
});
