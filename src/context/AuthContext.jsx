import { createContext, useContext, useState, useEffect } from "react";
import { supabase, hasSupabase } from "@/lib/supabase";
import { ensureTeam } from "@/lib/team";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [authLoading, setAuthLoading] = useState(hasSupabase);

  useEffect(() => {
    if (!hasSupabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setTeam(null);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Resolve team after user is set
  useEffect(() => {
    if (!user) { setTeam(null); return; }
    let cancelled = false;
    ensureTeam(user.id)
      .then((t) => {
        if (!cancelled) {
          setTeam(t);
          setAuthLoading(false);
        }
      })
      .catch((err) => {
        console.error("ensureTeam failed:", err);
        if (!cancelled) setAuthLoading(false);
      });
    return () => { cancelled = true; };
  }, [user]);

  async function signInWithEmail(email) {
    if (!supabase) return { error: { message: "Supabase not configured" } };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    return { error };
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setTeam(null);
  }

  return (
    <AuthContext.Provider value={{ user, team, authLoading, hasSupabase, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
