import React, { useEffect, useState } from "react";
import { Text, TextInput, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MenuButton } from "../src/components/MenuButton";
import { listCategories, ensureCategory } from "../src/db/categories";
import { getMedication, saveMedication } from "../src/db/medications";
import { ActiveStatus, MealType } from "../src/types";

export default function MedicationScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
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
      Alert.alert("Hata", "Lütfen bir kategori seçin veya yazın.");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Hata", "İlaç adı boş olamaz.");
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

    Alert.alert(
      "Başarılı",
      editing ? `${name} güncellendi.` : `${name} başarıyla eklendi.`,
    );
    router.replace(editing ? "/med-list" : "/med-menu");
  }

  return (
    <SafeAreaView style={styles.flex} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          {editing ? "İlacı Düzenle" : "Yeni İlaç Ekle"}
        </Text>

        <TextInput
          placeholderTextColor="#64748b"
          style={styles.input}
          placeholder="İlaç Adı"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Kategori</Text>
        <Picker
          selectedValue={category}
          onValueChange={setCategory}
          style={styles.picker}
        >
          {categories.map((c) => (
            <Picker.Item key={c} label={c} value={c} />
          ))}
        </Picker>
        <TextInput
          placeholderTextColor="#64748b"
          style={styles.input}
          placeholder="Veya Yeni Kategori Yaz"
          value={newCategory}
          onChangeText={setNewCategory}
        />

        <Text style={styles.label}>Durum</Text>
        <Picker
          selectedValue={status}
          onValueChange={(v) => setStatus(v as ActiveStatus)}
          style={styles.picker}
        >
          <Picker.Item label="Aktif" value="Aktif" />
          <Picker.Item label="Pasif" value="Pasif" />
        </Picker>

        <Text style={styles.label}>Açlık/Tokluk</Text>
        <Picker
          selectedValue={mealType}
          onValueChange={(v) => setMealType(v as MealType)}
          style={styles.picker}
        >
          <Picker.Item label="Aç" value="Aç" />
          <Picker.Item label="Tok" value="Tok" />
          <Picker.Item label="Farketmez" value="Farketmez" />
        </Picker>

        <TextInput
          placeholderTextColor="#64748b"
          style={styles.input}
          placeholder="Günlük Doz (Örn: 2)"
          keyboardType="number-pad"
          value={dailyDose}
          onChangeText={setDailyDose}
        />
        <TextInput
          placeholderTextColor="#64748b"
          style={styles.input}
          placeholder="Özel Notlar"
          value={notes}
          onChangeText={setNotes}
        />
        <TextInput
          placeholderTextColor="#64748b"
          style={[styles.input, styles.multiline]}
          placeholder="Açıklama (Ne işe yarar?)"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <MenuButton
          label={editing ? "Güncelle" : "Kaydet"}
          variant="primary"
          onPress={handleSave}
        />
        <MenuButton
          label="İptal / Geri"
          variant="muted"
          onPress={() => router.back()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#f8fafc" },
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 16, color: "#000" },
  label: { fontWeight: "600", marginTop: 8, marginBottom: 4, color: "#000" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#fff",
  },
  multiline: { height: 90, textAlignVertical: "top" },
  picker: { marginBottom: 12, color: "#000", backgroundColor: "#fff" },
});
