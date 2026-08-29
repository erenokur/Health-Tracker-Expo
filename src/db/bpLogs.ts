import { db } from "./database";
import { newId, nowIso, nowDisplay } from "./uuid";
import { BpLog } from "../types";

export interface BpLogInput {
  sys: number;
  dia: number;
  pulse: number | null;
  note: string;
  customDate?: Date; // allow custom date
}

function formatTimestamp(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
}

export function addBpLog(input: BpLogInput): void {
  const tDisplay = input.customDate ? formatTimestamp(input.customDate) : nowDisplay();

  db.runSync(
    `INSERT INTO bp_logs (id, timestamp, sys, dia, pulse, note, updated_at, deleted, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`,
    [newId(), tDisplay, input.sys, input.dia, input.pulse, input.note, nowIso()],
  );
}

export function getBpLog(id: string): BpLog | null {
  return db.getFirstSync<BpLog>("SELECT * FROM bp_logs WHERE id = ?", [id]);
}

export function updateBpLog(id: string, input: BpLogInput): void {
  const tDisplay = input.customDate ? formatTimestamp(input.customDate) : nowDisplay();
  db.runSync(
    `UPDATE bp_logs
     SET timestamp = ?, sys = ?, dia = ?, pulse = ?, note = ?, updated_at = ?, synced = 0
     WHERE id = ?`,
    [tDisplay, input.sys, input.dia, input.pulse, input.note, nowIso(), id],
  );
}

export function deleteBpLog(id: string): void {
  db.runSync("UPDATE bp_logs SET deleted = 1, updated_at = ?, synced = 0 WHERE id = ?", [
    nowIso(),
    id,
  ]);
}

export interface BpLogFilter {
  start: Date;
  end: Date;
  minSys?: number;
  maxSys?: number;
  minDia?: number;
  maxDia?: number;
  minPulse?: number;
  maxPulse?: number;
}

export function listBpLogs(filter: BpLogFilter): BpLog[] {
  let query = "SELECT * FROM bp_logs WHERE deleted = 0";
  const params: (string | number)[] = [];

  query += " AND timestamp >= ? AND timestamp <= ?";
  params.push(formatTimestamp(filter.start), formatTimestamp(filter.end));

  if (filter.minSys != null) {
    query += " AND sys >= ?";
    params.push(filter.minSys);
  }
  if (filter.maxSys != null) {
    query += " AND sys <= ?";
    params.push(filter.maxSys);
  }
  if (filter.minDia != null) {
    query += " AND dia >= ?";
    params.push(filter.minDia);
  }
  if (filter.maxDia != null) {
    query += " AND dia <= ?";
    params.push(filter.maxDia);
  }
  if (filter.minPulse != null) {
    query += " AND pulse >= ?";
    params.push(filter.minPulse);
  }
  if (filter.maxPulse != null) {
    query += " AND pulse <= ?";
    params.push(filter.maxPulse);
  }

  query += " ORDER BY timestamp DESC";

  return db.getAllSync<BpLog>(query, params);
}

export function getLatestBpLog(): BpLog | null {
  return db.getFirstSync<BpLog>(
    "SELECT * FROM bp_logs WHERE deleted = 0 ORDER BY timestamp DESC LIMIT 1",
  );
}
