import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Languages, Shuffle, Copy, Check } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/PageTransition";
import { optimizePrompt } from "@/utils/openrouter";

export const Route = createFileRoute("/optimizer/")({
  head: () => ({
    meta: [
      { title: "Prompt Optimizer — PromptOS" },
      {
        name: "description",
        content:
          "Optimize, rewrite, expand, and translate your AI prompts using our advanced prompt optimizer.",
      },
    ],
  }),
  component: OptimizerPage,
});

const actions = [
  { id: "improve", label: "Improve", icon: Sparkles },
  { id: "expand", label: "Expand", icon: RefreshCw },
  { id: "rewrite", label: "Rewrite", icon: Shuffle },
  { id: "translate", label: "Translate", icon: Languages },
];

const models = ["ChatGPT", "Claude", "Gemini", "Midjourney", "Flux"];

function OptimizerPage() {
  const [input, setInput] = useState("");
  const [action, setAction] = useState("improve");
  const [targetModel, setTargetModel] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleOptimize() {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    const res: any = await (optimizePrompt as any)({
      data: { prompt: input, action, targetModel },
    });
    setOutput(res.result || "No output generated");
    setLoading(false);
  }

  function handleConvert(model: string) {
    setTargetModel(model);
  }

  return (
    <div className="relative min-h-screen hero-radial selection:bg-zinc-500/30">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pb-32 pt-16">
        <PageTransition>
          <div className="mb-10 text-center">
            <span className="font-mono-display text-[10px] uppercase tracking-wider text-zinc-500">
              / optimizer
            </span>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
              AI Prompt Optimizer
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Improve, expand, rewrite, or convert your prompts for any AI model.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex gap-2">
                {actions.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAction(a.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      action === a.id
                        ? "bg-zinc-100 text-zinc-950"
                        : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 ring-1 ring-white/10"
                    }`}
                  >
                    <a.icon className="size-3.5" />
                    {a.label}
                  </button>
                ))}
              </div>
              <div className="rounded-xl bg-zinc-900/60 p-4 ring-1 ring-white/10">
                <label className="mb-2 block text-xs font-medium text-zinc-400">Your prompt</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your AI prompt here..."
                  rows={10}
                  className="w-full resize-none bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                />
              </div>
              <button
                onClick={handleOptimize}
                disabled={loading || !input.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 py-2.5 text-sm font-medium text-zinc-950 ring-1 ring-zinc-100 transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {loading
                  ? "Optimizing..."
                  : `${action.charAt(0).toUpperCase() + action.slice(1)} prompt`}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-zinc-400">Convert for:</span>
                {models.map((m) => (
                  <button
                    key={m}
                    onClick={() => handleConvert(m)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      targetModel === m
                        ? "bg-zinc-100 text-zinc-950"
                        : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 ring-1 ring-white/10"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="rounded-xl bg-zinc-900/60 p-4 ring-1 ring-white/10">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-400">Optimized result</label>
                  {output && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(output);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200"
                    >
                      {copied ? (
                        <Check className="size-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  )}
                </div>
                <pre className="min-h-[260px] whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                  {output || "Your optimized prompt will appear here..."}
                </pre>
              </div>
            </motion.div>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
