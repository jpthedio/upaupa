import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { Shell } from "@/components/layout/Shell";
import { LoginPage } from "@/pages/LoginPage";

function AuthGate() {
  const { user, authLoading, hasSupabase } = useAuth();

  if (authLoading) {
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
    <AppProvider user={user}>
      <Shell />
    </AppProvider>
  );
}

export default function UpaUpa() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
