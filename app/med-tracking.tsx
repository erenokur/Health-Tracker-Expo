import React, { useEffect, useState } from "react";
import { Text, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { MenuButton } from "../src/components/MenuButton";
import { listActiveMedicationNames } from "../src/db/medications";
import { addMedLog } from "../src/db/medLogs";
import { UsageMeal } from "../src/types";

import { DateTimePickerButton } from "../src/components/DateTimePickerButton";

export default function MedTrackingScreen() {
  const router = useRouter();
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
      Alert.alert("Hata", "Lütfen bir ilaç seçin.");
      return;
    }
    addMedLog(selectedMed, meal, logDate);
    Alert.alert("Başarılı", `${selectedMed} içildi olarak kaydedildi.`);
    router.push("/tracking-menu");
  }

  return (
    <SafeAreaView style={styles.flex} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>İlaç İçildi Kaydı</Text>
        <DateTimePickerButton
          label="Tarih ve Saat"
          date={logDate}
          onChange={setLogDate}
        />

        <Text style={styles.label}>
          Kullanılan İlacı Seçiniz (Sadece Aktifler):
        </Text>
        <Picker
          selectedValue={selectedMed}
          onValueChange={setSelectedMed}
          style={styles.picker}
        >
          {meds.length === 0 && <Picker.Item label="Aktif ilaç yok" value="" />}
          {meds.map((m) => (
            <Picker.Item key={m} label={m} value={m} />
          ))}
        </Picker>

        <Text style={styles.label}>Açlık/Tokluk Durumu:</Text>
        <Picker
          selectedValue={meal}
          onValueChange={(v) => setMeal(v as UsageMeal)}
          style={styles.picker}
        >
          <Picker.Item label="Aç" value="Aç" />
          <Picker.Item label="Tok" value="Tok" />
        </Picker>

        <MenuButton
          label="İÇİLDİ OLARAK KAYDET"
          variant="primary"
          onPress={handleSave}
        />
        <MenuButton
          label="Geri Dön"
          variant="muted"
          onPress={() => router.push("/tracking-menu")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#f8fafc" },
  container: { padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#000",
  },
  label: { fontWeight: "600", marginBottom: 6, marginTop: 10, color: "#000" },
  picker: { marginBottom: 10, color: "#000", backgroundColor: "#fff" },
});
