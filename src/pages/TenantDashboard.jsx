import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusPill } from "@/components/shared/StatusPill";
import { peso, fmtDate, monthLabel, currentMonth } from "@/lib/helpers";
import { useTenant } from "@/context/TenantContext";
import { Calendar, Home, CreditCard } from "lucide-react";

export function TenantDashboard() {
  const {
    tenants, units, buildings,
    selectedTenantId, setSelectedTenantId,
    selectedTenant, selectedUnit, selectedBuilding, selectedPayments,
    balances, totalBalance,
  } = useTenant();

  const isMultiUnit = tenants.length > 1;
  const cm = currentMonth();

  // Current month payment for selected tenant
  const currentPayment = selectedPayments.find((p) => p.month === cm) || null;
  const balance = balances[selectedTenantId] || 0;

  // Previous months outstanding (exclude current month)
  const prevBalance = selectedPayments
    .filter((p) => p.month < cm)
    .reduce((sum, p) => sum + ((p.amountDue || 0) - (p.amountPaid || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Hi, {selectedTenant?.firstName}
        </h1>
        <p className="text-sm text-zinc-500 flex items-center gap-1.5 mt-1">
          <Home size={14} />
          {selectedUnit?.label || "Unit"} · {selectedBuilding?.name || "Building"}
        </p>
      </div>

      {/* Multi-unit switcher */}
      {isMultiUnit && (
        <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            {tenants.map((t) => {
              const u = units.find((u) => u.id === t.unitId);
              const b = buildings.find((b) => b.id === u?.buildingId);
              return (
                <SelectItem key={t.id} value={t.id}>
                  {u?.label || "Unit"} · {b?.name || "Building"}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}

      {/* Multi-unit total balance */}
      {isMultiUnit && totalBalance > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Total Outstanding (All Units)</p>
            <p className="text-2xl font-bold text-red-700">{peso(totalBalance)}</p>
            <div className="mt-2 space-y-1">
              {tenants.map((t) => {
                const b = balances[t.id] || 0;
                if (b <= 0) return null;
                const u = units.find((u) => u.id === t.unitId);
                return (
                  <div key={t.id} className="flex justify-between text-xs text-red-600">
                    <span>{u?.label || "Unit"}</span>
                    <span>{peso(b)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* This month */}
      <Card className="border-zinc-200/80">
        <CardContent className="p-4">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">This Month</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-zinc-900">
                {peso(currentPayment?.amountDue || selectedUnit?.monthlyRent || 0)}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {monthLabel(cm)}
              </p>
            </div>
            <StatusPill status={currentPayment?.status || "unpaid"} />
          </div>
          {currentPayment?.amountPaid > 0 && currentPayment?.status !== "paid" && (
            <p className="text-xs text-zinc-500 mt-2">
              {peso(currentPayment.amountPaid)} paid · {peso((currentPayment.amountDue || 0) - (currentPayment.amountPaid || 0))} remaining
            </p>
          )}
        </CardContent>
      </Card>

      {/* Outstanding balance from previous months */}
      {prevBalance > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Previous Balance</p>
            <p className="text-2xl font-bold text-amber-700">{peso(prevBalance)}</p>
            <p className="text-xs text-amber-600 mt-0.5">From previous months</p>
          </CardContent>
        </Card>
      )}

      {/* Payment history */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
          <CreditCard size={16} /> Payment History
        </h2>
        {selectedPayments.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-8">No payment records yet</p>
        ) : (
          <div className="space-y-2">
            {selectedPayments.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-zinc-200/80 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{monthLabel(p.month)}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {peso(p.amountDue)} due
                      {p.amountPaid > 0 && ` · ${peso(p.amountPaid)} paid`}
                    </p>
                    {p.datePaid && (
                      <p className="text-xs text-zinc-400 mt-0.5">Paid {fmtDate(p.datePaid)}</p>
                    )}
                  </div>
                  <StatusPill status={p.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lease info */}
      {(selectedTenant?.moveInDate || selectedTenant?.leaseEndDate || selectedUnit?.monthlyRent) && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
            <Calendar size={16} /> Lease Info
          </h2>
          <Card className="border-zinc-200/80">
            <CardContent className="p-4 space-y-2">
              {selectedTenant.moveInDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Move-in</span>
                  <span className="text-zinc-900 font-medium">{fmtDate(selectedTenant.moveInDate)}</span>
                </div>
              )}
              {selectedTenant.leaseEndDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Lease ends</span>
                  <span className="text-zinc-900 font-medium">{fmtDate(selectedTenant.leaseEndDate)}</span>
                </div>
              )}
              {selectedUnit?.monthlyRent && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Monthly rent</span>
                  <span className="text-zinc-900 font-medium">{peso(selectedUnit.monthlyRent)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
