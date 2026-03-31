import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import { TenantDashboard } from "@/pages/TenantDashboard";
import { TenantNoAccess } from "@/pages/TenantNoAccess";
import { LogOut } from "lucide-react";

export function TenantShell() {
  const { signOut } = useAuth();
  const { loading, tenants } = useTenant();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
          * { font-family: 'DM Sans', sans-serif; }
        `}</style>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!tenants?.length) {
    return <TenantNoAccess />;
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

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-zinc-200/60 px-4 py-3 flex items-center justify-between">
        <span className="text-lg font-bold tracking-tight">🏠 UpaUpa</span>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto p-4 sm:p-6 pb-12">
        <TenantDashboard />
      </main>
    </div>
  );
}
