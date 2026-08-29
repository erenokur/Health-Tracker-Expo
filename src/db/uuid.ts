import * as Crypto from "expo-crypto";

export function newId(): string {
  return Crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

// Matches the original app's "YYYY-MM-DD HH:MM:SS" format used for display
// and for the log timestamp column (kept separate from updated_at, which is
// sync metadata and stays ISO8601).
export function nowDisplay(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Parses "YYYY-MM-DD HH:MM:SS" (our stored display format) back into a Date
// — not done via `new Date(string)` since Hermes doesn't reliably parse
// that format.
export function parseDisplayTimestamp(ts: string): Date {
  const [datePart, timePart] = ts.split(" ");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm, ss] = (timePart ?? "00:00:00").split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, ss ?? 0);
}
