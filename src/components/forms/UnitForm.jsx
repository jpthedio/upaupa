import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "@/components/shared/Field";
import { useApp } from "@/context/AppContext";

export function UnitForm({ initial, buildingId, onSave }) {
  const { setModal } = useApp();
  const [f, setF] = useState(initial || { label: "", floor: "", monthlyRent: "", status: "vacant", buildingId });
  return (
    <div className="space-y-4">
      <Field label="Unit Label"><Input value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} placeholder="e.g., Unit 3A" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Floor"><Input type="number" value={f.floor} onChange={(e) => setF({ ...f, floor: Number(e.target.value) })} /></Field>
        <Field label="Monthly Rent (₱)"><Input type="number" value={f.monthlyRent} onChange={(e) => setF({ ...f, monthlyRent: Number(e.target.value) })} /></Field>
      </div>
      <Field label="Status">
        <Select value={f.status} onValueChange={(v) => setF({ ...f, status: v })}>
          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="occupied">Occupied</SelectItem><SelectItem value="vacant">Vacant</SelectItem></SelectContent>
        </Select>
      </Field>
      <Button onClick={() => { if (f.label && f.monthlyRent) { onSave(f); setModal(null); } }} className="w-full rounded-full bg-zinc-900 hover:bg-zinc-800" disabled={!f.label}>
        {initial ? "Save Changes" : "Add Unit"}
      </Button>
    </div>
  );
}
