import { db } from "./database";
import { newId, nowIso, nowDisplay } from "./uuid";
import { MedLog, UsageMeal } from "../types";

function formatTimestamp(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
}

export function addMedLog(medName: string, meal: UsageMeal, customDate?: Date): void {
  const tDisplay = customDate ? formatTimestamp(customDate) : nowDisplay();

  db.runSync(
    `INSERT INTO med_logs (id, timestamp, med_name, meal_type, updated_at, deleted, synced)
     VALUES (?, ?, ?, ?, ?, 0, 0)`,
    [newId(), tDisplay, medName, meal, nowIso()],
  );
}

export function getMedLog(id: string): MedLog | null {
  return db.getFirstSync<MedLog>("SELECT * FROM med_logs WHERE id = ?", [id]);
}

export function updateMedLog(
  id: string,
  medName: string,
  meal: UsageMeal,
  customDate?: Date,
): void {
  const tDisplay = customDate ? formatTimestamp(customDate) : nowDisplay();
  db.runSync(
    `UPDATE med_logs
     SET timestamp = ?, med_name = ?, meal_type = ?, updated_at = ?, synced = 0
     WHERE id = ?`,
    [tDisplay, medName, meal, nowIso(), id],
  );
}

export function deleteMedLog(id: string): void {
  db.runSync("UPDATE med_logs SET deleted = 1, updated_at = ?, synced = 0 WHERE id = ?", [
    nowIso(),
    id,
  ]);
}

export interface MedLogFilter {
  start: Date;
  end: Date;
  medName?: string; // "" or undefined = all medications
}

export function listMedLogs(filter: MedLogFilter): MedLog[] {
  let query = "SELECT * FROM med_logs WHERE deleted = 0";
  const params: string[] = [];

  query += " AND timestamp >= ? AND timestamp <= ?";
  params.push(formatTimestamp(filter.start), formatTimestamp(filter.end));

  if (filter.medName) {
    query += " AND med_name = ?";
    params.push(filter.medName);
  }

  query += " ORDER BY timestamp DESC";

  return db.getAllSync<MedLog>(query, params);
}

export function listDistinctMedLogNames(): string[] {
  const rows = db.getAllSync<{ med_name: string }>(
    "SELECT DISTINCT med_name FROM med_logs WHERE deleted = 0 ORDER BY med_name ASC",
  );
  return rows.map((r) => r.med_name);
}
