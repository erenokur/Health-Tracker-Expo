import { db } from "./database";
import { newId, nowIso, nowDisplay } from "./uuid";
import { BpLog, DateFilter } from "../types";

export interface BpLogInput {
  sys: number;
  dia: number;
  pulse: number | null;
  note: string;
  customDate?: Date; // allow custom date
}

export function addBpLog(input: BpLogInput): void {
  const tDisplay = input.customDate
    ? `${input.customDate.getFullYear()}-${String(input.customDate.getMonth() + 1).padStart(2, "0")}-${String(input.customDate.getDate()).padStart(2, "0")} ${String(input.customDate.getHours()).padStart(2, "0")}:${String(input.customDate.getMinutes()).padStart(2, "0")}`
    : nowDisplay();

  db.runSync(
    `INSERT INTO bp_logs (id, timestamp, sys, dia, pulse, note, updated_at, deleted, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`,
    [
      newId(),
      tDisplay,
      input.sys,
      input.dia,
      input.pulse,
      input.note,
      nowIso(),
    ],
  );
}

function buildBound(date: Date, isStart: boolean): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function listBpLogs(start: Date, end: Date): BpLog[] {
  let query = "SELECT * FROM bp_logs WHERE deleted = 0";
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

  return db.getAllSync<BpLog>(query, params);
}

export function getLatestBpLog(): BpLog | null {
  return db.getFirstSync<BpLog>(
    "SELECT * FROM bp_logs WHERE deleted = 0 ORDER BY timestamp DESC LIMIT 1",
  );
}
