import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, AlertCircle, Home, Users, CheckCircle2, Calendar } from "lucide-react";
import { peso, monthLabel } from "@/lib/helpers";
import { StatCard } from "@/components/shared/StatCard";
import { StatusPill } from "@/components/shared/StatusPill";
import { InfoTip } from "@/components/shared/InfoTip";
import { useApp } from "@/context/AppContext";

export function DashboardPage() {
  const {
    data, monthPayments, totalDue, totalPaid, collectionRate,
    overdueCount, occupiedCount, vacantCount,
    allTimeOutstanding, tenantPrevBalances, yearStats,
    selectedMonth, setSelectedMonth, months, setModal,
  } = useApp();

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
        <StatCard icon={TrendingUp} label="Collected" value={peso(totalPaid)} sub={`${collectionRate}% of ${peso(totalDue)}`} tip="Total rent collected this month from all tenants." />
        <StatCard icon={AlertCircle} label="Outstanding" value={peso(allTimeOutstanding)} sub={allTimeOutstanding !== (totalDue - totalPaid) ? `${peso(totalDue - totalPaid)} this month` : overdueCount > 0 ? `${overdueCount} overdue this month` : "All good!"} accent={allTimeOutstanding > 0 ? "text-red-600" : undefined} tip="Total unpaid rent across all months, including previous balances." />
        <StatCard icon={Home} label="Occupied" value={`${occupiedCount}/${data.units.length}`} sub={`${vacantCount} vacant`} tip="How many of your units currently have tenants." />
        <StatCard icon={Users} label="Tenants" value={data.tenants.filter((t) => t.status === "active").length} />
      </div>

      <Card className="border border-zinc-200/80 shadow-sm">
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-zinc-700 flex items-center gap-1">Collection Progress <InfoTip text="Percentage of expected rent that's been collected." /></span>
            <span className="text-sm text-zinc-500">{peso(totalPaid)} / {peso(totalDue)}</span>
          </div>
          <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${collectionRate}%` }} />
          </div>
        </CardContent>
      </Card>

      {overdue.length > 0 && (
        <Card className="border border-red-100 shadow-sm">
          <CardHeader className="pb-3 px-5 pt-5">
            <CardTitle className="text-base font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle size={16} /> Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2">
            {overdue.map((p) => {
              const prevBal = tenantPrevBalances.get(p.tenantId) || 0;
              return (
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
                      {prevBal > 0 && <p className="text-[10px] text-red-400 mt-0.5">+ {peso(prevBal)} previous balance</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusPill status={p.status} />
                    <p className="text-xs text-zinc-500 mt-1">{peso(p.amountDue - p.amountPaid)} due</p>
                  </div>
                </div>
              );
            })}
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

      {/* Year Overview (trailing 12 months) */}
      {yearStats.months.some((m) => m.due > 0) && (
        <Card className="border border-zinc-200/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                <Calendar size={15} className="text-zinc-400" /> Year Overview
                <InfoTip text="Trailing 12 months of rent collection." />
              </h3>
              <div className="text-right">
                <p className="text-lg font-semibold text-zinc-900">{peso(yearStats.totalPaid)} <span className="text-xs font-normal text-zinc-400">/ {peso(yearStats.totalDue)}</span></p>
                <p className="text-xs text-zinc-500">{yearStats.rate}% collected</p>
              </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-1 h-28 mb-2">
              {yearStats.months.map((m) => {
                const maxDue = Math.max(...yearStats.months.map((x) => x.due), 1);
                const barH = m.due > 0 ? Math.max((m.due / maxDue) * 100, 4) : 0;
                const paidH = m.due > 0 ? (m.paid / m.due) * barH : 0;
                const shortMonth = new Date(m.month.slice(0, 7) + "-15").toLocaleDateString("en-PH", { month: "short" });
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="w-full relative rounded-t" style={{ height: `${barH}%`, minHeight: barH > 0 ? 4 : 0 }}>
                      <div className="absolute inset-0 bg-zinc-100 rounded-t" />
                      <div className="absolute bottom-0 left-0 right-0 bg-emerald-400 rounded-t transition-all" style={{ height: `${m.due > 0 ? (m.paid / m.due) * 100 : 0}%` }} />
                    </div>
                    <span className="text-[9px] text-zinc-400 leading-none">{shortMonth}</span>
                    {/* Tooltip */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] rounded-lg px-2 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                      <p className="font-medium">{new Date(m.month.slice(0, 7) + "-15").toLocaleDateString("en-PH", { month: "long", year: "numeric" })}</p>
                      <p>Due: {peso(m.due)} | Paid: {peso(m.paid)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Year totals row */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-100">
              <div className="text-center">
                <p className="text-xs text-zinc-400">Total Due</p>
                <p className="text-sm font-semibold text-zinc-900">{peso(yearStats.totalDue)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-400">Total Collected</p>
                <p className="text-sm font-semibold text-emerald-600">{peso(yearStats.totalPaid)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-400">Outstanding</p>
                <p className="text-sm font-semibold text-red-600">{peso(yearStats.totalDue - yearStats.totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
