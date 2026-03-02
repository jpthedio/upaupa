import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search, Phone, Calendar, Edit2, Archive, LayoutGrid, List, CheckCircle2, CircleDollarSign } from "lucide-react";
import { fmtDate, peso } from "@/lib/helpers";
import { StatusPill } from "@/components/shared/StatusPill";
import { EmptyState } from "@/components/shared/EmptyState";
import { QuickPayDialog } from "@/components/forms/QuickPayDialog";
import { BatchPayDialog } from "@/components/forms/BatchPayDialog";
import { useLongPress } from "@/hooks/useLongPress";
import { useApp } from "@/context/AppContext";

// ─── Card sub-component (allows useLongPress per item) ──────────
function TenantCard({ t, unit, building, payment, balance, selectMode, isSelected, canSelect, onToggle, onLongPress, onQuickPay, onEdit, onArchive }) {
  const isPaid = payment?.status === "paid";
  const isPartial = payment?.status === "partial";
  const remaining = (unit?.monthlyRent || 0) - (payment?.amountPaid || 0);
  const isArchived = t.status === "archived";

  const { bind, wasLongPress } = useLongPress(() => {
    if (!selectMode && !isArchived) onLongPress(t.id);
  });

  function handleClick() {
    if (wasLongPress()) return;
    if (canSelect) onToggle(t.id);
  }

  return (
    <Card
      onClick={handleClick}
      {...(!selectMode && !isArchived ? bind : {})}
      className={`border shadow-sm hover:shadow-md transition-all group touch-manipulation ${isArchived ? "opacity-60" : ""} ${isSelected ? "border-emerald-400 ring-2 ring-emerald-100" : "border-zinc-200/80"} ${canSelect ? "cursor-pointer" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          {selectMode && (
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isSelected ? "bg-emerald-500 border-emerald-500" : canSelect ? "border-zinc-300" : "border-zinc-200 bg-zinc-50 opacity-40"}`}>
              {isSelected && <CheckCircle2 size={12} className="text-white" />}
            </div>
          )}
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
        {(payment || balance > 0) && (
          <div className="mt-2 pt-2 border-t border-zinc-100 space-y-1">
            {payment && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">This month</span>
                <StatusPill status={payment.status} />
              </div>
            )}
            {balance > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Total balance</span>
                <span className="text-xs font-medium text-red-600">{peso(balance)}</span>
              </div>
            )}
          </div>
        )}
        {!isArchived && !selectMode && (
          <div className="mt-3 pt-2 border-t border-zinc-100">
            {isPaid ? (
              <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 size={16} />
                <span className="text-xs font-medium">Paid this month</span>
              </div>
            ) : isPartial ? (
              <Button variant="outline" size="sm" onClick={() => onQuickPay(t)} className="w-full rounded-full text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700">
                <CircleDollarSign size={14} className="mr-1" /> Complete Payment ({peso(remaining)})
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => onQuickPay(t)} className="w-full rounded-full text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                <CircleDollarSign size={14} className="mr-1" /> Quick Pay
              </Button>
            )}
          </div>
        )}
        {!selectMode && (
          <div className="flex gap-1 mt-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={() => onEdit(t)} className="rounded-full h-8 px-3"><Edit2 size={12} className="mr-1" /> Edit</Button>
            {!isArchived && (
              <Button variant="ghost" size="sm" onClick={() => onArchive(t)} className="rounded-full h-8 px-3 text-purple-500 hover:text-purple-600 hover:bg-purple-50"><Archive size={12} /></Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Row sub-component (allows useLongPress per item) ────────────
function TenantRow({ t, unit, building, payment, balance, selectMode, isSelected, canSelect, onToggle, onLongPress, onQuickPay, onEdit, onArchive }) {
  const isPaid = payment?.status === "paid";
  const isPartial = payment?.status === "partial";
  const remaining = (unit?.monthlyRent || 0) - (payment?.amountPaid || 0);
  const isArchived = t.status === "archived";

  const { bind, wasLongPress } = useLongPress(() => {
    if (!selectMode && !isArchived) onLongPress(t.id);
  });

  function handleClick() {
    if (wasLongPress()) return;
    if (canSelect) onToggle(t.id);
  }

  return (
    <div
      onClick={handleClick}
      {...(!selectMode && !isArchived ? bind : {})}
      className={`bg-white rounded-lg border hover:shadow-sm transition-all group touch-manipulation ${isArchived ? "opacity-60" : ""} ${isSelected ? "border-emerald-400 ring-2 ring-emerald-100" : "border-zinc-200/80"} ${canSelect ? "cursor-pointer" : ""}`}
    >
      {/* Row 1: Avatar + Name + Tenant Status */}
      <div className="flex items-center gap-3 px-4 py-3">
        {selectMode && (
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-emerald-500 border-emerald-500" : canSelect ? "border-zinc-300" : "border-zinc-200 bg-zinc-50 opacity-40"}`}>
            {isSelected && <CheckCircle2 size={12} className="text-white" />}
          </div>
        )}
        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-semibold text-zinc-600 shrink-0">{t.firstName[0]}{t.lastName?.[0]}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-900 truncate">{t.firstName} {t.lastName}</p>
          <p className="text-xs text-zinc-400 truncate">{building?.name} → {unit?.label || "Unlinked"}</p>
        </div>
        {t.phone && <p className="text-xs text-zinc-500 hidden sm:block">{t.phone}</p>}
        <StatusPill status={t.status} />
        {/* Desktop-only: payment info + actions inline */}
        <div className="hidden sm:contents">
          {payment && <StatusPill status={payment.status} />}
          {balance > 0 && <span className="text-xs font-medium text-red-600 whitespace-nowrap">{peso(balance)}</span>}
          {!isArchived && !selectMode && (
            <>
              {isPaid ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); onQuickPay(t); }}
                  title={isPartial ? `Complete Payment (${peso(remaining)})` : "Quick Pay"}
                  className={`p-1.5 rounded-lg shrink-0 transition-colors ${isPartial ? "hover:bg-amber-50 text-amber-500" : "hover:bg-emerald-50 text-emerald-500"}`}
                >
                  <CircleDollarSign size={16} />
                </button>
              )}
            </>
          )}
          {!selectMode && (
            <div className="flex gap-1 opacity-0 lg:group-hover:opacity-100 transition-opacity shrink-0">
              <button onClick={(e) => { e.stopPropagation(); onEdit(t); }} className="p-1.5 hover:bg-zinc-100 rounded-lg"><Edit2 size={14} className="text-zinc-400" /></button>
              {!isArchived && (
                <button onClick={(e) => { e.stopPropagation(); onArchive(t); }} className="p-1.5 hover:bg-purple-50 rounded-lg"><Archive size={14} className="text-zinc-400 hover:text-purple-500" /></button>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Row 2: Mobile-only — payment status, balance, quick pay, actions */}
      {!selectMode && (
        <div className="flex items-center gap-2 px-4 pb-3 pt-0 pl-[60px] sm:hidden">
          {payment && <StatusPill status={payment.status} />}
          {balance > 0 && <span className="text-xs font-medium text-red-600 whitespace-nowrap">{peso(balance)}</span>}
          <div className="flex-1" />
          {!isArchived && (
            <>
              {isPaid ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); onQuickPay(t); }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${isPartial ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}
                >
                  <CircleDollarSign size={12} /> Pay
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); onEdit(t); }} className="p-1.5 hover:bg-zinc-100 rounded-lg"><Edit2 size={14} className="text-zinc-400" /></button>
              <button onClick={(e) => { e.stopPropagation(); onArchive(t); }} className="p-1.5 hover:bg-purple-50 rounded-lg"><Archive size={14} className="text-zinc-400" /></button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────
export function TenantsPage() {
  const {
    data, monthPayments, selectedMonth, tenantBalances, search, setSearch,
    prefs, updatePrefs, setModal, setConfirm, archiveTenant, upsertPayment, dismissToast,
  } = useApp();

  const view = prefs.tenantsView || "card";
  const [quickPay, setQuickPay] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [quickPayBatch, setQuickPayBatch] = useState(false);

  const filtered = data.tenants.filter((t) => {
    if (!showArchived && t.status === "archived") return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) || t.phone?.includes(q);
  });

  const archivedCount = data.tenants.filter((t) => t.status === "archived").length;

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAll() {
    const selectable = filtered.filter((t) => t.status !== "archived");
    setSelected(new Set(selectable.map((t) => t.id)));
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
  }

  function enterSelectMode(tenantId) {
    dismissToast();
    setSelectMode(true);
    setSelected(new Set([tenantId]));
  }

  function getLastMethod(tenantId) {
    const tenantPayments = data.payments
      .filter((p) => p.tenantId === tenantId && p.method)
      .sort((a, b) => b.month.localeCompare(a.month));
    return tenantPayments[0]?.method || "cash";
  }

  function openQuickPay(tenant) {
    setQuickPay(tenant);
  }

  function handleQuickPayConfirm(paymentObj) {
    upsertPayment(paymentObj);
  }

  function handleEditDetails() {
    if (!quickPay) return;
    const unit = data.units.find((u) => u.id === quickPay.unitId);
    const payment = monthPayments.find((p) => p.tenantId === quickPay.id);
    setQuickPay(null);
    setModal({
      type: "addPayment",
      data: payment || {
        unitId: quickPay.unitId,
        tenantId: quickPay.id,
        month: selectedMonth,
        amountDue: unit?.monthlyRent || 0,
        amountPaid: 0,
        status: "unpaid",
        method: getLastMethod(quickPay.id),
        datePaid: new Date().toISOString().slice(0, 10),
        notes: "",
      },
    });
  }

  function handleBatchConfirm(method, datePaid) {
    for (const tenantId of selected) {
      const tenant = data.tenants.find((t) => t.id === tenantId);
      if (!tenant) continue;
      const unit = data.units.find((u) => u.id === tenant.unitId);
      if (!unit) continue;
      const payment = monthPayments.find((p) => p.tenantId === tenantId);
      if (payment?.status === "paid") continue;
      upsertPayment({
        unitId: unit.id,
        tenantId,
        month: selectedMonth,
        amountDue: unit.monthlyRent,
        amountPaid: unit.monthlyRent,
        status: "paid",
        method,
        datePaid,
        notes: payment?.notes || "",
      });
    }
    exitSelectMode();
  }

  const selectedTenants = [...selected].map((id) => {
    const t = data.tenants.find((x) => x.id === id);
    const unit = data.units.find((u) => u.id === t?.unitId);
    const payment = monthPayments.find((p) => p.tenantId === id);
    return { tenant: t, unit, payment };
  }).filter((x) => x.tenant && x.unit);

  const qpUnit = quickPay ? data.units.find((u) => u.id === quickPay.unitId) : null;
  const qpPayment = quickPay ? monthPayments.find((p) => p.tenantId === quickPay.id) : null;

  const handleEdit = useCallback((t) => setModal({ type: "editTenant", data: t }), [setModal]);
  const handleArchive = useCallback((t) => setConfirm({
    msg: `Archive ${t.firstName} ${t.lastName}? Their payment history will be preserved.`,
    actionLabel: "Archive", variant: "archive",
    fn: () => archiveTenant(t.id),
  }), [setConfirm, archiveTenant]);

  // Shared props builder for card/row sub-components
  function tenantProps(t) {
    const unit = data.units.find((u) => u.id === t.unitId);
    const building = data.buildings.find((b) => b.id === unit?.buildingId);
    const payment = monthPayments.find((p) => p.tenantId === t.id);
    const balance = tenantBalances.get(t.id) || 0;
    const canSelect = selectMode && t.status !== "archived";
    return {
      t, unit, building, payment, balance,
      selectMode, isSelected: selected.has(t.id), canSelect,
      onToggle: toggleSelect, onLongPress: enterSelectMode,
      onQuickPay: openQuickPay, onEdit: handleEdit, onArchive: handleArchive,
    };
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Tenants</h1>
        <div className="flex gap-2">
          {selectMode ? (
            <Button onClick={exitSelectMode} variant="outline" size="sm" className="rounded-full">Cancel</Button>
          ) : (
            <Button onClick={() => { dismissToast(); setSelectMode(true); }} variant="outline" size="sm" className="rounded-full">Select</Button>
          )}
          <Button onClick={() => setModal({ type: "addTenant" })} size="sm" className="rounded-full bg-zinc-900 hover:bg-zinc-800"><Plus size={14} className="mr-1" /> Add Tenant</Button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tenants..." className="pl-9 rounded-xl" />
        </div>
        {archivedCount > 0 && (
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors shrink-0 ${showArchived ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200"}`}
          >
            {showArchived ? "Hide" : "Show"} Archived ({archivedCount})
          </button>
        )}
        <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg shrink-0">
          <button onClick={() => updatePrefs("tenantsView", "card")} className={`p-1.5 rounded-md transition-colors ${view === "card" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}><LayoutGrid size={16} /></button>
          <button onClick={() => updatePrefs("tenantsView", "list")} className={`p-1.5 rounded-md transition-colors ${view === "list" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}><List size={16} /></button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title={search ? "No matches" : "No tenants yet"} sub={search ? "Try a different search" : "Add a tenant and link them to a unit"} action={!search ? "Add Tenant" : undefined} onAction={() => setModal({ type: "addTenant" })} />
      ) : view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((t) => <TenantCard key={t.id} {...tenantProps(t)} />)}
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((t) => <TenantRow key={t.id} {...tenantProps(t)} />)}
        </div>
      )}

      {/* Floating batch action bar */}
      {selectMode && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-8 lg:w-auto z-50">
          <div className="bg-zinc-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4">
            <span className="text-sm font-medium">{selected.size} selected</span>
            <button onClick={selectAll} className="text-xs text-zinc-400 hover:text-white transition-colors">Select all</button>
            <div className="flex-1" />
            <Button
              onClick={() => setQuickPayBatch(true)}
              disabled={selected.size === 0}
              size="sm"
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40"
            >
              <CircleDollarSign size={14} className="mr-1" /> Pay {selected.size}
            </Button>
          </div>
        </div>
      )}

      <QuickPayDialog
        open={!!quickPay}
        onClose={() => setQuickPay(null)}
        tenant={quickPay}
        unit={qpUnit}
        payment={qpPayment}
        lastMethod={quickPay ? getLastMethod(quickPay.id) : "cash"}
        month={selectedMonth}
        onConfirm={handleQuickPayConfirm}
        onEditDetails={handleEditDetails}
      />

      <BatchPayDialog
        open={quickPayBatch}
        onClose={() => setQuickPayBatch(false)}
        tenants={selectedTenants}
        month={selectedMonth}
        onConfirm={handleBatchConfirm}
      />
    </div>
  );
}
