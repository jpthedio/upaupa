import { useState, useEffect } from "react";
import { Modal } from "@/components/shared/Modal";
import { Field } from "@/components/shared/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { METHOD_LABELS } from "@/lib/constants";
import { peso } from "@/lib/helpers";

export function BatchPayDialog({ open, onClose, tenants, month, onConfirm }) {
  const [method, setMethod] = useState("cash");
  const [datePaid, setDatePaid] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (open) {
      setMethod("cash");
      setDatePaid(new Date().toISOString().slice(0, 10));
    }
  }, [open]);

  const unpaidTenants = tenants.filter(({ payment }) => payment?.status !== "paid");
  const totalAmount = unpaidTenants.reduce((s, { unit, payment }) => {
    const remaining = (unit?.monthlyRent || 0) - (payment?.amountPaid || 0);
    return s + remaining;
  }, 0);

  function handleConfirm() {
    onConfirm(method, datePaid);
    onClose();
  }

  if (!tenants.length) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Pay ${tenants.length} Tenant${tenants.length > 1 ? "s" : ""}`}>
      <div className="space-y-4">
        <div className="bg-zinc-50 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
          {tenants.map(({ tenant, unit, payment }) => {
            const alreadyPaid = payment?.status === "paid";
            const remaining = (unit?.monthlyRent || 0) - (payment?.amountPaid || 0);
            return (
              <div key={tenant.id} className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${alreadyPaid ? "text-zinc-400" : "text-zinc-900"}`}>{tenant.firstName} {tenant.lastName}</p>
                  <p className="text-xs text-zinc-500">{unit.label}</p>
                </div>
                {alreadyPaid ? (
                  <span className="text-xs font-medium text-emerald-600">Already paid</span>
                ) : (
                  <span className="text-sm font-medium text-zinc-700">{peso(remaining)}</span>
                )}
              </div>
            );
          })}
        </div>

        {unpaidTenants.length > 0 ? (
          <>
            <div className="bg-emerald-50 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-800">Total</span>
              <span className="text-lg font-bold text-emerald-700">{peso(totalAmount)}</span>
            </div>

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
              Confirm — Pay {unpaidTenants.length} ({peso(totalAmount)})
            </Button>
          </>
        ) : (
          <p className="text-sm text-center text-zinc-500 py-2">All selected tenants are already paid for this month.</p>
        )}
      </div>
    </Modal>
  );
}
