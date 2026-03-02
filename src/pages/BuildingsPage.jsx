import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Home, Plus, ChevronRight, ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { peso } from "@/lib/helpers";
import { StatusPill } from "@/components/shared/StatusPill";
import { EmptyState } from "@/components/shared/EmptyState";
import { useApp } from "@/context/AppContext";

export function BuildingsPage() {
  const {
    data, monthPayments, selectedBuilding, setSelectedBuilding,
    setModal, setConfirm, deleteBuilding, deleteUnit,
  } = useApp();

  if (selectedBuilding) {
    const building = data.buildings.find((b) => b.id === selectedBuilding);
    const units = data.units.filter((u) => u.buildingId === selectedBuilding);
    if (!building) { setSelectedBuilding(null); return null; }
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedBuilding(null)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{building.name}</h1>
            <p className="text-sm text-zinc-500">{building.address}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">{units.length} units</p>
          <Button onClick={() => setModal({ type: "addUnit", buildingId: selectedBuilding })} size="sm" className="rounded-full bg-zinc-900 hover:bg-zinc-800"><Plus size={14} className="mr-1" /> Add Unit</Button>
        </div>
        {units.length === 0 ? (
          <EmptyState icon={Home} title="No units yet" sub="Add your first unit to this building" action="Add Unit" onAction={() => setModal({ type: "addUnit", buildingId: selectedBuilding })} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {units.map((u) => {
              const tenant = data.tenants.find((t) => t.unitId === u.id && t.status === "active");
              const payment = monthPayments.find((p) => p.unitId === u.id);
              return (
                <Card key={u.id} className="border border-zinc-200/80 shadow-sm hover:shadow-md transition-all group">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-zinc-900">{u.label}</p>
                        {u.floor && <p className="text-xs text-zinc-400">Floor {u.floor}</p>}
                      </div>
                      <StatusPill status={u.status} />
                    </div>
                    <p className="text-lg font-semibold text-zinc-900 mb-2">{peso(u.monthlyRent)}<span className="text-xs font-normal text-zinc-400">/mo</span></p>
                    {tenant ? (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-medium">{tenant.firstName[0]}</div>
                        <span className="text-sm text-zinc-600">{tenant.firstName} {tenant.lastName}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 mb-3">No tenant</p>
                    )}
                    {payment && <StatusPill status={payment.status} />}
                    <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" onClick={() => setModal({ type: "editUnit", data: u })} className="rounded-full h-8 px-3"><Edit2 size={12} className="mr-1" /> Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirm({ msg: `Delete ${u.label}? This removes the unit, tenant, and all payments.`, fn: () => deleteUnit(u.id) })} className="rounded-full h-8 px-3 text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 size={12} /></Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Buildings</h1>
        <Button onClick={() => setModal({ type: "addBuilding" })} size="sm" className="rounded-full bg-zinc-900 hover:bg-zinc-800"><Plus size={14} className="mr-1" /> Add Building</Button>
      </div>
      {data.buildings.length === 0 ? (
        <EmptyState icon={Building2} title="No buildings yet" sub="Add your first building to get started" action="Add Building" onAction={() => setModal({ type: "addBuilding" })} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.buildings.map((b) => {
            const units = data.units.filter((u) => u.buildingId === b.id);
            const occ = units.filter((u) => u.status === "occupied").length;
            const bPayments = monthPayments.filter((p) => units.some((u) => u.id === p.unitId));
            const bDue = bPayments.reduce((s, p) => s + p.amountDue, 0);
            const bPaid = bPayments.reduce((s, p) => s + p.amountPaid, 0);
            return (
              <Card key={b.id} className="border border-zinc-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedBuilding(b.id)}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900">{b.name}</h3>
                      <p className="text-sm text-zinc-500">{b.address}</p>
                    </div>
                    <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-500 transition-colors mt-1" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div><p className="text-xs text-zinc-400">Units</p><p className="font-semibold">{units.length}</p></div>
                    <div><p className="text-xs text-zinc-400">Occupied</p><p className="font-semibold">{occ}/{units.length}</p></div>
                    <div><p className="text-xs text-zinc-400">Collected</p><p className="font-semibold text-emerald-600">{bDue > 0 ? Math.round((bPaid / bDue) * 100) : 0}%</p></div>
                  </div>
                  <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${bDue > 0 ? (bPaid / bDue) * 100 : 0}%` }} />
                  </div>
                  <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => setModal({ type: "editBuilding", data: b })} className="rounded-full h-8 px-3"><Edit2 size={12} className="mr-1" /> Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirm({ msg: `Delete ${b.name}? This removes all units, tenants, and payments in this building.`, fn: () => deleteBuilding(b.id) })} className="rounded-full h-8 px-3 text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 size={12} /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
