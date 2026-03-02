import { useState, useEffect } from "react";
import { Modal } from "@/components/shared/Modal";
import { Field } from "@/components/shared/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { METHOD_LABELS } from "@/lib/constants";
import { peso } from "@/lib/helpers";

export function QuickPayDialog({ open, onClose, tenant, unit, payment, lastMethod, month, onConfirm, onEditDetails }) {
  const rent = unit?.monthlyRent || 0;
  const alreadyPaid = payment?.amountPaid || 0;
  const remaining = rent - alreadyPaid;

  const [amount, setAmount] = useState(remaining);
  const [method, setMethod] = useState(lastMethod || "cash");
  const [datePaid, setDatePaid] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (open) {
      setAmount(remaining);
      setMethod(lastMethod || "cash");
      setDatePaid(new Date().toISOString().slice(0, 10));
    }
  }, [open, remaining, lastMethod]);

  function handleConfirm() {
    const totalPaid = alreadyPaid + Number(amount);
    const status = totalPaid >= rent && totalPaid > 0 ? "paid" : totalPaid > 0 ? "partial" : "unpaid";
    onConfirm({
      unitId: unit.id,
      tenantId: tenant.id,
      month,
      amountDue: rent,
      amountPaid: totalPaid,
      status,
      method,
      datePaid,
      notes: payment?.notes || "",
    });
    onClose();
  }

  if (!tenant || !unit) return null;

  return (
    <Modal open={open} onClose={onClose} title={alreadyPaid > 0 ? "Complete Payment" : "Quick Pay"}>
      <div className="space-y-4">
        <div className="bg-zinc-50 rounded-xl p-3 space-y-1">
          <p className="text-sm font-medium text-zinc-900">{tenant.firstName} {tenant.lastName}</p>
          <p className="text-xs text-zinc-500">{unit.label} — Rent: {peso(rent)}</p>
          {alreadyPaid > 0 && (
            <p className="text-xs text-amber-600">Already paid: {peso(alreadyPaid)} — Remaining: {peso(remaining)}</p>
          )}
        </div>

        <Field label="Amount (₱)">
          <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="rounded-xl" />
        </Field>

        <Field label="Method">
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(METHOD_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Date Paid">
          <Input type="date" value={datePaid} onChange={(e) => setDatePaid(e.target.value)} className="rounded-xl" />
        </Field>

        <Button onClick={handleConfirm} className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700">
          Confirm Payment — {peso(amount)}
        </Button>

        <button onClick={onEditDetails} className="w-full text-center text-xs text-zinc-400 hover:text-zinc-600 transition-colors py-1">
          Edit full details...
        </button>
      </div>
    </Modal>
  );
}
