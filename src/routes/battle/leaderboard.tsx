import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Trophy, Medal, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/battle/leaderboard")({
  head: () => ({
    meta: [{ title: "Leaderboard — PromptOS" }],
  }),
  component: LeaderboardPage,
});

const topCreators = [
  { rank: 1, name: "@aria", wins: 24, battles: 32, winRate: 75, earnings: "$3,240" },
  { rank: 2, name: "@marcus", wins: 18, battles: 28, winRate: 64, earnings: "$2,180" },
  { rank: 3, name: "@kenji", wins: 15, battles: 22, winRate: 68, earnings: "$1,890" },
  { rank: 4, name: "@sana", wins: 12, battles: 20, winRate: 60, earnings: "$1,450" },
  { rank: 5, name: "@nova", wins: 10, battles: 18, winRate: 56, earnings: "$1,120" },
];

const topPrompts = [
  { rank: 1, name: "Ultra-Realistic Portraiture v4", author: "@aria", wins: 12, rating: 4.9 },
  { rank: 2, name: "Cold Email Generator Pro", author: "@marcus", wins: 9, rating: 4.7 },
  { rank: 3, name: "TypeScript Refactor Bot", author: "@kenji", wins: 8, rating: 4.8 },
  { rank: 4, name: "SEC Filing Summarizer", author: "@sana", wins: 7, rating: 4.6 },
  { rank: 5, name: "Cinematic Portrait Master", author: "@marcus", wins: 6, rating: 4.5 },
];

function LeaderboardPage() {
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
            Top-performing prompt creators and their battle records.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl bg-zinc-900/40 ring-1 ring-white/5">
            <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
              <Trophy className="size-4 text-amber-400" />
              <h2 className="text-sm font-medium text-zinc-200">Top Creators</h2>
            </div>
            <div className="divide-y divide-white/5">
              {topCreators.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
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
                      <span>{c.wins} wins</span>
                      <span>{c.battles} battles</span>
                      <span>{c.winRate}% win rate</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-emerald-400">{c.earnings}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-zinc-900/40 ring-1 ring-white/5">
            <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
              <TrendingUp className="size-4 text-zinc-400" />
              <h2 className="text-sm font-medium text-zinc-200">Top Prompts</h2>
            </div>
            <div className="divide-y divide-white/5">
              {topPrompts.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
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
                      <span>{p.wins} wins</span>
                      <span>★ {p.rating}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
