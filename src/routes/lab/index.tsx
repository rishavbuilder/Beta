import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, RefreshCw, Save, Clock, History, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { testPrompt } from "@/utils/openrouter";

export const Route = createFileRoute("/lab/")({
  head: () => ({
    meta: [
      { title: "Prompt Testing Lab — PromptOS" },
      {
        name: "description",
        content: "Test and compare your AI prompts across multiple models side-by-side.",
      },
      { property: "og:title", content: "Prompt Testing Lab — PromptOS" },
      { property: "og:description", content: "Test your AI prompts against GPT-4o, Claude, Gemini and more in real-time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LabPage,
});

const models = [
  { id: "openai/gpt-4o", name: "GPT-4o", color: "text-emerald-400" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5", color: "text-amber-400" },
  { id: "google/gemini-1.5-pro", name: "Gemini 1.5", color: "text-blue-400" },
];

function LabPage() {
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<string[]>([]);

  async function runTest() {
    if (!prompt.trim()) return;
    setRunning(true);
    setResults({});
    const res: any = await (testPrompt as any)({ data: { prompt } });
    setResults(res.results || {});
    setHistory((h) => [prompt, ...h].slice(0, 10));
    setRunning(false);
  }

  return (
    <div className="relative min-h-screen hero-radial selection:bg-zinc-500/30">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pb-32 pt-16">
        <div className="mb-10">
          <span className="font-mono-display text-[10px] uppercase tracking-wider text-zinc-500">
            / lab
          </span>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
            Prompt Testing Lab
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Test your prompts across multiple models and compare outputs side-by-side.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl bg-zinc-900/60 p-4 ring-1 ring-white/10">
              <label className="mb-2 block text-xs font-medium text-zinc-400">Test prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt to test across multiple models..."
                rows={6}
                className="w-full resize-none bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={runTest}
                disabled={running || !prompt.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:opacity-90 disabled:opacity-50"
              >
                {running ? (
                  <RefreshCw className="size-4 animate-spin" />
                ) : (
                  <Play className="size-4" />
                )}
                {running ? "Testing..." : "Run test"}
              </button>
              <button
                onClick={() => alert("Save version coming soon")}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                <Save className="size-4" />
                Save version
              </button>
              <button
                onClick={() => alert("History coming soon")}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                <History className="size-4" />
                History
              </button>
            </div>

            {Object.keys(results).length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {models.map((m) => (
                  <div key={m.id} className="rounded-xl bg-zinc-900/60 p-4 ring-1 ring-white/10">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="size-2 rounded-full bg-current" />
                      <span className={`text-xs font-medium ${m.color}`}>{m.name}</span>
                    </div>
                    <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-400">
                      {results[m.id] || "No output"}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-zinc-900/60 p-4 ring-1 ring-white/10">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-medium text-zinc-400">
                <Clock className="size-3.5" />
                Test History
              </h3>
              {history.length === 0 ? (
                <p className="text-xs text-zinc-600">No tests run yet</p>
              ) : (
                <div className="space-y-2">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(h)}
                      className="w-full rounded-lg bg-zinc-800/50 px-3 py-2 text-left text-xs text-zinc-400 transition-colors hover:bg-zinc-800"
                    >
                      <span className="line-clamp-1">{h}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
