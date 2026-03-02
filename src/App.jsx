import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { Shell } from "@/components/layout/Shell";
import { LoginPage } from "@/pages/LoginPage";

export const APP_VERSION = "1.1.0";

function AuthGate() {
  const { user, team, authLoading, hasSupabase, signOut } = useAuth();

  // Force logout via #logout hash
  useEffect(() => {
    function handleHash() {
      if (window.location.hash === "#logout") {
        window.location.hash = "";
        signOut();
      }
    }
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [signOut]);

  if (authLoading || (hasSupabase && user && !team)) {
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
