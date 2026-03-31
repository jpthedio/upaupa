import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { Shell } from "@/components/layout/Shell";
import { LoginPage } from "@/pages/LoginPage";
import { TenantPortal } from "@/pages/TenantPortal";
import { TenantNoAccess } from "@/pages/TenantNoAccess";
import { Building2, Home, LogOut } from "lucide-react";

export const APP_VERSION = "1.1.0";

function RolePicker() {
  const { chooseOwner, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
      `}</style>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🏠</span>
          <h1 className="text-2xl font-bold text-zinc-900 mt-3 tracking-tight">Welcome to UpaUpa</h1>
          <p className="text-sm text-zinc-500 mt-1">What brings you here?</p>
        </div>
        <div className="space-y-3">
          <button
            onClick={chooseOwner}
            className="w-full bg-white border border-zinc-200/80 rounded-2xl p-5 text-left hover:border-zinc-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Building2 size={22} />
              </div>
              <div>
                <p className="font-semibold text-zinc-900">I'm a building owner</p>
                <p className="text-xs text-zinc-500 mt-0.5">Manage properties, units, tenants & payments</p>
              </div>
            </div>
          </button>
          <button
            disabled
            className="w-full bg-white border border-zinc-200/80 rounded-2xl p-5 text-left opacity-60 cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-400 flex items-center justify-center shrink-0">
                <Home size={22} />
              </div>
              <div>
                <p className="font-semibold text-zinc-500">I'm a tenant</p>
                <p className="text-xs text-zinc-400 mt-0.5">Your landlord needs to invite you first</p>
              </div>
            </div>
          </button>
        </div>
        <div className="text-center mt-6">
          <button onClick={signOut} className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors inline-flex items-center gap-1.5">
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function AuthGate() {
  const { user, team, tenantAccess, needsRole, authLoading, hasSupabase, signOut } = useAuth();

  // Force logout via #logout hash — nukes session directly
  useEffect(() => {
    function handleHash() {
      if (window.location.hash === "#logout") {
        localStorage.removeItem("upaupa-auth");
        window.location.href = window.location.pathname;
      }
    }
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  if (authLoading || (hasSupabase && user && !team && !tenantAccess)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (hasSupabase && !user) {
    return <LoginPage />;
  }

  // New user — ask if they're an owner or tenant
  if (needsRole) {
    return <RolePicker />;
  }

  // Tenant portal — user has tenant access but no team membership
  if (tenantAccess) {
    return <TenantPortal tenantAccess={tenantAccess} user={user} />;
  }

  return (
    <AppProvider user={user} team={team}>
      <Shell />
    </AppProvider>
  );
}

export default function UpaUpa() {
  useEffect(() => {
    console.log(`%c🏠 UpaUpa v${APP_VERSION}`, "font-size:14px;font-weight:bold;color:#18181b");
  }, []);

  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
