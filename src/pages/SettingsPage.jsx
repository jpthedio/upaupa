import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, Upload, CheckCircle2 } from "lucide-react";
import { Field } from "@/components/shared/Field";
import { InfoTip } from "@/components/shared/InfoTip";
import { saveData } from "@/lib/storage";
import { buildSeed } from "@/lib/seed";
import { parseCSV, importCSV } from "@/lib/csv-import";
import { useApp } from "@/context/AppContext";

export function SettingsPage() {
  const { data, update, setData, setConfirm, selectedMonth, updatePrefs } = useApp();
  const dueDayOptions = Array.from({ length: 28 }, (_, i) => i + 1);
  const fileRef = useRef(null);
  const [csvRows, setCsvRows] = useState(null);
  const [csvResult, setCsvResult] = useState(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target.result);
      setCsvRows(rows);
      setCsvResult(null);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function doImport() {
    if (!csvRows) return;
    const { data: merged, imported } = importCSV(data, csvRows, selectedMonth);
    saveData(merged);
    setData(merged);
    setCsvResult(imported);
    setCsvRows(null);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Settings</h1>

      <Card className="border border-zinc-200/80 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900">Rent Settings</h3>
          <Field label={<span className="flex items-center gap-1">Due Day (day of month) <InfoTip text="The day of the month when rent is due (e.g., every 5th)." /></span>}>
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
          <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-1">Import Data <InfoTip text="Upload a CSV file to bulk-import buildings, units, tenants, and payments." /></h3>
          <p className="text-xs text-zinc-400">Import from a spreadsheet (CSV format). Matches the same format as the CSV export from the Payments page.</p>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="rounded-full">
            <Upload size={14} className="mr-1" /> Choose CSV File
          </Button>

          {csvRows && (
            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium text-zinc-700">{csvRows.length} row{csvRows.length !== 1 ? "s" : ""} found</p>
              <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 max-h-48">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-100">
                      {Object.keys(csvRows[0] || {}).map((h) => <th key={h} className="px-2 py-1.5 text-left font-medium text-zinc-500">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-zinc-100">
                        {Object.values(row).map((v, j) => <td key={j} className="px-2 py-1 text-zinc-600 whitespace-nowrap">{v}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvRows.length > 5 && <p className="text-xs text-zinc-400 px-2 py-1">...and {csvRows.length - 5} more</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={doImport} className="rounded-full bg-zinc-900 hover:bg-zinc-800">Import {csvRows.length} Rows</Button>
                <Button variant="outline" size="sm" onClick={() => setCsvRows(null)} className="rounded-full">Cancel</Button>
              </div>
            </div>
          )}

          {csvResult !== null && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 pt-1">
              <CheckCircle2 size={16} /> Imported {csvResult} payment{csvResult !== 1 ? "s" : ""} successfully.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-zinc-200/80 shadow-sm">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900">Data Management</h3>
          <p className="text-xs text-zinc-400">Reset all data to demo defaults. This cannot be undone.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirm({ msg: "Reset all data to demo defaults? All your current data will be lost.", fn: () => { const seed = buildSeed(); saveData(seed); setData(seed); updatePrefs("onboarded", true); } })}
            className="rounded-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <RotateCcw size={14} className="mr-1" /> Reset to Demo Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
