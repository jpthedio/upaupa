import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function LoginPage() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const { error: err } = await signInWithEmail(email.trim());
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
      `}</style>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🏠</span>
          <h1 className="text-2xl font-bold text-zinc-900 mt-3 tracking-tight">UpaUpa</h1>
          <p className="text-sm text-zinc-500 mt-1">Rental management, simplified</p>
        </div>

        <Card className="border border-zinc-200/80 shadow-sm">
          <CardContent className="p-6">
            {sent ? (
              <div className="text-center space-y-3 py-4">
                <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
                <h2 className="text-lg font-semibold text-zinc-900">Check your email</h2>
                <p className="text-sm text-zinc-500">
                  We sent a magic link to <span className="font-medium text-zinc-700">{email}</span>.
                  Click the link to sign in.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="mt-2 text-zinc-500"
                >
                  Use a different email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="pl-9 rounded-xl"
                      required
                      autoFocus
                    />
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full rounded-full bg-zinc-900 hover:bg-zinc-800"
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                  {!loading && <ArrowRight size={14} className="ml-1" />}
                </Button>
                <p className="text-xs text-zinc-400 text-center">
                  No password needed. We'll email you a sign-in link.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
