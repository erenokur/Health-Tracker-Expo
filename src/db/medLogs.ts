import { db } from "./database";
import { newId, nowIso, nowDisplay } from "./uuid";
import { MedLog, DateFilter, UsageMeal } from "../types";

export function addMedLog(medName: string, meal: UsageMeal): void {
  db.runSync(
    `INSERT INTO med_logs (id, timestamp, med_name, meal_type, updated_at, deleted, synced)
     VALUES (?, ?, ?, ?, ?, 0, 0)`,
    [newId(), nowDisplay(), medName, meal, nowIso()]
  );
}

function buildBound(filter: DateFilter, isStart: boolean): string | null {
  if (!filter.year || filter.year === "Tümü") return null;
  const month = filter.month && filter.month !== "Tümü" ? filter.month : isStart ? "01" : "12";
  const day = filter.day && filter.day !== "Tümü" ? filter.day : isStart ? "01" : "31";
  return `${filter.year}-${month}-${day}`;
}

export function listMedLogs(start: DateFilter, end: DateFilter): MedLog[] {
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
