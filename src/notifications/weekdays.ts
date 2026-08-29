import { Language, translations } from "../i18n/translations";

// Value = 1-7, 1 = Sunday (matches expo-notifications' weekday convention)
const WEEKDAY_KEYS: { key: string; value: number }[] = [
  { key: "weekday.sunday", value: 1 },
  { key: "weekday.monday", value: 2 },
  { key: "weekday.tuesday", value: 3 },
  { key: "weekday.wednesday", value: 4 },
  { key: "weekday.thursday", value: 5 },
  { key: "weekday.friday", value: 6 },
  { key: "weekday.saturday", value: 7 },
];

export function getWeekdays(language: Language): { label: string; value: number }[] {
  return WEEKDAY_KEYS.map((w) => ({
    label: translations[language][w.key] ?? w.key,
    value: w.value,
  }));
}

export function weekdayLabel(value: number, language: Language): string {
  const entry = WEEKDAY_KEYS.find((w) => w.value === value);
  if (!entry) return "?";
  return translations[language][entry.key] ?? entry.key;
}
