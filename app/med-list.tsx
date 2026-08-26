import React, { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { DataTable } from "../src/components/DataTable";
import { MenuButton } from "../src/components/MenuButton";
import { listMedications } from "../src/db/medications";
import { Medication } from "../src/types";

export default function MedListScreen() {
  const router = useRouter();
  const [meds, setMeds] = useState<Medication[]>([]);

  // Reload every time the screen gains focus, so edits made in the form
  // (and returning via router.back()) show up immediately — no manual refresh needed.
  useFocusEffect(
    useCallback(() => {
      setMeds(listMedications());
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Text style={styles.title}>Kayıtlı İlaçlar (Aktifler Üstte)</Text>
      <DataTable
        data={meds}
        keyExtractor={(m) => m.id}
        columns={[
          { header: "İlaç Adı", render: (m) => m.name },
          { header: "Kategori", render: (m) => m.category },
          { header: "Durum", render: (m) => m.is_active },
          {
            header: "İşlem",
            render: () => "Düzenle",
          },
        ]}
      />
      {/* Overlay-free approach: render edit buttons separately since DataTable
          cells are plain text; swap to a custom row renderer if you want the
          button inline in the same grid as the original Kivy screen. */}
      <View style={styles.editList}>
        {meds.map((m) => (
          <Pressable key={m.id} style={styles.editRow} onPress={() => router.push(`/medication?id=${m.id}`)}>
            <Text style={styles.editRowText}>Düzenle: {m.name}</Text>
          </Pressable>
        ))}
      </View>
      <MenuButton label="Geri Dön" variant="muted" onPress={() => router.push("/med-menu")} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  editList: { marginTop: 8, marginBottom: 12 },
  editRow: {
    backgroundColor: "#e0f2fe",
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  editRowText: { color: "#0369a1", fontWeight: "600" },
});
