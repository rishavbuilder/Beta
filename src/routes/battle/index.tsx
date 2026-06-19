import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Swords, Trophy, Users, Clock, Vote, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition, fadeUp, stagger } from "@/components/PageTransition";
import { getBattles, castVote } from "@/utils/supabase-server";

export const Route = createFileRoute("/battle/")({
  head: () => ({
    meta: [
      { title: "Prompt Battles — PromptOS" },
      {
        name: "description",
        content:
          "Vote in prompt battles. Compare prompts head-to-head and see which performs better.",
      },
      { property: "og:title", content: "Prompt Battles — PromptOS" },
      {
        property: "og:description",
        content:
          "Head-to-head prompt battles. Vote for the best AI prompts and see who wins.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BattlePage,
});

function BattlePage() {
  const [battles, setBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedBattles, setVotedBattles] = useState<Set<string>>(new Set());

  useEffect(() => {
    getBattles().then((res: any) => {
      setBattles(res.battles || []);
      setLoading(false);
    });
  }, []);

  async function handleVote(battleId: string, promptKey: string) {
    const res: any = await (castVote as any)({
      data: { battle_id: battleId, voted_for: promptKey },
    });
    if (res?.success) {
      setVotedBattles((prev) => new Set(prev).add(battleId));
    }
  }

  return (
    <div className="relative min-h-screen hero-radial selection:bg-zinc-500/30">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pb-32 pt-16">
        <PageTransition>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-mono-display text-[10px] uppercase tracking-wider text-zinc-500">
                / battles
              </span>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
                Prompt Battles
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Vote for the best prompts. Winners earn badges and visibility.
              </p>
            </div>
            <Link
              to="/battle/leaderboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              <Trophy className="size-4" />
              Leaderboard
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="size-6 animate-spin text-zinc-500" />
            </div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
              {battles.map((b: any, i: number) => {
                const p1 = b.prompt_1 || {};
                const p2 = b.prompt_2 || {};
                const total = (b.votes_1 || 0) + (b.votes_2 || 0);
                const pct1 = total > 0 ? Math.round(((b.votes_1 || 0) / total) * 100) : 0;
                const pct2 = total > 0 ? Math.round(((b.votes_2 || 0) / total) * 100) : 0;
                return (
                  <motion.div
                    key={b.id}
                    variants={fadeUp}
                    custom={i}
                    className="rounded-xl bg-zinc-900/40 p-6 ring-1 ring-white/5"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Swords className="size-5 text-zinc-300" />
                        <h2 className="text-lg font-medium text-zinc-200">{b.title}</h2>
                      </div>
                      <span
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium ${
                          b.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-zinc-500/10 text-zinc-400"
                        }`}
                      >
                        {b.status === "active" && b.ends_at ? (
                          <>
                            <Clock className="size-3" />
                            {new Date(b.ends_at).toLocaleDateString()}
                          </>
                        ) : b.status === "active" ? (
                          "Active"
                        ) : (
                          "Closed"
                        )}
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        { ...p1, votes: b.votes_1 || 0, pct: pct1 },
                        { ...p2, votes: b.votes_2 || 0, pct: pct2 },
                      ].map((p: any, idx: number) => (
                        <div
                          key={idx}
                          className="relative rounded-xl p-5 ring-1 ring-white/10 bg-zinc-900/60"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs text-zinc-500">{p.author || "Unknown"}</span>
                            <span className="text-sm font-semibold text-zinc-200">
                              {p.votes} votes
                            </span>
                          </div>
                          <p className="mb-3 text-sm font-medium text-zinc-200">{p.title}</p>
                          <div className="mb-4 h-1.5 rounded-full bg-zinc-800">
                            <div
                              className="h-1.5 rounded-full bg-zinc-400 transition-all"
                              style={{ width: `${p.pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-500">{p.pct}%</span>
                          {b.status === "active" && !votedBattles.has(b.id) && (
                            <button
                              onClick={() =>
                                handleVote(b.id, idx === 0 ? b.prompt_1_id : b.prompt_2_id)
                              }
                              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-800 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
                            >
                              <Vote className="size-3.5" />
                              Vote for this prompt
                            </button>
                          )}
                          {votedBattles.has(b.id) && (
                            <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 py-2 text-xs font-medium text-emerald-400">
                              Vote cast
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-zinc-600">
                      <span className="flex items-center gap-1">
                        <Users className="size-3.5" />
                        {total} voters
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
