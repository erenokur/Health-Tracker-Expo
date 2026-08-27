import { db } from "./database";
import { newId, nowIso, nowDisplay } from "./uuid";
import { MedLog, UsageMeal } from "../types";

export function addMedLog(
  medName: string,
  meal: UsageMeal,
  customDate?: Date,
): void {
  const tDisplay = customDate
    ? `${customDate.getFullYear()}-${String(customDate.getMonth() + 1).padStart(2, "0")}-${String(customDate.getDate()).padStart(2, "0")} ${String(customDate.getHours()).padStart(2, "0")}:${String(customDate.getMinutes()).padStart(2, "0")}`
    : nowDisplay();

  db.runSync(
    `INSERT INTO med_logs (id, timestamp, med_name, meal_type, updated_at, deleted, synced)
     VALUES (?, ?, ?, ?, ?, 0, 0)`,
    [newId(), tDisplay, medName, meal, nowIso()],
  );
}

function buildBound(date: Date, isStart: boolean): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function listMedLogs(start: Date, end: Date): MedLog[] {
  let query = "SELECT * FROM med_logs WHERE deleted = 0";
  const params: string[] = [];

  const startBound = buildBound(start, true);
  const endBound = buildBound(end, false);

  if (startBound) {
    query += " AND date(timestamp) >= ?";
    params.push(startBound);
  }
  if (endBound) {
    query += " AND date(timestamp) <= ?";
    params.push(endBound);
  }
  query += " ORDER BY timestamp DESC";

  return db.getAllSync<MedLog>(query, params);
}
