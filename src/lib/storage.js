import { supabase } from "./supabase";
import { toSnake, rowsToCamel } from "./db-mapping";

// ─── localStorage (offline / no-auth mode) ──────────────────
const STORE_KEY = "upaupa-data";
const PREFS_KEY = "upaupa-prefs";

export function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Save failed:", e);
  }
}

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function savePrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

// ─── Supabase (cloud mode) ──────────────────────────────────

export async function fetchAllData(userId) {
  if (!supabase) return null;
  try {
    const [b, u, t, p, s] = await Promise.all([
      supabase.from("buildings").select("*").eq("user_id", userId),
      supabase.from("units").select("*").eq("user_id", userId),
      supabase.from("tenants").select("*").eq("user_id", userId),
      supabase.from("payments").select("*").eq("user_id", userId),
      supabase.from("user_settings").select("*").eq("user_id", userId).single(),
    ]);
    if (b.error) throw b.error;
    if (u.error) throw u.error;
    if (t.error) throw t.error;
    if (p.error) throw p.error;

    return {
      buildings: rowsToCamel(b.data),
      units: rowsToCamel(u.data),
      tenants: rowsToCamel(t.data),
      payments: rowsToCamel(p.data),
      settings: { dueDay: s.data?.due_day ?? 5 },
    };
  } catch (e) {
    console.error("Supabase fetch failed:", e);
    return null;
  }
}

export async function dbInsert(table, record, userId) {
  if (!supabase) return;
  try {
    const row = { ...toSnake(record), user_id: userId };
    const { error } = await supabase.from(table).insert(row);
    if (error) console.error(`dbInsert ${table}:`, error);
  } catch (e) {
    console.error(`dbInsert ${table}:`, e);
  }
}

export async function dbUpdate(table, id, changes, userId) {
  if (!supabase) return;
  try {
    const row = toSnake(changes);
    delete row.id;
    delete row.user_id;
    const { error } = await supabase.from(table).update(row).eq("id", id).eq("user_id", userId);
    if (error) console.error(`dbUpdate ${table}:`, error);
  } catch (e) {
    console.error(`dbUpdate ${table}:`, e);
  }
}

export async function dbDelete(table, id, userId) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from(table).delete().eq("id", id).eq("user_id", userId);
    if (error) console.error(`dbDelete ${table}:`, error);
  } catch (e) {
    console.error(`dbDelete ${table}:`, e);
  }
}

export async function dbUpsertPayment(record, userId) {
  if (!supabase) return;
  try {
    const row = { ...toSnake(record), user_id: userId };
    const { error } = await supabase.from("payments").upsert(row, { onConflict: "id" });
    if (error) console.error("dbUpsertPayment:", error);
  } catch (e) {
    console.error("dbUpsertPayment:", e);
  }
}

export async function dbUpsertSettings(settings, userId) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from("user_settings").upsert({
      user_id: userId,
      due_day: settings.dueDay || 5,
    }, { onConflict: "user_id" });
    if (error) console.error("dbUpsertSettings:", error);
  } catch (e) {
    console.error("dbUpsertSettings:", e);
  }
}
