import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "@/components/shared/Field";
import { InfoTip } from "@/components/shared/InfoTip";
import { useApp } from "@/context/AppContext";

export function BuildingForm({ initial, onSave }) {
  const { data, setModal } = useApp();
  const globalDueDay = data.settings.dueDay || 5;
  const [f, setF] = useState({
    name: "", address: "", totalUnits: "", dueDay: null,
    ...initial,
  });

  function handleSave() {
    if (!f.name) return;
    onSave({ ...f, dueDay: f.dueDay ?? null });
    setModal(null);
  }

  return (
    <div className="space-y-4">
      <Field label="Building Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g., Building A" /></Field>
      <Field label="Address"><Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="123 Main St, Las Piñas" /></Field>
      <Field label="Total Units"><Input type="number" value={f.totalUnits} onChange={(e) => setF({ ...f, totalUnits: Number(e.target.value) })} /></Field>
      {data.settings.perEntityDueDay && (
        <Field label={<span className="flex items-center gap-1">Due Day <InfoTip text="Override the global due day for this building. Leave as 'Inherit' to use the global setting." /></span>}>
          <Select
            value={f.dueDay != null ? String(f.dueDay) : "inherit"}
            onValueChange={(v) => setF({ ...f, dueDay: v === "inherit" ? null : Number(v) })}
          >
            <SelectTrigger className="w-44 rounded-xl">
              <SelectValue placeholder={`Inherit (day ${globalDueDay})`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inherit">Inherit (day {globalDueDay})</SelectItem>
              {Array.from({ length: 28 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
      <Button onClick={handleSave} className="w-full rounded-full bg-zinc-900 hover:bg-zinc-800" disabled={!f.name}>
        {initial ? "Save Changes" : "Add Building"}
      </Button>
    </div>
  );
}
