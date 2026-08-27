import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  label: string;
  date: Date;
  onChange: (date: Date) => void;
  mode?: "date" | "time" | "datetime";
}

export function DateTimePickerButton({
  label,
  date,
  onChange,
  mode = "datetime",
}: Props) {
  const { colors } = useTheme();
  const [show, setShow] = useState(false);
  const [currentMode, setCurrentMode] = useState<"date" | "time">(
    mode === "time" ? "time" : "date",
  );

  const showMode = (modeToShow: "date" | "time") => {
    setShow(true);
    setCurrentMode(modeToShow);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    // If running on Android, close the picker immediately
    // iOS usually handles this natively in the default display
    if (Platform.OS === "android") {
      setShow(false);
    }

    if (event.type === "dismissed") {
      setShow(false);
      return;
    }

    if (selectedDate) {
      if (
        mode === "datetime" &&
        currentMode === "date" &&
        Platform.OS === "android"
      ) {
        // After date is selected, show time picker
        const updatedDate = new Date(selectedDate);
        updatedDate.setHours(date.getHours(), date.getMinutes());
        onChange(updatedDate);
        setTimeout(() => showMode("time"), 100); // slight delay
      } else {
        const newDate = new Date(date);
        if (currentMode === "date") {
          newDate.setFullYear(selectedDate.getFullYear());
          newDate.setMonth(selectedDate.getMonth());
          newDate.setDate(selectedDate.getDate());
        } else {
          newDate.setHours(selectedDate.getHours());
          newDate.setMinutes(selectedDate.getMinutes());
        }
        onChange(newDate);
      }
    }
  };

  // Format display
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  const H = date.getHours().toString().padStart(2, "0");
  const M = date.getMinutes().toString().padStart(2, "0");

  let displayValue = "";
  if (mode === "date") displayValue = `${d}.${m}.${y}`;
  else if (mode === "time") displayValue = `${H}:${M}`;
  else displayValue = `${d}.${m}.${y} ${H}:${M}`;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Pressable
        style={[
          styles.button,
          { backgroundColor: colors.inputBackground, borderColor: colors.border },
        ]}
        onPress={() => showMode(mode === "time" ? "time" : "date")}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>{displayValue}</Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={date}
          mode={currentMode}
          is24Hour={true}
          display="default"
          onChange={onDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontWeight: "600", marginBottom: 6 },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    justifyContent: "center",
  },
  buttonText: { fontSize: 16 },
});
