import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, AlertCircle, Home, Users, CheckCircle2 } from "lucide-react";
import { peso, monthLabel } from "@/lib/helpers";
import { StatCard } from "@/components/shared/StatCard";
import { StatusPill } from "@/components/shared/StatusPill";
import { useApp } from "@/context/AppContext";

export function DashboardPage() {
  const {
    data, monthPayments, totalDue, totalPaid, collectionRate,
    overdueCount, occupiedCount, vacantCount,
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
        <StatCard icon={TrendingUp} label="Collected" value={peso(totalPaid)} sub={`${collectionRate}% of ${peso(totalDue)}`} />
        <StatCard icon={AlertCircle} label="Overdue" value={overdueCount} sub={overdueCount > 0 ? `${peso(totalDue - totalPaid)} outstanding` : "All good!"} accent={overdueCount > 0 ? "text-red-600" : undefined} />
        <StatCard icon={Home} label="Occupied" value={`${occupiedCount}/${data.units.length}`} sub={`${vacantCount} vacant`} />
        <StatCard icon={Users} label="Tenants" value={data.tenants.filter((t) => t.status === "active").length} />
      </div>

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
