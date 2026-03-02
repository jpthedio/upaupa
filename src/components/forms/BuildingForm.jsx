import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/Field";
import { useApp } from "@/context/AppContext";

export function BuildingForm({ initial, onSave }) {
  const { setModal } = useApp();
  const [f, setF] = useState(initial || { name: "", address: "", totalUnits: "" });
  return (
    <div className="space-y-4">
      <Field label="Building Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g., Building A" /></Field>
      <Field label="Address"><Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="123 Main St, Las Piñas" /></Field>
      <Field label="Total Units"><Input type="number" value={f.totalUnits} onChange={(e) => setF({ ...f, totalUnits: Number(e.target.value) })} /></Field>
      <Button onClick={() => { if (f.name) { onSave(f); setModal(null); } }} className="w-full rounded-full bg-zinc-900 hover:bg-zinc-800" disabled={!f.name}>
        {initial ? "Save Changes" : "Add Building"}
      </Button>
    </div>
  );
}
