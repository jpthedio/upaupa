import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { LayoutDashboard, Building2, Users, CreditCard, Settings } from "lucide-react";
import { uid, currentMonth } from "@/lib/helpers";
import { loadData, saveData, loadPrefs, savePrefs } from "@/lib/storage";
import { buildSeed } from "@/lib/seed";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [prefs, setPrefs] = useState(() => loadPrefs());

  useEffect(() => {
    let d = loadData();
    if (!d) { d = buildSeed(); saveData(d); }
    setData(d);
    setLoading(false);
  }, []);

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

  // ─── CRUD ──────────────────────────────────────────────
  function addBuilding(b) {
    update((d) => ({ ...d, buildings: [...d.buildings, { ...b, id: uid() }] }));
  }
  function editBuilding(id, b) {
    update((d) => ({ ...d, buildings: d.buildings.map((x) => (x.id === id ? { ...x, ...b } : x)) }));
  }
  function deleteBuilding(id) {
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
  }
  function addUnit(u) {
    update((d) => ({ ...d, units: [...d.units, { ...u, id: uid() }] }));
  }
  function editUnit(id, u) {
    update((d) => ({ ...d, units: d.units.map((x) => (x.id === id ? { ...x, ...u } : x)) }));
  }
  function deleteUnit(id) {
    update((d) => ({
      ...d, units: d.units.filter((u) => u.id !== id),
      tenants: d.tenants.filter((t) => t.unitId !== id),
      payments: d.payments.filter((p) => p.unitId !== id),
    }));
  }
  function addTenant(t) {
    const tenantId = uid();
    update((d) => ({
      ...d, tenants: [...d.tenants, { ...t, id: tenantId, status: "active" }],
      units: d.units.map((u) => (u.id === t.unitId ? { ...u, status: "occupied" } : u)),
    }));
  }
  function editTenant(id, t) {
    update((d) => ({ ...d, tenants: d.tenants.map((x) => (x.id === id ? { ...x, ...t } : x)) }));
  }
  function deleteTenant(id) {
    update((d) => {
      const tenant = d.tenants.find((t) => t.id === id);
      return {
        ...d, tenants: d.tenants.filter((t) => t.id !== id),
        units: d.units.map((u) => (u.id === tenant?.unitId ? { ...u, status: "vacant" } : u)),
        payments: d.payments.filter((p) => p.tenantId !== id),
      };
    });
  }
  function upsertPayment(p) {
    update((d) => {
      const exists = d.payments.find((x) => x.unitId === p.unitId && x.month === p.month);
      if (exists) {
        return { ...d, payments: d.payments.map((x) => (x.id === exists.id ? { ...exists, ...p } : x)) };
      }
      return { ...d, payments: [...d.payments, { ...p, id: uid() }] };
    });
  }

  // ─── Nav ───────────────────────────────────────────────
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "buildings", label: "Buildings", icon: Building2 },
    { id: "tenants", label: "Tenants", icon: Users },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  function navigate(p) { setPage(p); setSelectedBuilding(null); setSearch(""); }

  // ─── Computed (guarded for pre-load) ───────────────────
  const monthPayments = data ? data.payments.filter((p) => p.month === selectedMonth) : [];
  const totalDue = data ? monthPayments.reduce((s, p) => s + p.amountDue, 0) : 0;
  const totalPaid = data ? monthPayments.reduce((s, p) => s + p.amountPaid, 0) : 0;
  const overdueCount = data ? monthPayments.filter((p) => p.status === "late" || p.status === "unpaid").length : 0;
  const occupiedCount = data ? data.units.filter((u) => u.status === "occupied").length : 0;
  const vacantCount = data ? data.units.filter((u) => u.status === "vacant").length : 0;
  const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

  const value = {
    data, setData, loading, update,
    page, setPage, navigate, nav,
    selectedBuilding, setSelectedBuilding,
    selectedMonth, setSelectedMonth, months,
    modal, setModal, confirm, setConfirm,
    search, setSearch,
    prefs, updatePrefs,
    monthPayments, totalDue, totalPaid, overdueCount, occupiedCount, vacantCount, collectionRate,
    addBuilding, editBuilding, deleteBuilding,
    addUnit, editUnit, deleteUnit,
    addTenant, editTenant, deleteTenant,
    upsertPayment,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
