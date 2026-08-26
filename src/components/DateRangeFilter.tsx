import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { DateFilter } from "../types";

const YEARS = ["Tümü", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];
const MONTHS = ["Tümü", ...Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))];
const DAYS = ["Tümü", ...Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"))];

function todayFilter(): DateFilter {
  const d = new Date();
  return {
    year: String(d.getFullYear()),
    month: String(d.getMonth() + 1).padStart(2, "0"),
    day: String(d.getDate()).padStart(2, "0"),
  };
}

export function todayRange(): { start: DateFilter; end: DateFilter } {
  const t = todayFilter();
  return { start: t, end: t };
}

interface Props {
  label: string;
  value: DateFilter;
  onChange: (value: DateFilter) => void;
}

export function DateSpinnerRow({ label, value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Picker
          style={styles.picker}
          selectedValue={value.year ?? "Tümü"}
          onValueChange={(year) => onChange({ ...value, year })}
        >
          {YEARS.map((y) => (
            <Picker.Item key={y} label={y} value={y} />
          ))}
        </Picker>
        <Picker
          style={styles.picker}
          selectedValue={value.month ?? "Tümü"}
          onValueChange={(month) => onChange({ ...value, month })}
        >
          {MONTHS.map((m) => (
            <Picker.Item key={m} label={m} value={m} />
          ))}
        </Picker>
        <Picker
          style={styles.picker}
          selectedValue={value.day ?? "Tümü"}
          onValueChange={(day) => onChange({ ...value, day })}
        >
          {DAYS.map((d) => (
            <Picker.Item key={d} label={d} value={d} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  label: { fontWeight: "bold", marginBottom: 4 },
  row: { flexDirection: "row", gap: 4 },
  picker: { flex: 1 },
});
