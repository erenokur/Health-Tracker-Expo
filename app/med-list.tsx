import React, { useCallback, useState } from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { DataTable } from "../src/components/DataTable";
import { MenuButton } from "../src/components/MenuButton";
import { listMedications } from "../src/db/medications";
import { Medication } from "../src/types";
import { useTheme } from "../src/theme/ThemeContext";

export default function MedListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [meds, setMeds] = useState<Medication[]>([]);

  // Reload every time the screen gains focus, so edits made in the form
  // (and returning via router.back()) show up immediately — no manual refresh needed.
  useFocusEffect(
    useCallback(() => {
      setMeds(listMedications());
    }, []),
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Kayıtlı İlaçlar (Aktifler Üstte)
      </Text>
      <DataTable
        data={meds}
        keyExtractor={(m) => m.id}
        columns={[
          { header: "İlaç Adı", render: (m) => m.name },
          { header: "Kategori", render: (m) => m.category },
          { header: "Durum", render: (m) => m.is_active },
          {
            header: "İşlem",
            flex: 0.8,
            render: (m) => (
              <Pressable
                style={[
                  styles.editBtn,
                  { backgroundColor: colors.editRowBackground },
                ]}
                onPress={() => router.push(`/medication?id=${m.id}`)}
              >
                <Text
                  style={[styles.editBtnText, { color: colors.editRowText }]}
                >
                  Düzenle
                </Text>
              </Pressable>
            ),
          },
        ]}
      />
      <MenuButton
        label="Geri Dön"
        variant="muted"
        onPress={() => router.push("/med-menu")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  editBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: "center",
  },
  editBtnText: { fontWeight: "600", fontSize: 13 },
});
