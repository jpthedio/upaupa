import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search, Phone, Calendar, Edit2, Trash2, LayoutGrid, List, CheckCircle2, Zap } from "lucide-react";
import { fmtDate, peso, currentMonth } from "@/lib/helpers";
import { StatusPill } from "@/components/shared/StatusPill";
import { EmptyState } from "@/components/shared/EmptyState";
import { QuickPayDialog } from "@/components/forms/QuickPayDialog";
import { useApp } from "@/context/AppContext";

export function TenantsPage() {
  const {
    data, monthPayments, selectedMonth, tenantBalances, search, setSearch,
    prefs, updatePrefs, setModal, setConfirm, deleteTenant, upsertPayment,
  } = useApp();

  const view = prefs.tenantsView || "card";
  const [quickPay, setQuickPay] = useState(null);

  const filtered = data.tenants.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) || t.phone?.includes(q);
  });

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

  const qpUnit = quickPay ? data.units.find((u) => u.id === quickPay.unitId) : null;
  const qpPayment = quickPay ? monthPayments.find((p) => p.tenantId === quickPay.id) : null;

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
            const balance = tenantBalances.get(t.id) || 0;
            const isPaid = payment?.status === "paid";
            const isPartial = payment?.status === "partial";
            const remaining = (unit?.monthlyRent || 0) - (payment?.amountPaid || 0);
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
                  <div className="mt-3 pt-2 border-t border-zinc-100">
                    {isPaid ? (
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 size={16} />
                        <span className="text-xs font-medium">Paid this month</span>
                      </div>
                    ) : isPartial ? (
                      <Button variant="outline" size="sm" onClick={() => openQuickPay(t)} className="w-full rounded-full text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700">
                        <Zap size={14} className="mr-1" /> Complete Payment ({peso(remaining)})
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => openQuickPay(t)} className="w-full rounded-full text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                        <Zap size={14} className="mr-1" /> Quick Pay
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
            const balance = tenantBalances.get(t.id) || 0;
            const isPaid = payment?.status === "paid";
            const isPartial = payment?.status === "partial";
            const remaining = (unit?.monthlyRent || 0) - (payment?.amountPaid || 0);
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
                {balance > 0 && <span className="text-xs font-medium text-red-600 whitespace-nowrap">{peso(balance)}</span>}
                {isPaid ? (
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                ) : (
                  <button
                    onClick={() => openQuickPay(t)}
                    title={isPartial ? `Complete Payment (${peso(remaining)})` : "Quick Pay"}
                    className={`p-1.5 rounded-lg shrink-0 transition-colors ${isPartial ? "hover:bg-amber-50 text-amber-500" : "hover:bg-emerald-50 text-emerald-500"}`}
                  >
                    <Zap size={16} />
                  </button>
                )}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => setModal({ type: "editTenant", data: t })} className="p-1.5 hover:bg-zinc-100 rounded-lg"><Edit2 size={14} className="text-zinc-400" /></button>
                  <button onClick={() => setConfirm({ msg: `Remove ${t.firstName} ${t.lastName}? This also removes their payment history.`, fn: () => deleteTenant(t.id) })} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={14} className="text-zinc-400 hover:text-red-500" /></button>
                </div>
              </div>
            );
          })}
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
    </div>
  );
}
