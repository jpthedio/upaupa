import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "@/components/shared/Field";
import { monthLabel } from "@/lib/helpers";
import { METHOD_LABELS } from "@/lib/constants";
import { useApp } from "@/context/AppContext";

export function PaymentForm({ initial, onSave }) {
  const { data, selectedMonth, months, setModal } = useApp();
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
