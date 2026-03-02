import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { LayoutDashboard, Building2, Users, CreditCard, BarChart3, Settings } from "lucide-react";
import { uid, currentMonth } from "@/lib/helpers";
import {
  loadData, saveData, loadPrefs, savePrefs,
  fetchAllData, dbInsert, dbUpdate, dbDelete, dbUpsertPayment, dbUpsertSettings,
} from "@/lib/storage";
import { emptyData } from "@/lib/seed";

const AppContext = createContext(null);

export function AppProvider({ children, user, team }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [prefs, setPrefs] = useState(() => loadPrefs());

  const teamId = team?.teamId;
  const role = team?.role || "owner";
  const isAdmin = team?.isAdmin || false;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      // Try Supabase first if authenticated with a team
      if (user && teamId) {
        const cloud = await fetchAllData(teamId);
        if (!cancelled && cloud) {
          setData(cloud);
          saveData(cloud); // cache locally
          setLoading(false);
          return;
        }
      }
      // Fall back to localStorage
      let d = loadData();
      if (!d) { d = emptyData(); saveData(d); }
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user, teamId]);

  const update = useCallback((fn) => {
    setData((prev) => {
      const next = fn(prev);
      saveData(next);
      return next;
    });
  }, []);

  const months = useMemo(() => {
    const m = [];
    for (let i = -2; i <= 2; i++) {
      const d = new Date(); d.setMonth(d.getMonth() + i);
      m.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`);
    }
    return m;
  }, []);

  const updatePrefs = useCallback((key, value) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      savePrefs(next);
      return next;
    });
  }, []);

  // ─── CRUD (optimistic local + background Supabase sync) ───
  function addBuilding(b) {
    const record = { ...b, id: uid() };
    update((d) => ({ ...d, buildings: [...d.buildings, record] }));
    if (user && teamId) dbInsert("buildings", record, user.id, teamId);
  }
  function editBuilding(id, b) {
    update((d) => ({ ...d, buildings: d.buildings.map((x) => (x.id === id ? { ...x, ...b } : x)) }));
    if (user && teamId) dbUpdate("buildings", id, b, teamId);
  }
  function deleteBuilding(id) {
    if (role !== "owner") return;
    update((d) => {
      const unitIds = d.units.filter((u) => u.buildingId === id).map((u) => u.id);
      return {
        ...d,
        buildings: d.buildings.filter((b) => b.id !== id),
        units: d.units.filter((u) => u.buildingId !== id),
        tenants: d.tenants.filter((t) => !unitIds.includes(t.unitId)),
        payments: d.payments.filter((p) => !unitIds.includes(p.unitId)),
      };
    });
    if (user && teamId) dbDelete("buildings", id, teamId);
  }
  function addUnit(u) {
    const record = { ...u, id: uid() };
    update((d) => ({ ...d, units: [...d.units, record] }));
    if (user && teamId) dbInsert("units", record, user.id, teamId);
  }
  function editUnit(id, u) {
    update((d) => ({ ...d, units: d.units.map((x) => (x.id === id ? { ...x, ...u } : x)) }));
    if (user && teamId) dbUpdate("units", id, u, teamId);
  }
  function deleteUnit(id) {
    if (role !== "owner") return;
    update((d) => ({
      ...d, units: d.units.filter((u) => u.id !== id),
      tenants: d.tenants.filter((t) => t.unitId !== id),
      payments: d.payments.filter((p) => p.unitId !== id),
    }));
    if (user && teamId) dbDelete("units", id, teamId);
  }
  function addTenant(t) {
    const tenantId = uid();
    const record = { ...t, id: tenantId, status: "active" };
    update((d) => ({
      ...d, tenants: [...d.tenants, record],
      units: d.units.map((u) => (u.id === t.unitId ? { ...u, status: "occupied" } : u)),
    }));
    if (user && teamId) {
      dbInsert("tenants", record, user.id, teamId);
      dbUpdate("units", t.unitId, { status: "occupied" }, teamId);
    }
  }
  function editTenant(id, t) {
    update((d) => ({ ...d, tenants: d.tenants.map((x) => (x.id === id ? { ...x, ...t } : x)) }));
    if (user && teamId) dbUpdate("tenants", id, t, teamId);
  }
  function archiveTenant(id) {
    if (role !== "owner") return;
    const tenant = data?.tenants.find((t) => t.id === id);
    const tenantName = tenant ? `${tenant.firstName} ${tenant.lastName}` : "Tenant";
    let unitId;
    update((d) => {
      const t = d.tenants.find((t) => t.id === id);
      unitId = t?.unitId;
      return {
        ...d,
        tenants: d.tenants.map((t) => (t.id === id ? { ...t, status: "archived" } : t)),
        units: d.units.map((u) => (u.id === unitId ? { ...u, status: "vacant" } : u)),
      };
    });
    if (user && teamId) {
      dbUpdate("tenants", id, { status: "archived" }, teamId);
      if (unitId) dbUpdate("units", unitId, { status: "vacant" }, teamId);
    }
    showToast(`${tenantName} archived`, () => unarchiveTenant(id));
  }
  function unarchiveTenant(id) {
    let unitId;
    update((d) => {
      const tenant = d.tenants.find((t) => t.id === id);
      unitId = tenant?.unitId;
      return {
        ...d,
        tenants: d.tenants.map((t) => (t.id === id ? { ...t, status: "active" } : t)),
        units: d.units.map((u) => (u.id === unitId ? { ...u, status: "occupied" } : u)),
      };
    });
    if (user && teamId) {
      dbUpdate("tenants", id, { status: "active" }, teamId);
      if (unitId) dbUpdate("units", unitId, { status: "occupied" }, teamId);
    }
  }
  function showToast(message, undoFn) {
    setToast({ message, undoFn, id: Date.now() });
  }
  function dismissToast() {
    setToast(null);
  }
  function upsertPayment(p) {
    let record;
    update((d) => {
      const exists = d.payments.find((x) => x.unitId === p.unitId && x.month === p.month);
      if (exists) {
        record = { ...exists, ...p };
        return { ...d, payments: d.payments.map((x) => (x.id === exists.id ? record : x)) };
      }
      record = { ...p, id: uid() };
      return { ...d, payments: [...d.payments, record] };
    });
    if (user && teamId && record) dbUpsertPayment(record, user.id, teamId);
  }
  function updateSettings(settings) {
    if (role !== "owner") return;
    update((d) => ({ ...d, settings: { ...d.settings, ...settings } }));
    if (user && teamId) dbUpsertSettings({ ...data?.settings, ...settings }, teamId);
  }

  // ─── Nav ───────────────────────────────────────────────
  const nav = useMemo(() => {
    const items = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "buildings", label: "Buildings", icon: Building2 },
      { id: "tenants", label: "Tenants", icon: Users },
      { id: "payments", label: "Payments", icon: CreditCard },
    ];
    if (isAdmin) items.push({ id: "analytics", label: "Analytics", icon: BarChart3 });
    items.push({ id: "settings", label: "Settings", icon: Settings });
    return items;
  }, [role, isAdmin]);

  function navigate(p) { setPage(p); setSelectedBuilding(null); setSearch(""); }

  // ─── Computed (guarded for pre-load) ───────────────────
  const monthPayments = data ? data.payments.filter((p) => p.month === selectedMonth) : [];
  const totalDue = data ? monthPayments.reduce((s, p) => s + p.amountDue, 0) : 0;
  const totalPaid = data ? monthPayments.reduce((s, p) => s + p.amountPaid, 0) : 0;
  const overdueCount = data ? monthPayments.filter((p) => p.status === "late" || p.status === "unpaid").length : 0;
  const occupiedCount = data ? data.units.filter((u) => u.status === "occupied").length : 0;
  const vacantCount = data ? data.units.filter((u) => u.status === "vacant").length : 0;
  const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

  // ─── Carry-forward balances ─────────────────────────────
  const allTimeOutstanding = useMemo(() => {
    if (!data) return 0;
    return data.payments.reduce((s, p) => s + (p.amountDue - p.amountPaid), 0);
  }, [data]);

  const tenantBalances = useMemo(() => {
    if (!data) return new Map();
    const map = new Map();
    for (const p of data.payments) {
      map.set(p.tenantId, (map.get(p.tenantId) || 0) + (p.amountDue - p.amountPaid));
    }
    return map;
  }, [data]);

  const tenantPrevBalances = useMemo(() => {
    if (!data) return new Map();
    const map = new Map();
    for (const p of data.payments) {
      if (p.month < selectedMonth) {
        map.set(p.tenantId, (map.get(p.tenantId) || 0) + (p.amountDue - p.amountPaid));
      }
    }
    return map;
  }, [data, selectedMonth]);

  // ─── Year stats (trailing 12 months) ────────────────────
  const yearStats = useMemo(() => {
    if (!data) return { months: [], totalDue: 0, totalPaid: 0, rate: 0 };
    const now = new Date();
    const monthsList = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthsList.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`);
    }
    const monthData = monthsList.map((m) => {
      const mp = data.payments.filter((p) => p.month === m);
      const due = mp.reduce((s, p) => s + p.amountDue, 0);
      const paid = mp.reduce((s, p) => s + p.amountPaid, 0);
      return { month: m, due, paid, rate: due > 0 ? Math.round((paid / due) * 100) : 0 };
    });
    const totalDue = monthData.reduce((s, m) => s + m.due, 0);
    const totalPaid = monthData.reduce((s, m) => s + m.paid, 0);
    return { months: monthData, totalDue, totalPaid, rate: totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0 };
  }, [data]);

  const value = {
    data, setData, loading, update, user, team, role, isAdmin,
    page, setPage, navigate, nav,
    selectedBuilding, setSelectedBuilding,
    selectedMonth, setSelectedMonth, months,
    modal, setModal, confirm, setConfirm,
    toast, showToast, dismissToast,
    search, setSearch,
    prefs, updatePrefs,
    monthPayments, totalDue, totalPaid, overdueCount, occupiedCount, vacantCount, collectionRate,
    allTimeOutstanding, tenantBalances, tenantPrevBalances, yearStats,
    addBuilding, editBuilding, deleteBuilding,
    addUnit, editUnit, deleteUnit,
    addTenant, editTenant, archiveTenant, unarchiveTenant,
    upsertPayment, updateSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
