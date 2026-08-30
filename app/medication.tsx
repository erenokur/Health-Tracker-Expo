import React, { useEffect, useState } from "react";
import {
  Platform,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MenuButton } from "../src/components/MenuButton";
import { listCategories, ensureCategory } from "../src/db/categories";
import {
  getMedication,
  saveMedication,
  listActiveMedicationNames,
} from "../src/db/medications";
import { ActiveStatus, MealType } from "../src/types";
import { useTheme } from "../src/theme/ThemeContext";
import { useLanguage } from "../src/i18n/LanguageContext";
import { syncMedicineList } from "wear-bridge";

export default function MedicationScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const editing = Boolean(id);

  const [categories, setCategories] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [status, setStatus] = useState<ActiveStatus>("Aktif");
  const [mealType, setMealType] = useState<MealType>("Aç");
  const [dailyDose, setDailyDose] = useState("");
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const cats = listCategories().map((c) => c.name);
    setCategories(cats);

    if (id) {
      const med = getMedication(id);
      if (med) {
        setName(med.name);
        setCategory(med.category);
        setStatus(med.is_active as ActiveStatus);
        setMealType(med.meal_type as MealType);
        setDailyDose(med.daily_dose);
        setNotes(med.notes);
        setDescription(med.description);
      }
    } else if (cats.length > 0) {
      setCategory(cats[0]);
    }
  }, [id]);

  function handleSave() {
    const finalCategory = newCategory.trim() || category;
    if (!finalCategory) {
      Alert.alert(t("common.error"), t("medication.errNoCategory"));
      return;
    }
    if (!name.trim()) {
      Alert.alert(t("common.error"), t("medication.errNoName"));
      return;
    }

    if (newCategory.trim()) {
      ensureCategory(newCategory.trim());
    }

    saveMedication(
      {
        name: name.trim(),
        category: finalCategory,
        description,
        is_active: status,
        notes,
        daily_dose: dailyDose,
        meal_type: mealType,
      },
      editing ? id : undefined,
    );

    // Push the updated active medication list to the paired watch so the
    // chip picker in MedScreen stays in sync. Fire-and-forget — a sync
    // failure (e.g. watch out of range) should never block the user.
    if (Platform.OS === "android") {
      const activeNames = listActiveMedicationNames();
      syncMedicineList(activeNames).catch(() => {});
    }

    Alert.alert(
      t("common.success"),
      `${name} ${editing ? t("medication.updatedMsg") : t("medication.addedMsg")}`,
    );
    router.replace(editing ? "/med-list" : "/med-menu");
  }

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          {editing ? t("medication.titleEdit") : t("medication.titleAdd")}
        </Text>

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
          placeholder={t("medication.name")}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: colors.text }]}>
          {t("medication.category")}
        </Text>
        <Picker
          selectedValue={category}
          onValueChange={setCategory}
          style={[
            styles.picker,
            { color: colors.text, backgroundColor: colors.inputBackground },
          ]}
        >
          {categories.map((c) => (
            <Picker.Item key={c} label={c} value={c} />
          ))}
        </Picker>
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
          placeholder={t("medication.newCategoryPlaceholder")}
          value={newCategory}
          onChangeText={setNewCategory}
        />

        <Text style={[styles.label, { color: colors.text }]}>
          {t("medication.status")}
        </Text>
        <Picker
          selectedValue={status}
          onValueChange={(v) => setStatus(v as ActiveStatus)}
          style={[
            styles.picker,
            { color: colors.text, backgroundColor: colors.inputBackground },
          ]}
        >
          <Picker.Item label={t("medication.statusActive")} value="Aktif" />
          <Picker.Item label={t("medication.statusInactive")} value="Pasif" />
        </Picker>

        <Text style={[styles.label, { color: colors.text }]}>
          {t("medication.mealType")}
        </Text>
        <Picker
          selectedValue={mealType}
          onValueChange={(v) => setMealType(v as MealType)}
          style={[
            styles.picker,
            { color: colors.text, backgroundColor: colors.inputBackground },
          ]}
        >
          <Picker.Item label={t("medication.mealHungry")} value="Aç" />
          <Picker.Item label={t("medication.mealFull")} value="Tok" />
          <Picker.Item
            label={t("medication.mealDoesntMatter")}
            value="Farketmez"
          />
        </Picker>

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
          placeholder={t("medication.dailyDose")}
          keyboardType="number-pad"
          value={dailyDose}
          onChangeText={setDailyDose}
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
          placeholder={t("medication.notes")}
          value={notes}
          onChangeText={setNotes}
        />
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            styles.multiline,
            {
              color: colors.text,
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
            },
          ]}
          placeholder={t("medication.description")}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <MenuButton
          label={editing ? t("medication.update") : t("medication.save")}
          variant="primary"
          onPress={handleSave}
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
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 16 },
  label: { fontWeight: "600", marginTop: 8, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  multiline: { height: 90, textAlignVertical: "top" },
  picker: { marginBottom: 12 },
});
