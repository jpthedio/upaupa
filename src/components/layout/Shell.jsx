import { Separator } from "@/components/ui/separator";
import { Modal } from "@/components/shared/Modal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BuildingForm } from "@/components/forms/BuildingForm";
import { UnitForm } from "@/components/forms/UnitForm";
import { TenantForm } from "@/components/forms/TenantForm";
import { PaymentForm } from "@/components/forms/PaymentForm";
import { DashboardPage } from "@/pages/DashboardPage";
import { BuildingsPage } from "@/pages/BuildingsPage";
import { TenantsPage } from "@/pages/TenantsPage";
import { PaymentsPage } from "@/pages/PaymentsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useApp } from "@/context/AppContext";

export function Shell() {
  const {
    loading, data, page, nav, navigate, prefs,
    modal, setModal, confirm, setConfirm,
    addBuilding, editBuilding, addUnit, editUnit,
    addTenant, editTenant, upsertPayment,
  } = useApp();

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading UpaUpa...</p>
        </div>
      </div>
    );
  }

  if (!prefs.onboarded) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] font-sans">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
          * { font-family: 'DM Sans', sans-serif; }
        `}</style>
        <OnboardingWizard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 3px; }
      `}</style>

      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-zinc-200/60 px-4 py-3">
        <span className="text-lg font-bold tracking-tight">🏠 UpaUpa</span>
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-white border-r border-zinc-200/60 p-5 sticky top-0">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-xl font-bold tracking-tight">🏠 UpaUpa</span>
          </div>
          <nav className="space-y-1 flex-1">
            {nav.map((n) => (
              <button key={n.id} onClick={() => navigate(n.id)} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${page === n.id ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100"}`}>
                <n.icon size={18} />{n.label}
              </button>
            ))}
          </nav>
          <Separator className="my-4" />
          <p className="text-[10px] text-zinc-400 text-center">UpaUpa v1.0 · Phase 1 MVP</p>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-5xl overflow-x-hidden">
          {page === "dashboard" && <DashboardPage />}
          {page === "buildings" && <BuildingsPage />}
          {page === "tenants" && <TenantsPage />}
          {page === "payments" && <PaymentsPage />}
          {page === "settings" && <SettingsPage />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200/60" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex justify-around items-center h-16 px-2">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => navigate(n.id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[10px] font-medium transition-colors ${page === n.id ? "text-zinc-900" : "text-zinc-400"}`}
            >
              <n.icon size={20} strokeWidth={page === n.id ? 2.5 : 1.5} />
              <span>{n.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Modals */}
      <Modal open={modal?.type === "addBuilding"} onClose={() => setModal(null)} title="Add Building">
        <BuildingForm onSave={addBuilding} />
      </Modal>
      <Modal open={modal?.type === "editBuilding"} onClose={() => setModal(null)} title="Edit Building">
        {modal?.data && <BuildingForm initial={modal.data} onSave={(b) => editBuilding(modal.data.id, b)} />}
      </Modal>
      <Modal open={modal?.type === "addUnit"} onClose={() => setModal(null)} title="Add Unit">
        <UnitForm buildingId={modal?.buildingId} onSave={addUnit} />
      </Modal>
      <Modal open={modal?.type === "editUnit"} onClose={() => setModal(null)} title="Edit Unit">
        {modal?.data && <UnitForm initial={modal.data} buildingId={modal.data.buildingId} onSave={(u) => { editUnit(modal.data.id, u); }} />}
      </Modal>
      <Modal open={modal?.type === "addTenant"} onClose={() => setModal(null)} title="Add Tenant">
        <TenantForm onSave={addTenant} />
      </Modal>
      <Modal open={modal?.type === "editTenant"} onClose={() => setModal(null)} title="Edit Tenant">
        {modal?.data && <TenantForm initial={modal.data} onSave={(t) => editTenant(modal.data.id, t)} />}
      </Modal>
      <Modal open={modal?.type === "addPayment"} onClose={() => setModal(null)} title="Record Payment">
        <PaymentForm initial={modal?.data || undefined} onSave={upsertPayment} />
      </Modal>
      <Modal open={modal?.type === "editPayment"} onClose={() => setModal(null)} title="Update Payment">
        {modal?.data && <PaymentForm initial={modal.data} onSave={upsertPayment} />}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => { confirm?.fn(); setConfirm(null); }}
        title="Are you sure?"
        message={confirm?.msg || "This action cannot be undone."}
      />
    </div>
  );
}
