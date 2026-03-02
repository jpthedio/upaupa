import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "@/components/shared/Field";
import { useApp } from "@/context/AppContext";

export function TenantForm({ initial, onSave }) {
  const { data, setModal } = useApp();
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
