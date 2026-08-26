import { db } from "./database";
import { newId } from "./uuid";
import { Category } from "../types";

export function listCategories(): Category[] {
  return db.getAllSync<Category>("SELECT id, name FROM categories ORDER BY name ASC");
}

export function ensureCategory(name: string): void {
  const trimmed = name.trim();
  if (!trimmed) return;
  const existing = db.getFirstSync<{ id: string }>(
    "SELECT id FROM categories WHERE name = ?",
    [trimmed]
  );
  if (!existing) {
    db.runSync("INSERT INTO categories (id, name) VALUES (?, ?)", [newId(), trimmed]);
  }
}
