import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Authenticating — PromptOS" },
      { name: "description", content: "Completing authentication..." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    getSupabase().then((supabase) => {
      supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN") navigate({ to: "/dashboard" });
      });
    });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-zinc-400">
        <div className="size-5 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-200" />
        <span className="text-sm">Authenticating...</span>
      </div>
    </div>
  );
}
