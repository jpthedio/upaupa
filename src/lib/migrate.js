import { supabase } from "./supabase";
import { toSnake } from "./db-mapping";

const STORE_KEY = "upaupa-data";
const MIGRATED_KEY = "upaupa-migrated";

export function hasLocalData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    return d.buildings?.length > 0 || d.units?.length > 0 || d.tenants?.length > 0 || d.payments?.length > 0;
  } catch {
    return false;
  }
}

export function isMigrated() {
  return localStorage.getItem(MIGRATED_KEY) === "true";
}

export function markMigrated() {
  localStorage.setItem(MIGRATED_KEY, "true");
}

export async function migrateLocalToSupabase(userId, teamId) {
  if (!supabase) return { error: "Supabase not configured" };

  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { error: "No local data" };
    const data = JSON.parse(raw);

    // Insert buildings
    if (data.buildings?.length) {
      const rows = data.buildings.map((b) => ({ ...toSnake(b), user_id: userId, team_id: teamId }));
      const { error } = await supabase.from("buildings").upsert(rows, { onConflict: "id" });
      if (error) throw error;
    }

    // Insert units
    if (data.units?.length) {
      const rows = data.units.map((u) => ({ ...toSnake(u), user_id: userId, team_id: teamId }));
      const { error } = await supabase.from("units").upsert(rows, { onConflict: "id" });
      if (error) throw error;
    }

    // Insert tenants
    if (data.tenants?.length) {
      const rows = data.tenants.map((t) => ({ ...toSnake(t), user_id: userId, team_id: teamId }));
      const { error } = await supabase.from("tenants").upsert(rows, { onConflict: "id" });
      if (error) throw error;
    }

    // Insert payments
    if (data.payments?.length) {
      const rows = data.payments.map((p) => ({ ...toSnake(p), user_id: userId, team_id: teamId }));
      const { error } = await supabase.from("payments").upsert(rows, { onConflict: "id" });
      if (error) throw error;
    }

    // Insert settings
    if (data.settings) {
      const { error } = await supabase.from("user_settings").upsert({
        user_id: userId,
        team_id: teamId,
        due_day: data.settings.dueDay || 5,
      }, { onConflict: "user_id" });
      if (error) throw error;
    }

    markMigrated();
    return { success: true };
  } catch (e) {
    console.error("Migration failed:", e);
    return { error: e.message || "Migration failed" };
  }
}
