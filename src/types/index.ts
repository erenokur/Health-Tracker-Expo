// Shared types mirroring the original Kivy app's schema, plus sync metadata
// (see health-app-migration-plan.md, Phase 4) added to every table up front
// so we don't have to migrate later.

export type ActiveStatus = "Aktif" | "Pasif";
export type MealType = "Aç" | "Tok" | "Farketmez";
export type UsageMeal = "Aç" | "Tok";

export interface SyncFields {
  updated_at: string; // ISO8601, bumped on every local write
  deleted: 0 | 1; // soft delete so deletions can sync too
  synced: 0 | 1; // 0 = pending push, 1 = confirmed by server
}

export interface Category {
  id: string; // uuid
  name: string;
}

export interface Medication extends SyncFields {
  id: string; // uuid
  name: string;
  category: string;
  description: string;
  is_active: ActiveStatus;
  notes: string;
  daily_dose: string;
  meal_type: MealType;
}

export interface BpLog extends SyncFields {
  id: string; // uuid
  timestamp: string; // "YYYY-MM-DD HH:MM:SS"
  sys: number;
  dia: number;
  pulse: number | null;
  note: string;
}

export interface MedLog extends SyncFields {
  id: string; // uuid
  timestamp: string;
  med_name: string;
  meal_type: UsageMeal;
}

export interface DateFilter {
  year: string | null; // null / "Tümü" = no bound
  month: string | null;
  day: string | null;
}
