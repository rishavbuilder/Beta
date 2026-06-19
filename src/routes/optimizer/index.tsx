import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Languages, Shuffle, Copy, Check, ArrowUpRight, Wand2, FileText, Zap, Type } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition, fadeUp, stagger } from "@/components/PageTransition";
import { optimizePrompt } from "@/utils/openrouter";

export const Route = createFileRoute("/optimizer/")({
  head: () => ({
    meta: [
      { title: "Prompt Optimizer — PromptOS" },
      {
        name: "description",
        content: "Optimize, rewrite, expand, and translate your prompts using our advanced prompt optimizer.",
      },
      { property: "og:title", content: "Prompt Optimizer — PromptOS" },
      { property: "og:description", content: "Improve your prompts with optimization, rewriting, and translation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OptimizerPage,
});

const actions = [
  { id: "improve", label: "Improve", icon: Sparkles, desc: "Enhance clarity and structure" },
  { id: "expand", label: "Expand", icon: RefreshCw, desc: "Add details and depth" },
  { id: "rewrite", label: "Rewrite", icon: Shuffle, desc: "Rephrase for different tone" },
  { id: "translate", label: "Translate", icon: Languages, desc: "Convert to another language" },
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
    setTargetModel(targetModel === model ? "" : model);
  }

  return (
    <div className="relative min-h-screen hero-radial selection:bg-zinc-500/30">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pb-32 pt-16">
        <PageTransition>
          {/* Hero */}
          <div className="mb-12 text-center">
            <span className="font-mono-display text-[10px] uppercase tracking-wider text-zinc-500">
              / optimizer
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text md:text-4xl">
              Prompt Optimizer
            </h1>
            <p className="mt-2 text-sm text-zinc-500 max-w-md mx-auto">
              Improve, expand, rewrite, or convert your prompts for any model.
            </p>
          </div>

          {/* Action tabs */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mb-8 flex flex-wrap justify-center gap-2"
          >
            {actions.map((a, i) => (
              <motion.button
                key={a.id}
                variants={fadeUp}
                custom={i}
                onClick={() => setAction(a.id)}
                className={`group relative flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
                  action === a.id
                    ? "bg-zinc-100 text-zinc-950 shadow-lg shadow-zinc-900/20"
                    : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 ring-1 ring-white/10 hover:ring-zinc-600/50"
                }`}
              >
                <a.icon className={`size-4 ${action === a.id ? "text-zinc-700" : "text-zinc-500"}`} />
                <div className="text-left">
                  <span>{a.label}</span>
                  <p className={`text-[10px] hidden sm:block ${action === a.id ? "text-zinc-600" : "text-zinc-600"}`}>
                    {a.desc}
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Main grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-zinc-800/80 ring-1 ring-white/5 flex items-center justify-center">
                    <FileText className="size-3.5 text-zinc-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-zinc-200">Your prompt</h2>
                    <p className="text-[10px] text-zinc-500">Paste or type the prompt you want to optimize</p>
                  </div>
                </div>
                <span className="text-[11px] text-zinc-600">{input.length} chars</span>
              </div>

              <div className="group rounded-xl border border-zinc-800/60 bg-zinc-900/40 ring-1 ring-white/[0.02] transition-all focus-within:border-zinc-600 focus-within:ring-zinc-500/20">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your prompt here..."
                  rows={12}
                  className="w-full resize-none bg-transparent px-5 py-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 leading-relaxed"
                />
              </div>

              <button
                onClick={handleOptimize}
                disabled={loading || !input.trim()}
                className="group relative w-full overflow-hidden rounded-xl bg-zinc-100 py-2.5 text-sm font-medium text-zinc-950 ring-1 ring-zinc-100 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <Wand2 className="size-4" />
                  )}
                  {loading
                    ? "Optimizing..."
                    : `${action.charAt(0).toUpperCase() + action.slice(1)} prompt`}
                  {!loading && <ArrowUpRight className="size-3 text-zinc-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                </div>
              </button>
            </motion.div>

            {/* Output panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-zinc-800/80 ring-1 ring-white/5 flex items-center justify-center">
                    <Zap className="size-3.5 text-zinc-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-zinc-200">Optimized result</h2>
                    <p className="text-[10px] text-zinc-500">{output ? `${output.length} chars` : "Waiting for input..."}</p>
                  </div>
                </div>
                {output && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(output);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-800/60 px-2.5 py-1.5 text-xs text-zinc-400 ring-1 ring-white/10 hover:text-zinc-200 hover:bg-zinc-700 transition-all"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>

              <div className="group rounded-xl border border-zinc-800/60 bg-zinc-900/40 ring-1 ring-white/[0.02] transition-all">
                <pre className={`min-h-[288px] whitespace-pre-wrap px-5 py-4 text-sm leading-relaxed ${output ? "text-zinc-200" : "text-zinc-600"}`}>
                  {output || "Your optimized prompt will appear here..."}
                </pre>
              </div>

              {/* Model conversion chips */}
              <div className="flex flex-wrap items-center gap-2 px-1">
                <span className="flex items-center gap-1 text-[11px] text-zinc-500 mr-1">
                  <Type className="size-3" />
                  Convert for:
                </span>
                {models.map((m) => (
                  <button
                    key={m}
                    onClick={() => handleConvert(m)}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
                      targetModel === m
                        ? "bg-zinc-100 text-zinc-950 ring-1 ring-zinc-100"
                        : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 ring-1 ring-white/10 hover:ring-zinc-600/50"
                    }`}
                  >
                    {m}
                  </button>
                ))}
                {targetModel && (
                  <button
                    onClick={() => setTargetModel("")}
                    className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors ml-1"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
