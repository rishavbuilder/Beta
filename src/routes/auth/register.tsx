import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Github, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/auth/register")({
  head: () => ({
    meta: [
      { title: "Create Account — PromptOS" },
      {
        name: "description",
        content: "Create a PromptOS account to start discovering and sharing AI prompts.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle, signInWithGitHub } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await signUp(email, password, username);
    setLoading(false);
    if (err) setError(err);
    else {
      // Check if session exists (auto-confirm enabled) or needs email confirmation
      const supabase = await (await import("@/lib/supabase")).getSupabase();
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        router.navigate({ to: "/dashboard" });
      } else {
        setError("Account created! Check your email for the confirmation link.");
      }
    }
  }

  return (
    <div className="relative min-h-screen hero-radial selection:bg-zinc-500/30">
      <Navbar />
      <main className="flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl p-8 ring-1 ring-white/10 glass-card">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-zinc-800 ring-1 ring-white/10">
                <Sparkles className="size-6 text-zinc-200" />
              </div>
              <h1 className="text-xl font-semibold text-zinc-100">Create your account</h1>
              <p className="mt-1 text-sm text-zinc-500">Join the PromptOS community</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-500/10 px-4 py-2 text-xs text-red-400 ring-1 ring-red-500/20">
                  {error}
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Username</label>
                <div className="flex h-10 items-center gap-2 rounded-lg bg-zinc-900/60 px-3 ring-1 ring-white/10 focus-within:ring-zinc-400/40">
                  <User className="size-4 shrink-0 text-zinc-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yourname"
                    required
                    className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Email</label>
                <div className="flex h-10 items-center gap-2 rounded-lg bg-zinc-900/60 px-3 ring-1 ring-white/10 focus-within:ring-zinc-400/40">
                  <Mail className="size-4 shrink-0 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Password</label>
                <div className="flex h-10 items-center gap-2 rounded-lg bg-zinc-900/60 px-3 ring-1 ring-white/10 focus-within:ring-zinc-400/40">
                  <Lock className="size-4 shrink-0 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-zinc-100 py-2.5 text-sm font-medium text-zinc-950 ring-1 ring-zinc-100 transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-zinc-500">or continue with</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={signInWithGoogle}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-zinc-900/60 py-2.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
              <button
                onClick={signInWithGitHub}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-zinc-900/60 py-2.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                <Github className="size-4" />
                GitHub
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-zinc-500">
              Already have an account?{" "}
              <Link to="/auth/login" className="font-medium text-zinc-200 hover:text-zinc-100">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
