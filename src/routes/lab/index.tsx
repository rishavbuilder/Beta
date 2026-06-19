import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, RefreshCw, Save, Clock, History, Check, X } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { testPrompt } from "@/utils/openrouter";

export const Route = createFileRoute("/lab/")({
  head: () => ({
    meta: [
      { title: "Prompt Testing Lab — PromptOS" },
      { name: "description", content: "Test and compare your prompts across multiple models side-by-side." },
      { property: "og:title", content: "Prompt Testing Lab — PromptOS" },
      { property: "og:description", content: "Test your prompts against multiple models in real-time." },
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
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("lab_history") || "[]"); } catch { return []; }
  });
  const [saved, setSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  async function runTest() {
    if (!prompt.trim()) return;
    setRunning(true);
    setResults({});
    setShowHistory(false);
    const res: any = await (testPrompt as any)({ data: { prompt } });
    setResults(res.results || {});
    const updated = [prompt, ...history.filter((h: string) => h !== prompt)].slice(0, 20);
    setHistory(updated);
    localStorage.setItem("lab_history", JSON.stringify(updated));
    setRunning(false);
  }

  function handleSaveVersion() {
    if (!prompt.trim()) return;
    const versions = JSON.parse(localStorage.getItem("lab_versions") || "[]");
    versions.unshift({ prompt, results, savedAt: new Date().toISOString() });
    localStorage.setItem("lab_versions", JSON.stringify(versions.slice(0, 20)));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="relative min-h-screen hero-radial selection:bg-zinc-500/30">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pb-32 pt-16">
        <div className="mb-10">
          <span className="font-mono-display text-[10px] uppercase tracking-wider text-zinc-500">/ lab</span>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text md:text-4xl">Prompt Testing Lab</h1>
          <p className="mt-2 text-sm text-zinc-500">Test your prompts across multiple models and compare outputs side-by-side.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 ring-1 ring-white/[0.02] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-400">Test prompt</label>
                <span className="text-[11px] text-zinc-600">{prompt.length} chars</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt to test across multiple models..."
                rows={6}
                className="w-full resize-none bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600 leading-relaxed"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={runTest}
                disabled={running || !prompt.trim()}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-950 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative flex items-center gap-2">
                  {running ? <RefreshCw className="size-4 animate-spin" /> : <Play className="size-4" />}
                  {running ? "Testing..." : "Run test"}
                </div>
              </button>
              <button
                onClick={handleSaveVersion}
                disabled={!prompt.trim() || saved}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-300 ring-1 ring-white/10 transition-all hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
              >
                {saved ? <Check className="size-4 text-emerald-400" /> : <Save className="size-4" />}
                {saved ? "Saved!" : "Save version"}
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-300 ring-1 ring-white/10 transition-all hover:bg-zinc-800 hover:text-zinc-200"
              >
                <History className="size-4" />
                History ({history.length})
              </button>
            </div>

            {Object.keys(results).length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {models.map((m) => (
                  <div key={m.id} className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 ring-1 ring-white/[0.02]">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="size-2 rounded-full bg-current" />
                      <span className={`text-xs font-medium ${m.color}`}>{m.name}</span>
                    </div>
                    <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-400 min-h-[80px]">
                      {results[m.id] || "No output"}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 ring-1 ring-white/[0.02]">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-medium text-zinc-400">
                <Clock className="size-3.5" />
                Run History
              </h3>
              {history.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <div className="size-8 rounded-lg bg-zinc-800/50 flex items-center justify-center ring-1 ring-white/5">
                    <History className="size-4 text-zinc-600" />
                  </div>
                  <p className="text-xs text-zinc-600">No tests run yet</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => { setPrompt(h); setShowHistory(false); }}
                      className="w-full rounded-lg bg-zinc-800/50 px-3 py-2 text-left text-xs text-zinc-400 transition-colors hover:bg-zinc-800"
                    >
                      <span className="line-clamp-1">{h}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {showHistory && (
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 ring-1 ring-white/[0.02]">
                <h3 className="mb-3 flex items-center justify-between text-xs font-medium text-zinc-400">
                  <span className="flex items-center gap-2">
                    <Save className="size-3.5" />
                    Saved Versions
                  </span>
                  <button onClick={() => setShowHistory(false)} className="text-zinc-500 hover:text-zinc-200" aria-label="Close">
                    <X className="size-3.5" />
                  </button>
                </h3>
                {(() => {
                  const versions = JSON.parse(localStorage.getItem("lab_versions") || "[]");
                  if (versions.length === 0) {
                    return (
                      <div className="flex flex-col items-center gap-2 py-6 text-center">
                        <p className="text-xs text-zinc-600">No saved versions</p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                      {versions.map((v: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => { setPrompt(v.prompt); setResults(v.results || {}); }}
                          className="w-full rounded-lg bg-zinc-800/50 px-3 py-2 text-left text-xs text-zinc-400 transition-colors hover:bg-zinc-800"
                        >
                          <span className="line-clamp-1">{v.prompt}</span>
                          <span className="text-[10px] text-zinc-600 block mt-0.5">
                            {new Date(v.savedAt).toLocaleDateString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
