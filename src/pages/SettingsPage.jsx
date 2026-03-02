import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw } from "lucide-react";
import { Field } from "@/components/shared/Field";
import { saveData } from "@/lib/storage";
import { buildSeed } from "@/lib/seed";
import { useApp } from "@/context/AppContext";

export function SettingsPage() {
  const { data, update, setData, setConfirm } = useApp();
  const dueDayOptions = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Settings</h1>

      <Card className="border border-zinc-200/80 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900">Rent Settings</h3>
          <Field label="Due Day (day of month)">
            <Select value={String(data.settings.dueDay)} onValueChange={(v) => update((d) => ({ ...d, settings: { ...d.settings, dueDay: Number(v) } }))}>
              <SelectTrigger className="w-32 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{dueDayOptions.map((d) => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card className="border border-zinc-200/80 shadow-sm">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900">About UpaUpa</h3>
          <p className="text-xs text-zinc-400">Version 1.0 · Phase 1 MVP</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[
              { label: "Buildings", value: data.buildings.length },
              { label: "Units", value: data.units.length },
              { label: "Tenants", value: data.tenants.filter((t) => t.status === "active").length },
              { label: "Payments", value: data.payments.length },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 bg-zinc-50 rounded-xl">
                <p className="text-lg font-semibold text-zinc-900">{s.value}</p>
                <p className="text-xs text-zinc-400">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-zinc-200/80 shadow-sm">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900">Data Management</h3>
          <p className="text-xs text-zinc-400">Reset all data to demo defaults. This cannot be undone.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirm({ msg: "Reset all data to demo defaults? All your current data will be lost.", fn: () => { const seed = buildSeed(); saveData(seed); setData(seed); } })}
            className="rounded-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <RotateCcw size={14} className="mr-1" /> Reset to Demo Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
