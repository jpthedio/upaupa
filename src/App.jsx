import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Home,
  Users,
  CreditCard,
  LayoutDashboard,
  Plus,
  X,
  ChevronRight,
  ArrowLeft,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Phone,
  Calendar,
  DollarSign,
  Download,
  Search,
  ChevronDown,
  Settings,
  LayoutGrid,
  List,
  Table2,
  RotateCcw,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────
const uid = () => crypto.randomUUID();
const peso = (n) =>
  `₱${Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—";
const monthLabel = (m) =>
  new Date(m.slice(0, 7) + "-15").toLocaleDateString("en-PH", { month: "long", year: "numeric" });
const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

const STATUS_COLORS = {
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  late: "bg-red-100 text-red-700 border-red-200",
  unpaid: "bg-zinc-100 text-zinc-500 border-zinc-200",
  occupied: "bg-emerald-100 text-emerald-700 border-emerald-200",
  vacant: "bg-zinc-100 text-zinc-500 border-zinc-200",
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  moved_out: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

const METHOD_LABELS = {
  gcash: "GCash",
  bank_transfer: "Bank Transfer",
  cash: "Cash",
  check: "Check",
  other: "Other",
};

// ─── Storage layer ───────────────────────────────────────
const STORE_KEY = "upaupa-data";

function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Save failed:", e);
  }
}

// ─── UI Preferences (persisted separately) ──────────────
const PREFS_KEY = "upaupa-prefs";

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function savePrefs(prefs) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {}
}

function buildSeed() {
  const b1 = uid(), b2 = uid();
  const units1 = Array.from({ length: 6 }, (_, i) => ({
    id: uid(), buildingId: b1, label: `Unit ${i + 1}`, floor: Math.ceil((i + 1) / 3),
    monthlyRent: i < 3 ? 5000 : 6500, status: i === 5 ? "vacant" : "occupied",
  }));
  const units2 = Array.from({ length: 4 }, (_, i) => ({
    id: uid(), buildingId: b2, label: `Room ${String.fromCharCode(65 + i)}`, floor: 1,
    monthlyRent: 4500, status: i === 3 ? "vacant" : "occupied",
  }));
  const allUnits = [...units1, ...units2];
  const occupiedUnits = allUnits.filter((u) => u.status === "occupied");
  const firstNames = ["Maria", "Jose", "Ana", "Pedro", "Rosa", "Carlo", "Liza", "Jun", "Beth"];
  const lastNames = ["Santos", "Reyes", "Cruz", "Garcia", "Lopez", "Ramos", "Torres", "Flores", "Rivera"];
  const tenants = occupiedUnits.map((u, i) => ({
    id: uid(), unitId: u.id, firstName: firstNames[i % firstNames.length],
    lastName: lastNames[i % lastNames.length], phone: `09${Math.floor(100000000 + Math.random() * 900000000)}`,
    email: "", moveInDate: "2024-06-01", leaseEndDate: "2025-12-31",
    emergencyContact: "", status: "active",
  }));
  const cm = currentMonth();
  const statuses = ["paid", "paid", "partial", "late", "paid", "unpaid", "paid", "paid"];
  const methods = ["gcash", "bank_transfer", "cash", "gcash", "gcash", "", "bank_transfer", "cash"];
  const payments = occupiedUnits.map((u, i) => {
    const s = statuses[i % statuses.length];
    const t = tenants.find((t) => t.unitId === u.id);
    return {
      id: uid(), unitId: u.id, tenantId: t?.id || "", month: cm,
      amountDue: u.monthlyRent, amountPaid: s === "paid" ? u.monthlyRent : s === "partial" ? Math.round(u.monthlyRent * 0.6) : 0,
      status: s, method: methods[i % methods.length] || "cash",
      datePaid: s !== "unpaid" ? `2026-03-0${Math.min(i + 3, 9)}` : "",
      receiptUrl: "", notes: s === "late" ? "Promised to pay by 15th" : "",
    };
  });
  return {
    buildings: [
      { id: b1, name: "Building A", address: "123 Main St, Las Piñas", totalUnits: 6 },
      { id: b2, name: "Building B", address: "45 Side St, Las Piñas", totalUnits: 4 },
    ],
    units: allUnits, tenants, payments, settings: { dueDay: 5 },
  };
}

// ─── Reusable UI ─────────────────────────────────────────
function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[status] || "bg-zinc-100 text-zinc-500"}`}>
      {status?.replace("_", " ")}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <Card className="border border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-500 mb-1">{label}</p>
            <p className={`text-2xl font-semibold tracking-tight ${accent || "text-zinc-900"}`}>{value}</p>
            {sub && <p className="text-xs text-zinc-400 mt-1">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-xl ${accent ? "bg-red-50" : "bg-zinc-100"}`}>
            <Icon size={20} className={accent || "text-zinc-500"} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-100 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 rounded-full transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, className }) {
  return (
    <div className={className || ""}>
      <Label className="text-sm text-zinc-600 mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

function EmptyState({ icon: Icon, title, sub, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-2xl bg-zinc-100 mb-4"><Icon size={32} className="text-zinc-400" /></div>
      <p className="text-zinc-700 font-medium mb-1">{title}</p>
      <p className="text-sm text-zinc-400 mb-4 max-w-xs">{sub}</p>
      {action && <Button onClick={onAction} size="sm" className="rounded-full bg-zinc-900 hover:bg-zinc-800"><Plus size={14} className="mr-1" />{action}</Button>}
    </div>
  );
}

function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-zinc-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-full">Cancel</Button>
          <Button onClick={onConfirm} className="rounded-full bg-red-600 hover:bg-red-700 text-white">Delete</Button>
        </div>
      </div>
    </div>
  );
}

// ─── CSV Export ───────────────────────────────────────────
function exportCSV(data, month) {
  const label = monthLabel(month);
  const rows = [["Building", "Unit", "Tenant", "Due", "Paid", "Status", "Method", "Date Paid", "Notes"]];
  data.payments.filter((p) => p.month === month).forEach((p) => {
    const unit = data.units.find((u) => u.id === p.unitId);
    const building = data.buildings.find((b) => b.id === unit?.buildingId);
    const tenant = data.tenants.find((t) => t.id === p.tenantId);
    rows.push([
      building?.name || "", unit?.label || "", tenant ? `${tenant.firstName} ${tenant.lastName}` : "",
      p.amountDue, p.amountPaid, p.status, METHOD_LABELS[p.method] || p.method,
      p.datePaid || "", `"${(p.notes || "").replace(/"/g, '""')}"`,
    ]);
  });
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `UpaUpa-${label.replace(/\s/g, "-")}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ═════════════════════════════════════════════════════════
//  MAIN APP
// ═════════════════════════════════════════════════════════
export default function UpaUpa() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [prefs, setPrefs] = useState(() => loadPrefs());

  // Load
  useEffect(() => {
    let d = loadData();
    if (!d) { d = buildSeed(); saveData(d); }
    setData(d);
    setLoading(false);
  }, []);

  // Save on change
  const update = useCallback((fn) => {
    setData((prev) => {
      const next = fn(prev);
      saveData(next);
      return next;
    });
  }, []);

  // Month options
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

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading UpaUpa...</p>
        </div>
      </div>
    );
  }

  // ─── Computed ────────────────────────────────────────────
  const monthPayments = data.payments.filter((p) => p.month === selectedMonth);
  const totalDue = monthPayments.reduce((s, p) => s + p.amountDue, 0);
  const totalPaid = monthPayments.reduce((s, p) => s + p.amountPaid, 0);
  const overdueCount = monthPayments.filter((p) => p.status === "late" || p.status === "unpaid").length;
  const occupiedCount = data.units.filter((u) => u.status === "occupied").length;
  const vacantCount = data.units.filter((u) => u.status === "vacant").length;
  const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

  // ─── CRUD helpers ────────────────────────────────────────
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

  // ─── Nav items ───────────────────────────────────────────
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "buildings", label: "Buildings", icon: Building2 },
    { id: "tenants", label: "Tenants", icon: Users },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  function navigate(p) { setPage(p); setSelectedBuilding(null); setSearch(""); }

  // ─── Forms ────────────────────────────────────────────
  function BuildingForm({ initial, onSave }) {
    const [f, setF] = useState(initial || { name: "", address: "", totalUnits: "" });
    return (
      <div className="space-y-4">
        <Field label="Building Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g., Building A" /></Field>
        <Field label="Address"><Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="123 Main St, Las Piñas" /></Field>
        <Field label="Total Units"><Input type="number" value={f.totalUnits} onChange={(e) => setF({ ...f, totalUnits: Number(e.target.value) })} /></Field>
        <Button onClick={() => { if (f.name) { onSave(f); setModal(null); } }} className="w-full rounded-full bg-zinc-900 hover:bg-zinc-800" disabled={!f.name}>
          {initial ? "Save Changes" : "Add Building"}
        </Button>
      </div>
    );
  }

  function UnitForm({ initial, buildingId, onSave }) {
    const [f, setF] = useState(initial || { label: "", floor: "", monthlyRent: "", status: "vacant", buildingId });
    return (
      <div className="space-y-4">
        <Field label="Unit Label"><Input value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} placeholder="e.g., Unit 3A" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Floor"><Input type="number" value={f.floor} onChange={(e) => setF({ ...f, floor: Number(e.target.value) })} /></Field>
          <Field label="Monthly Rent (₱)"><Input type="number" value={f.monthlyRent} onChange={(e) => setF({ ...f, monthlyRent: Number(e.target.value) })} /></Field>
        </div>
        <Field label="Status">
          <Select value={f.status} onValueChange={(v) => setF({ ...f, status: v })}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="occupied">Occupied</SelectItem><SelectItem value="vacant">Vacant</SelectItem></SelectContent>
          </Select>
        </Field>
        <Button onClick={() => { if (f.label && f.monthlyRent) { onSave(f); setModal(null); } }} className="w-full rounded-full bg-zinc-900 hover:bg-zinc-800" disabled={!f.label}>
          {initial ? "Save Changes" : "Add Unit"}
        </Button>
      </div>
    );
  }

  function TenantForm({ initial, onSave }) {
    const vacantUnits = data.units.filter((u) => u.status === "vacant" || u.id === initial?.unitId);
    const [f, setF] = useState(initial || { firstName: "", lastName: "", phone: "", email: "", unitId: vacantUnits[0]?.id || "", moveInDate: new Date().toISOString().split("T")[0], leaseEndDate: "", emergencyContact: "" });
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name"><Input value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} /></Field>
          <Field label="Last Name"><Input value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} /></Field>
        </div>
        <Field label="Unit">
          <Select value={f.unitId} onValueChange={(v) => setF({ ...f, unitId: v })}>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select unit" /></SelectTrigger>
            <SelectContent>
              {vacantUnits.map((u) => {
                const b = data.buildings.find((b) => b.id === u.buildingId);
                return <SelectItem key={u.id} value={u.id}>{b?.name} → {u.label}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Phone"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="09XX XXX XXXX" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Move-in Date"><Input type="date" value={f.moveInDate} onChange={(e) => setF({ ...f, moveInDate: e.target.value })} /></Field>
          <Field label="Lease End"><Input type="date" value={f.leaseEndDate} onChange={(e) => setF({ ...f, leaseEndDate: e.target.value })} /></Field>
        </div>
        <Button onClick={() => { if (f.firstName && f.unitId) { onSave(f); setModal(null); } }} className="w-full rounded-full bg-zinc-900 hover:bg-zinc-800" disabled={!f.firstName || !f.unitId}>
          {initial ? "Save Changes" : "Add Tenant"}
        </Button>
      </div>
    );
  }

  function PaymentForm({ initial, onSave }) {
    const occupiedUnits = data.units.filter((u) => u.status === "occupied");
    const defaultUnit = initial?.unitId || occupiedUnits[0]?.id || "";
    const defUnit = data.units.find((u) => u.id === defaultUnit);
    const defTenant = data.tenants.find((t) => t.unitId === defaultUnit && t.status === "active");
    const [f, setF] = useState(initial || {
      unitId: defaultUnit, tenantId: defTenant?.id || "", month: selectedMonth,
      amountDue: defUnit?.monthlyRent || 0, amountPaid: 0, status: "unpaid",
      method: "gcash", datePaid: "", notes: "",
    });

    function handleUnitChange(unitId) {
      const unit = data.units.find((u) => u.id === unitId);
      const tenant = data.tenants.find((t) => t.unitId === unitId && t.status === "active");
      setF((p) => ({ ...p, unitId, tenantId: tenant?.id || "", amountDue: unit?.monthlyRent || p.amountDue }));
    }

    function autoStatus(paid, due) {
      if (paid >= due && paid > 0) return "paid";
      if (paid > 0 && paid < due) return "partial";
      return "unpaid";
    }

    return (
      <div className="space-y-4">
        <Field label="Unit">
          <Select value={f.unitId} onValueChange={handleUnitChange}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              {occupiedUnits.map((u) => {
                const b = data.buildings.find((b) => b.id === u.buildingId);
                const t = data.tenants.find((t) => t.unitId === u.id && t.status === "active");
                return <SelectItem key={u.id} value={u.id}>{b?.name} → {u.label}{t ? ` (${t.firstName})` : ""}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Month">
          <Select value={f.month} onValueChange={(v) => setF({ ...f, month: v })}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{months.map((m) => <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount Due (₱)"><Input type="number" value={f.amountDue} onChange={(e) => setF({ ...f, amountDue: Number(e.target.value) })} /></Field>
          <Field label="Amount Paid (₱)"><Input type="number" value={f.amountPaid} onChange={(e) => {
            const paid = Number(e.target.value);
            setF({ ...f, amountPaid: paid, status: autoStatus(paid, f.amountDue) });
          }} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <Select value={f.status} onValueChange={(v) => setF({ ...f, status: v })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem><SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="late">Late</SelectItem><SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Method">
            <Select value={f.method} onValueChange={(v) => setF({ ...f, method: v })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(METHOD_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Date Paid"><Input type="date" value={f.datePaid} onChange={(e) => setF({ ...f, datePaid: e.target.value })} /></Field>
        <Field label="Notes"><Input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Optional notes..." /></Field>
        <Button onClick={() => { onSave(f); setModal(null); }} className="w-full rounded-full bg-zinc-900 hover:bg-zinc-800">
          {initial ? "Update Payment" : "Record Payment"}
        </Button>
      </div>
    );
  }

  // ─── Pages ────────────────────────────────────────────
  function DashboardPage() {
    const overdue = monthPayments.filter((p) => p.status === "late" || p.status === "unpaid").map((p) => {
      const unit = data.units.find((u) => u.id === p.unitId);
      const building = data.buildings.find((b) => b.id === unit?.buildingId);
      const tenant = data.tenants.find((t) => t.id === p.tenantId);
      return { ...p, unit, building, tenant };
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-0.5">{monthLabel(selectedMonth)} overview</p>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{months.map((m) => <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={TrendingUp} label="Collected" value={peso(totalPaid)} sub={`${collectionRate}% of ${peso(totalDue)}`} />
          <StatCard icon={AlertCircle} label="Overdue" value={overdueCount} sub={overdueCount > 0 ? `${peso(totalDue - totalPaid)} outstanding` : "All good!"} accent={overdueCount > 0 ? "text-red-600" : undefined} />
          <StatCard icon={Home} label="Occupied" value={`${occupiedCount}/${data.units.length}`} sub={`${vacantCount} vacant`} />
          <StatCard icon={Users} label="Tenants" value={data.tenants.filter((t) => t.status === "active").length} />
        </div>

        {/* Collection bar */}
        <Card className="border border-zinc-200/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-zinc-700">Collection Progress</span>
              <span className="text-sm text-zinc-500">{peso(totalPaid)} / {peso(totalDue)}</span>
            </div>
            <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${collectionRate}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* Overdue list */}
        {overdue.length > 0 && (
          <Card className="border border-red-100 shadow-sm">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-base font-semibold text-red-700 flex items-center gap-2">
                <AlertCircle size={16} /> Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2">
              {overdue.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 hover:bg-red-50 transition-colors cursor-pointer" onClick={() => { setModal({ type: "editPayment", data: p }); }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white border border-red-200 flex items-center justify-center text-sm font-medium text-red-600">
                      {p.tenant?.firstName?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-800">
                        {p.tenant ? `${p.tenant.firstName} ${p.tenant.lastName}` : "Unknown"}
                      </p>
                      <p className="text-xs text-zinc-500">{p.building?.name} → {p.unit?.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusPill status={p.status} />
                    <p className="text-xs text-zinc-500 mt-1">{peso(p.amountDue - p.amountPaid)} due</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {overdue.length === 0 && monthPayments.length > 0 && (
          <Card className="border border-emerald-100 shadow-sm">
            <CardContent className="p-6 flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-500" />
              <div>
                <p className="font-medium text-emerald-700">All caught up!</p>
                <p className="text-sm text-emerald-600/70">No overdue payments this month.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  function BuildingsPage() {
    if (selectedBuilding) {
      const building = data.buildings.find((b) => b.id === selectedBuilding);
      const units = data.units.filter((u) => u.buildingId === selectedBuilding);
      if (!building) { setSelectedBuilding(null); return null; }
      return (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedBuilding(null)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"><ArrowLeft size={18} /></button>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{building.name}</h1>
              <p className="text-sm text-zinc-500">{building.address}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">{units.length} units</p>
            <Button onClick={() => setModal({ type: "addUnit", buildingId: selectedBuilding })} size="sm" className="rounded-full bg-zinc-900 hover:bg-zinc-800"><Plus size={14} className="mr-1" /> Add Unit</Button>
          </div>
          {units.length === 0 ? (
            <EmptyState icon={Home} title="No units yet" sub="Add your first unit to this building" action="Add Unit" onAction={() => setModal({ type: "addUnit", buildingId: selectedBuilding })} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {units.map((u) => {
                const tenant = data.tenants.find((t) => t.unitId === u.id && t.status === "active");
                const payment = monthPayments.find((p) => p.unitId === u.id);
                return (
                  <Card key={u.id} className="border border-zinc-200/80 shadow-sm hover:shadow-md transition-all group">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-zinc-900">{u.label}</p>
                          {u.floor && <p className="text-xs text-zinc-400">Floor {u.floor}</p>}
                        </div>
                        <StatusPill status={u.status} />
                      </div>
                      <p className="text-lg font-semibold text-zinc-900 mb-2">{peso(u.monthlyRent)}<span className="text-xs font-normal text-zinc-400">/mo</span></p>
                      {tenant ? (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-medium">{tenant.firstName[0]}</div>
                          <span className="text-sm text-zinc-600">{tenant.firstName} {tenant.lastName}</span>
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-400 mb-3">No tenant</p>
                      )}
                      {payment && <StatusPill status={payment.status} />}
                      <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => setModal({ type: "editUnit", data: u })} className="rounded-full h-8 px-3"><Edit2 size={12} className="mr-1" /> Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirm({ msg: `Delete ${u.label}? This removes the unit, tenant, and all payments.`, fn: () => deleteUnit(u.id) })} className="rounded-full h-8 px-3 text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 size={12} /></Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Buildings</h1>
          <Button onClick={() => setModal({ type: "addBuilding" })} size="sm" className="rounded-full bg-zinc-900 hover:bg-zinc-800"><Plus size={14} className="mr-1" /> Add Building</Button>
        </div>
        {data.buildings.length === 0 ? (
          <EmptyState icon={Building2} title="No buildings yet" sub="Add your first building to get started" action="Add Building" onAction={() => setModal({ type: "addBuilding" })} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.buildings.map((b) => {
              const units = data.units.filter((u) => u.buildingId === b.id);
              const occ = units.filter((u) => u.status === "occupied").length;
              const bPayments = monthPayments.filter((p) => units.some((u) => u.id === p.unitId));
              const bDue = bPayments.reduce((s, p) => s + p.amountDue, 0);
              const bPaid = bPayments.reduce((s, p) => s + p.amountPaid, 0);
              return (
                <Card key={b.id} className="border border-zinc-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedBuilding(b.id)}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900">{b.name}</h3>
                        <p className="text-sm text-zinc-500">{b.address}</p>
                      </div>
                      <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-500 transition-colors mt-1" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div><p className="text-xs text-zinc-400">Units</p><p className="font-semibold">{units.length}</p></div>
                      <div><p className="text-xs text-zinc-400">Occupied</p><p className="font-semibold">{occ}/{units.length}</p></div>
                      <div><p className="text-xs text-zinc-400">Collected</p><p className="font-semibold text-emerald-600">{bDue > 0 ? Math.round((bPaid / bDue) * 100) : 0}%</p></div>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${bDue > 0 ? (bPaid / bDue) * 100 : 0}%` }} />
                    </div>
                    <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => setModal({ type: "editBuilding", data: b })} className="rounded-full h-8 px-3"><Edit2 size={12} className="mr-1" /> Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirm({ msg: `Delete ${b.name}? This removes all units, tenants, and payments in this building.`, fn: () => deleteBuilding(b.id) })} className="rounded-full h-8 px-3 text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 size={12} /></Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function TenantsPage() {
    const view = prefs.tenantsView || "card";
    const filtered = data.tenants.filter((t) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) || t.phone?.includes(q);
    });

    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Tenants</h1>
          <Button onClick={() => setModal({ type: "addTenant" })} size="sm" className="rounded-full bg-zinc-900 hover:bg-zinc-800"><Plus size={14} className="mr-1" /> Add Tenant</Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tenants..." className="pl-9 rounded-xl" />
          </div>
          <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg shrink-0">
            <button onClick={() => updatePrefs("tenantsView", "card")} className={`p-1.5 rounded-md transition-colors ${view === "card" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}><LayoutGrid size={16} /></button>
            <button onClick={() => updatePrefs("tenantsView", "list")} className={`p-1.5 rounded-md transition-colors ${view === "list" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}><List size={16} /></button>
          </div>
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title={search ? "No matches" : "No tenants yet"} sub={search ? "Try a different search" : "Add a tenant and link them to a unit"} action={!search ? "Add Tenant" : undefined} onAction={() => setModal({ type: "addTenant" })} />
        ) : view === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((t) => {
              const unit = data.units.find((u) => u.id === t.unitId);
              const building = data.buildings.find((b) => b.id === unit?.buildingId);
              const payment = monthPayments.find((p) => p.tenantId === t.id);
              return (
                <Card key={t.id} className="border border-zinc-200/80 shadow-sm hover:shadow-md transition-all group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-semibold text-zinc-600 shrink-0">
                        {t.firstName[0]}{t.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 truncate">{t.firstName} {t.lastName}</p>
                        <p className="text-xs text-zinc-500">{building?.name} → {unit?.label || "Unlinked"}</p>
                      </div>
                      <StatusPill status={t.status} />
                    </div>
                    {t.phone && <p className="text-sm text-zinc-500 flex items-center gap-1.5 mb-1"><Phone size={12} />{t.phone}</p>}
                    {t.leaseEndDate && <p className="text-sm text-zinc-500 flex items-center gap-1.5 mb-2"><Calendar size={12} />Lease ends {fmtDate(t.leaseEndDate)}</p>}
                    {payment && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                        <span className="text-xs text-zinc-400">This month</span>
                        <StatusPill status={payment.status} />
                      </div>
                    )}
                    <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" onClick={() => setModal({ type: "editTenant", data: t })} className="rounded-full h-8 px-3"><Edit2 size={12} className="mr-1" /> Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirm({ msg: `Remove ${t.firstName} ${t.lastName}? This also removes their payment history.`, fn: () => deleteTenant(t.id) })} className="rounded-full h-8 px-3 text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 size={12} /></Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((t) => {
              const unit = data.units.find((u) => u.id === t.unitId);
              const building = data.buildings.find((b) => b.id === unit?.buildingId);
              const payment = monthPayments.find((p) => p.tenantId === t.id);
              return (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-zinc-200/80 hover:shadow-sm transition-all group">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-semibold text-zinc-600 shrink-0">{t.firstName[0]}{t.lastName?.[0]}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 truncate">{t.firstName} {t.lastName}</p>
                    <p className="text-xs text-zinc-400 truncate">{building?.name} → {unit?.label || "Unlinked"}</p>
                  </div>
                  {t.phone && <p className="text-xs text-zinc-500 hidden sm:block">{t.phone}</p>}
                  <StatusPill status={t.status} />
                  {payment && <StatusPill status={payment.status} />}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => setModal({ type: "editTenant", data: t })} className="p-1.5 hover:bg-zinc-100 rounded-lg"><Edit2 size={14} className="text-zinc-400" /></button>
                    <button onClick={() => setConfirm({ msg: `Remove ${t.firstName} ${t.lastName}? This also removes their payment history.`, fn: () => deleteTenant(t.id) })} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={14} className="text-zinc-400 hover:text-red-500" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function PaymentsPage() {
    const view = prefs.paymentsView || "card";
    const rows = data.units.filter((u) => u.status === "occupied").map((u) => {
      const building = data.buildings.find((b) => b.id === u.buildingId);
      const tenant = data.tenants.find((t) => t.unitId === u.id && t.status === "active");
      const payment = data.payments.find((p) => p.unitId === u.id && p.month === selectedMonth);
      return { unit: u, building, tenant, payment };
    }).filter((r) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return r.tenant && `${r.tenant.firstName} ${r.tenant.lastName}`.toLowerCase().includes(q) || r.unit.label.toLowerCase().includes(q) || r.building?.name?.toLowerCase().includes(q);
    });
    const openPayment = (r) => setModal({ type: r.payment ? "editPayment" : "addPayment", data: r.payment || { unitId: r.unit.id, tenantId: r.tenant?.id || "", month: selectedMonth, amountDue: r.unit.monthlyRent, amountPaid: 0, status: "unpaid", method: "gcash", datePaid: "", notes: "" } });

    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Payments</h1>
            <p className="text-sm text-zinc-500 mt-0.5">{monthLabel(selectedMonth)}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-44 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{months.map((m) => <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={() => setModal({ type: "addPayment" })} size="sm" className="rounded-full bg-zinc-900 hover:bg-zinc-800"><Plus size={14} className="mr-1" /> Record</Button>
            <Button variant="outline" size="sm" onClick={() => exportCSV(data, selectedMonth)} className="rounded-full"><Download size={14} className="mr-1" /> CSV</Button>
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border border-zinc-200/80 shadow-sm"><CardContent className="p-4 text-center"><p className="text-xs text-zinc-400">Expected</p><p className="text-lg font-semibold">{peso(totalDue)}</p></CardContent></Card>
          <Card className="border border-emerald-100 shadow-sm"><CardContent className="p-4 text-center"><p className="text-xs text-emerald-600">Collected</p><p className="text-lg font-semibold text-emerald-600">{peso(totalPaid)}</p></CardContent></Card>
          <Card className="border border-red-100 shadow-sm"><CardContent className="p-4 text-center"><p className="text-xs text-red-500">Outstanding</p><p className="text-lg font-semibold text-red-600">{peso(totalDue - totalPaid)}</p></CardContent></Card>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search units or tenants..." className="pl-9 rounded-xl" />
          </div>
          <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg shrink-0">
            <button onClick={() => updatePrefs("paymentsView", "card")} className={`p-1.5 rounded-md transition-colors ${view === "card" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}><LayoutGrid size={16} /></button>
            <button onClick={() => updatePrefs("paymentsView", "table")} className={`p-1.5 rounded-md transition-colors ${view === "table" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}><Table2 size={16} /></button>
          </div>
        </div>

        {/* Ledger */}
        {rows.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments to show" sub="Record a payment or check a different month" />
        ) : view === "card" ? (
          <div className="space-y-2">
            {rows.map((r) => (
              <Card key={r.unit.id} className="border border-zinc-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => openPayment(r)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold ${r.payment?.status === "paid" ? "bg-emerald-100 text-emerald-700" : r.payment?.status === "partial" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                        {r.payment?.status === "paid" ? <CheckCircle2 size={18} /> : r.payment?.status === "partial" ? <Clock size={18} /> : <AlertCircle size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{r.building?.name} → {r.unit.label}</p>
                        <p className="text-xs text-zinc-500">
                          {r.tenant ? `${r.tenant.firstName} ${r.tenant.lastName}` : "No tenant"}
                          {r.payment?.method ? ` · ${METHOD_LABELS[r.payment.method]}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-zinc-900">{peso(r.payment?.amountPaid || 0)} <span className="text-xs font-normal text-zinc-400">/ {peso(r.unit.monthlyRent)}</span></p>
                      <StatusPill status={r.payment?.status || "unpaid"} />
                    </div>
                  </div>
                  {r.payment?.notes && <p className="text-xs text-zinc-400 mt-2 pl-13 italic">"{r.payment.notes}"</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200/80 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Building / Unit</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Tenant</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Due</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Paid</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Method</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.unit.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 cursor-pointer transition-colors" onClick={() => openPayment(r)}>
                    <td className="px-4 py-2.5"><StatusPill status={r.payment?.status || "unpaid"} /></td>
                    <td className="px-4 py-2.5 text-zinc-900 font-medium whitespace-nowrap">{r.building?.name} → {r.unit.label}</td>
                    <td className="px-4 py-2.5 text-zinc-600 whitespace-nowrap">{r.tenant ? `${r.tenant.firstName} ${r.tenant.lastName}` : "—"}</td>
                    <td className="px-4 py-2.5 text-right text-zinc-900">{peso(r.unit.monthlyRent)}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-zinc-900">{peso(r.payment?.amountPaid || 0)}</td>
                    <td className="px-4 py-2.5 text-zinc-500 whitespace-nowrap">{r.payment?.method ? METHOD_LABELS[r.payment.method] : "—"}</td>
                    <td className="px-4 py-2.5 text-zinc-500 whitespace-nowrap">{r.payment?.datePaid ? fmtDate(r.payment.datePaid) : "—"}</td>
                    <td className="px-4 py-2.5 text-zinc-400 text-xs italic max-w-32 truncate">{r.payment?.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  function SettingsPage() {
    const dueDayOptions = Array.from({ length: 28 }, (_, i) => i + 1);
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Settings</h1>

        {/* Rent Settings */}
        <Card className="border border-zinc-200/80 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900">Rent Settings</h3>
            <Field label="Due Day (day of month)">
              <Select value={String(data.settings.dueDay)} onValueChange={(v) => update((d) => ({ ...d, settings: { ...d.settings, dueDay: Number(v) } }))}>
                <SelectTrigger className="w-32 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{dueDayOptions.map((d) => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="border border-zinc-200/80 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900">About UpaUpa</h3>
            <p className="text-xs text-zinc-400">Version 1.0 · Phase 1 MVP</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {[
                { label: "Buildings", value: data.buildings.length },
                { label: "Units", value: data.units.length },
                { label: "Tenants", value: data.tenants.filter((t) => t.status === "active").length },
                { label: "Payments", value: data.payments.length },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 bg-zinc-50 rounded-xl">
                  <p className="text-lg font-semibold text-zinc-900">{s.value}</p>
                  <p className="text-xs text-zinc-400">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border border-zinc-200/80 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900">Data Management</h3>
            <p className="text-xs text-zinc-400">Reset all data to demo defaults. This cannot be undone.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirm({ msg: "Reset all data to demo defaults? All your current data will be lost.", fn: () => { const seed = buildSeed(); saveData(seed); setData(seed); } })}
              className="rounded-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <RotateCcw size={14} className="mr-1" /> Reset to Demo Data
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Layout ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f7f4] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 3px; }
      `}</style>

      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-zinc-200/60 px-4 py-3">
        <span className="text-lg font-bold tracking-tight">🏠 UpaUpa</span>
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-white border-r border-zinc-200/60 p-5 sticky top-0">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-xl font-bold tracking-tight">🏠 UpaUpa</span>
          </div>
          <nav className="space-y-1 flex-1">
            {nav.map((n) => (
              <button key={n.id} onClick={() => navigate(n.id)} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${page === n.id ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100"}`}>
                <n.icon size={18} />{n.label}
              </button>
            ))}
          </nav>
          <Separator className="my-4" />
          <p className="text-[10px] text-zinc-400 text-center">UpaUpa v1.0 · Phase 1 MVP</p>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-5xl">
          {page === "dashboard" && <DashboardPage />}
          {page === "buildings" && <BuildingsPage />}
          {page === "tenants" && <TenantsPage />}
          {page === "payments" && <PaymentsPage />}
          {page === "settings" && <SettingsPage />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200/60" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex justify-around items-center h-16 px-2">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => navigate(n.id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[10px] font-medium transition-colors ${page === n.id ? "text-zinc-900" : "text-zinc-400"}`}
            >
              <n.icon size={20} strokeWidth={page === n.id ? 2.5 : 1.5} />
              <span>{n.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Modals */}
      <Modal open={modal?.type === "addBuilding"} onClose={() => setModal(null)} title="Add Building">
        <BuildingForm onSave={addBuilding} />
      </Modal>
      <Modal open={modal?.type === "editBuilding"} onClose={() => setModal(null)} title="Edit Building">
        {modal?.data && <BuildingForm initial={modal.data} onSave={(b) => editBuilding(modal.data.id, b)} />}
      </Modal>
      <Modal open={modal?.type === "addUnit"} onClose={() => setModal(null)} title="Add Unit">
        <UnitForm buildingId={modal?.buildingId} onSave={addUnit} />
      </Modal>
      <Modal open={modal?.type === "editUnit"} onClose={() => setModal(null)} title="Edit Unit">
        {modal?.data && <UnitForm initial={modal.data} buildingId={modal.data.buildingId} onSave={(u) => { editUnit(modal.data.id, u); }} />}
      </Modal>
      <Modal open={modal?.type === "addTenant"} onClose={() => setModal(null)} title="Add Tenant">
        <TenantForm onSave={addTenant} />
      </Modal>
      <Modal open={modal?.type === "editTenant"} onClose={() => setModal(null)} title="Edit Tenant">
        {modal?.data && <TenantForm initial={modal.data} onSave={(t) => editTenant(modal.data.id, t)} />}
      </Modal>
      <Modal open={modal?.type === "addPayment"} onClose={() => setModal(null)} title="Record Payment">
        <PaymentForm initial={modal?.data || undefined} onSave={upsertPayment} />
      </Modal>
      <Modal open={modal?.type === "editPayment"} onClose={() => setModal(null)} title="Update Payment">
        {modal?.data && <PaymentForm initial={modal.data} onSave={upsertPayment} />}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => { confirm?.fn(); setConfirm(null); }}
        title="Are you sure?"
        message={confirm?.msg || "This action cannot be undone."}
      />
    </div>
  );
}
