import * as SQLite from "expo-sqlite";
import { newId } from "./uuid";

// Modern (SDK 51+) synchronous expo-sqlite API.
export const db = SQLite.openDatabaseSync("health_monitor.db");

export function initDb() {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      description TEXT,
      is_active TEXT,
      notes TEXT,
      daily_dose TEXT,
      meal_type TEXT,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0,
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS bp_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      sys INTEGER,
      dia INTEGER,
      pulse INTEGER,
      note TEXT,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0,
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS med_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      med_name TEXT NOT NULL,
      meal_type TEXT,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0,
      synced INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Seed default categories (matches original app), ignoring if already present.
  const now = new Date().toISOString();
  const seedCategories = [
    ["Ağrı Kesici"],
    ["Antibiyotik"],
  ];
  for (const [name] of seedCategories) {
    const existing = db.getFirstSync<{ id: string }>(
      "SELECT id FROM categories WHERE name = ?",
      [name]
    );
    if (!existing) {
      db.runSync(
        "INSERT INTO categories (id, name) VALUES (?, ?)",
        [newId(), name]
      );
    }
  }
}
