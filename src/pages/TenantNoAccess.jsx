import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Lock, LogOut } from "lucide-react";

export function TenantNoAccess({ revoked }) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4] p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
      `}</style>
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-zinc-100 flex items-center justify-center">
          <Lock size={28} className="text-zinc-400" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 mb-2">
          {revoked ? "Access Revoked" : "No Access"}
        </h1>
        <p className="text-sm text-zinc-500 mb-1">
          {user?.email && (
            <span className="font-medium text-zinc-700">{user.email}</span>
          )}
        </p>
        <p className="text-sm text-zinc-500 mb-6">
          {revoked
            ? "Your portal access is no longer active. Please contact your building owner."
            : "Your email isn't linked to any property in UpaUpa yet. Ask your landlord to invite you from their dashboard."
          }
        </p>
        <Button onClick={signOut} variant="outline" className="rounded-full">
          <LogOut size={14} className="mr-1.5" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
