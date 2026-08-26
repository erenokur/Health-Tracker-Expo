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
