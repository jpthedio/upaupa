import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "@/components/shared/Field";
import { InfoTip } from "@/components/shared/InfoTip";
import { StatusPill } from "@/components/shared/StatusPill";
import { useApp } from "@/context/AppContext";
import { Mail, Send, ShieldOff } from "lucide-react";

export function TenantForm({ initial, onSave }) {
  const { data, setModal, portalAccess, inviteToPortal, revokePortalAccess, role, setConfirm } = useApp();
  const vacantUnits = data.units.filter((u) => u.status === "vacant" || u.id === initial?.unitId);
  const globalDueDay = data.settings.dueDay || 5;

  const [f, setF] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    unitId: vacantUnits[0]?.id || "", moveInDate: new Date().toISOString().split("T")[0],
    leaseEndDate: "", emergencyContact: "", dueDay: null,
    ...initial,
  });

  // Resolve inherited due day from the selected unit's building
  const selectedUnit = data.units.find((u) => u.id === f.unitId);
  const parentBuilding = data.buildings.find((b) => b.id === selectedUnit?.buildingId);
  const inheritedDueDay = parentBuilding?.dueDay ?? globalDueDay;

  function handleSave() {
    if (!f.firstName || !f.unitId) return;
    onSave({ ...f, dueDay: f.dueDay ?? null });
    setModal(null);
  }

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
      <Field label="Email"><Input type="email" value={f.email || ""} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="tenant@email.com" /></Field>
      <Field label="Phone"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="09XX XXX XXXX" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Move-in Date"><Input type="date" value={f.moveInDate} onChange={(e) => setF({ ...f, moveInDate: e.target.value })} /></Field>
        <Field label="Lease End"><Input type="date" value={f.leaseEndDate} onChange={(e) => setF({ ...f, leaseEndDate: e.target.value })} /></Field>
      </div>
      {data.settings.perEntityDueDay && (
        <Field label={<span className="flex items-center gap-1">Due Day <InfoTip text="Override the due day for this tenant. Leave as 'Inherit' to use the building or global setting." /></span>}>
          <Select
            value={f.dueDay != null ? String(f.dueDay) : "inherit"}
            onValueChange={(v) => setF({ ...f, dueDay: v === "inherit" ? null : Number(v) })}
          >
            <SelectTrigger className="w-44 rounded-xl">
              <SelectValue placeholder={`Inherit (day ${inheritedDueDay})`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inherit">Inherit (day {inheritedDueDay})</SelectItem>
              {Array.from({ length: 28 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
      {/* Portal Access — only shown when editing an existing tenant */}
      {initial && role === "owner" && (() => {
        const pa = portalAccess?.find((p) => p.tenant_id === initial.id);
        const portalStatus = pa?.status || null;
        const hasEmail = !!f.email?.trim();

        return (
          <div className="pt-3 mt-1 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-zinc-400" />
                <span className="text-xs font-medium text-zinc-600">Tenant Portal</span>
              </div>
              {portalStatus && <StatusPill status={portalStatus} />}
            </div>
            <div className="mt-2">
              {!hasEmail ? (
                <p className="text-xs text-zinc-400">Add an email address to enable portal invite</p>
              ) : portalStatus === "active" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setConfirm({
                    msg: `Revoke portal access for ${initial.firstName}? They won't be able to view their payment history.`,
                    actionLabel: "Revoke",
                    variant: "danger",
                    fn: () => revokePortalAccess(initial.id),
                  })}
                >
                  <ShieldOff size={12} className="mr-1" /> Revoke Access
                </Button>
              ) : portalStatus === "invited" ? (
                <p className="text-xs text-zinc-500">Invite pending — tenant needs to sign in at the app with <span className="font-medium">{f.email}</span></p>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => inviteToPortal(initial.id)}
                >
                  <Send size={12} className="mr-1" /> Invite to Portal
                </Button>
              )}
            </div>
          </div>
        );
      })()}

      <Button onClick={handleSave} className="w-full rounded-full bg-zinc-900 hover:bg-zinc-800" disabled={!f.firstName || !f.unitId}>
        {initial ? "Save Changes" : "Add Tenant"}
      </Button>
    </div>
  );
}
