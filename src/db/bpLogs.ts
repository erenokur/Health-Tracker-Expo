import { db } from "./database";
import { newId, nowIso, nowDisplay } from "./uuid";
import { BpLog, DateFilter } from "../types";

export interface BpLogInput {
  sys: number;
  dia: number;
  pulse: number | null;
  note: string;
}

export function addBpLog(input: BpLogInput): void {
  db.runSync(
    `INSERT INTO bp_logs (id, timestamp, sys, dia, pulse, note, updated_at, deleted, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`,
    [
      newId(),
      nowDisplay(),
      input.sys,
      input.dia,
      input.pulse,
      input.note,
      nowIso(),
    ],
  );
}

// Builds a YYYY-MM-DD bound from the {year, month, day} spinner selections,
// same "fill in 01/12-31 for unset parts" logic as the original DateFilterMixin.
function buildBound(filter: DateFilter, isStart: boolean): string | null {
  if (!filter.year || filter.year === "Tümü") return null;
  const month =
    filter.month && filter.month !== "Tümü"
      ? filter.month
      : isStart
        ? "01"
        : "12";
  const day =
    filter.day && filter.day !== "Tümü" ? filter.day : isStart ? "01" : "31";
  return `${filter.year}-${month}-${day}`;
}

export function listBpLogs(start: DateFilter, end: DateFilter): BpLog[] {
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
