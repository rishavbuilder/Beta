import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, TrendingUp } from "lucide-react";
import { SkeletonLeaderboardCard } from "@/components/Skeletons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getLeaderboard } from "@/utils/supabase-server";

export const Route = createFileRoute("/battle/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — PromptOS" },
      { name: "description", content: "Top prompt creators ranked by community engagement on PromptOS." },
      { property: "og:title", content: "Leaderboard — PromptOS" },
      { property: "og:description", content: "See who tops the rankings. Create and share prompts to climb the leaderboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (getLeaderboard as any)().then((res: any) => {
      setCreators(res.creators || []);
      setPrompts(res.prompts || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="relative min-h-screen hero-radial selection:bg-zinc-500/30">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pb-32 pt-16">
        <div className="mb-10 text-center">
          <span className="font-mono-display text-[10px] uppercase tracking-wider text-zinc-500">
            / leaderboard
          </span>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
            Creator Leaderboard
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Top-performing prompt creators ranked by community engagement.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-8 lg:grid-cols-2">
            <SkeletonLeaderboardCard />
            <SkeletonLeaderboardCard />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-xl bg-zinc-900/40 ring-1 ring-white/5">
              <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
                <Trophy className="size-4 text-amber-400" />
                <h2 className="text-sm font-medium text-zinc-200">Top Creators</h2>
              </div>
              <div className="divide-y divide-white/5">
                {creators.length === 0 ? (
                  <p className="px-6 py-8 text-center text-xs text-zinc-500">No creators yet.</p>
                ) : (
                  creators.map((c, i) => (
                    <div
                      key={c.name}
                      className="flex items-center gap-4 px-6 py-4"
                    >
                      <span
                        className={`flex size-8 items-center justify-center rounded-lg text-xs font-bold ${
                          c.rank === 1
                            ? "bg-amber-500/20 text-amber-400"
                            : c.rank === 2
                              ? "bg-zinc-400/20 text-zinc-300"
                              : c.rank === 3
                                ? "bg-orange-600/20 text-orange-400"
                                : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {c.rank}
                      </span>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-zinc-200">{c.name}</span>
                        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                          <span>{c.prompts} prompts</span>
                          <span>{c.saves} saves</span>
                          <span>{c.likes} likes</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl bg-zinc-900/40 ring-1 ring-white/5">
              <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
                <TrendingUp className="size-4 text-zinc-400" />
                <h2 className="text-sm font-medium text-zinc-200">Top Prompts</h2>
              </div>
              <div className="divide-y divide-white/5">
                {prompts.length === 0 ? (
                  <p className="px-6 py-8 text-center text-xs text-zinc-500">No prompts yet.</p>
                ) : (
                  prompts.map((p, i) => (
                    <div
                      key={p.name}
                      className="flex items-center gap-4 px-6 py-4"
                    >
                      <span
                        className={`flex size-8 items-center justify-center rounded-lg text-xs font-bold ${
                          p.rank === 1
                            ? "bg-amber-500/20 text-amber-400"
                            : p.rank === 2
                              ? "bg-zinc-400/20 text-zinc-300"
                              : p.rank === 3
                                ? "bg-orange-600/20 text-orange-400"
                                : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {p.rank}
                      </span>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-zinc-200">{p.name}</span>
                        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                          <span>by {p.author}</span>
                          <span>{p.saves} saves</span>
                          <span>★ {p.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
