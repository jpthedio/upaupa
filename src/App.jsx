import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { Shell } from "@/components/layout/Shell";
import { LoginPage } from "@/pages/LoginPage";
import { TenantPortal } from "@/pages/TenantPortal";

export const APP_VERSION = "1.1.0";

function AuthGate() {
  const { user, team, tenantAccess, authLoading, hasSupabase, signOut } = useAuth();

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
