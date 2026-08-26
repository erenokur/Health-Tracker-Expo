import { db } from "./database";
import { newId, nowIso } from "./uuid";
import { Medication } from "../types";

export function listMedications(): Medication[] {
  return db.getAllSync<Medication>(
    `SELECT * FROM medications WHERE deleted = 0
     ORDER BY is_active ASC, name ASC`
  );
}

export function listActiveMedicationNames(): string[] {
  const rows = db.getAllSync<{ name: string }>(
    "SELECT name FROM medications WHERE is_active = 'Aktif' AND deleted = 0 ORDER BY name ASC"
  );
  return rows.map((r) => r.name);
}

export function getMedication(id: string): Medication | null {
  return db.getFirstSync<Medication>("SELECT * FROM medications WHERE id = ?", [id]);
}

export interface MedicationInput {
  name: string;
  category: string;
  description: string;
  is_active: "Aktif" | "Pasif";
  notes: string;
  daily_dose: string;
  meal_type: "Aç" | "Tok" | "Farketmez";
}

// Handles both create (id undefined) and update (id provided) — mirrors the
// editing_id pattern from the original MedicationScreen.
export function saveMedication(input: MedicationInput, id?: string): string {
  const now = nowIso();
  if (id) {
    db.runSync(
      `UPDATE medications
       SET name = ?, category = ?, description = ?, is_active = ?, notes = ?,
           daily_dose = ?, meal_type = ?, updated_at = ?, synced = 0
       WHERE id = ?`,
      [
        input.name,
        input.category,
        input.description,
        input.is_active,
        input.notes,
        input.daily_dose,
        input.meal_type,
        now,
        id,
      ]
    );
    return id;
  }

  const newMedId = newId();
  db.runSync(
    `INSERT INTO medications
      (id, name, category, description, is_active, notes, daily_dose, meal_type, updated_at, deleted, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
    [
      newMedId,
      input.name,
      input.category,
      input.description,
      input.is_active,
      input.notes,
      input.daily_dose,
      input.meal_type,
      now,
    ]
  );
  return newMedId;
}

export function deleteMedication(id: string): void {
  // Soft delete so it can still sync (see migration plan Phase 4).
  db.runSync(
    "UPDATE medications SET deleted = 1, updated_at = ?, synced = 0 WHERE id = ?",
    [nowIso(), id]
  );
}
