import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Plus, Download, Search, CheckCircle2, Clock, AlertCircle, LayoutGrid, Table2 } from "lucide-react";
import { peso, fmtDate, monthLabel } from "@/lib/helpers";
import { METHOD_LABELS } from "@/lib/constants";
import { exportCSV } from "@/lib/csv";
import { StatusPill } from "@/components/shared/StatusPill";
import { EmptyState } from "@/components/shared/EmptyState";
import { InfoTip } from "@/components/shared/InfoTip";
import { useApp } from "@/context/AppContext";

export function PaymentsPage() {
  const {
    data, selectedMonth, setSelectedMonth, months,
    monthPayments, totalDue, totalPaid,
    allTimeOutstanding, tenantPrevBalances,
    search, setSearch, prefs, updatePrefs, setModal,
  } = useApp();

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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border border-zinc-200/80 shadow-sm"><CardContent className="p-4 text-center"><span className="text-xs text-zinc-400 flex items-center justify-center gap-1">Expected <InfoTip text="Total rent due from all occupied units this month." /></span><p className="text-lg font-semibold">{peso(totalDue)}</p></CardContent></Card>
        <Card className="border border-emerald-100 shadow-sm"><CardContent className="p-4 text-center"><span className="text-xs text-emerald-600 flex items-center justify-center gap-1">Collected <InfoTip text="Total rent received this month." /></span><p className="text-lg font-semibold text-emerald-600">{peso(totalPaid)}</p></CardContent></Card>
        <Card className="border border-red-100 shadow-sm"><CardContent className="p-4 text-center"><span className="text-xs text-red-500 flex items-center justify-center gap-1">This Month <InfoTip text="Unpaid rent for this month only." /></span><p className="text-lg font-semibold text-red-600">{peso(totalDue - totalPaid)}</p></CardContent></Card>
        <Card className="border border-red-100 shadow-sm"><CardContent className="p-4 text-center"><span className="text-xs text-red-500 flex items-center justify-center gap-1">Total Owed <InfoTip text="Total unpaid rent across all months." /></span><p className="text-lg font-semibold text-red-600">{peso(allTimeOutstanding)}</p></CardContent></Card>
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

      {rows.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments to show" sub="Record a payment or check a different month" />
      ) : view === "card" ? (
        <div className="space-y-2">
          {rows.map((r) => {
            const prevBal = r.tenant ? (tenantPrevBalances.get(r.tenant.id) || 0) : 0;
            return (
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
                        {prevBal > 0 && <p className="text-[10px] text-red-400 mt-0.5">Previous balance: {peso(prevBal)}</p>}
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
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200/80 bg-white">
          <table className="min-w-[800px] w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Building / Unit</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Tenant</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Due</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Paid</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Prev. Bal</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Method</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const prevBal = r.tenant ? (tenantPrevBalances.get(r.tenant.id) || 0) : 0;
                return (
                  <tr key={r.unit.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 cursor-pointer transition-colors" onClick={() => openPayment(r)}>
                    <td className="px-4 py-2.5"><StatusPill status={r.payment?.status || "unpaid"} /></td>
                    <td className="px-4 py-2.5 text-zinc-900 font-medium whitespace-nowrap">{r.building?.name} → {r.unit.label}</td>
                    <td className="px-4 py-2.5 text-zinc-600 whitespace-nowrap">{r.tenant ? `${r.tenant.firstName} ${r.tenant.lastName}` : "—"}</td>
                    <td className="px-4 py-2.5 text-right text-zinc-900">{peso(r.unit.monthlyRent)}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-zinc-900">{peso(r.payment?.amountPaid || 0)}</td>
                    <td className="px-4 py-2.5 text-right text-red-500">{prevBal > 0 ? peso(prevBal) : "—"}</td>
                    <td className="px-4 py-2.5 text-zinc-500 whitespace-nowrap">{r.payment?.method ? METHOD_LABELS[r.payment.method] : "—"}</td>
                    <td className="px-4 py-2.5 text-zinc-500 whitespace-nowrap">{r.payment?.datePaid ? fmtDate(r.payment.datePaid) : "—"}</td>
                    <td className="px-4 py-2.5 text-zinc-400 text-xs italic max-w-32 truncate">{r.payment?.notes || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
