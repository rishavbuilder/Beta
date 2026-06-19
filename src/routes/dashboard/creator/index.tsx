import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FileText,
  Star,
  Plus,
  Eye,
  Upload,
  Package,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowUpRight,
  Edit3,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { listMyPrompts, deletePrompt, togglePromptPublished } from "@/utils/supabase-server";
import { PageTransition, fadeUp, stagger } from "@/components/PageTransition";

export const Route = createFileRoute("/dashboard/creator/")({
  head: () => ({
    meta: [
      { title: "Creator Dashboard — PromptOS" },
      { name: "description", content: "Manage your prompts, track performance, and publish new prompts." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CreatorDashboardPage,
});

function CreatorDashboardPage() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<any>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    listMyPrompts().then((res: any) => {
      setPrompts(res.prompts || []);
      setLoading(false);
    });
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    const res: any = await (deletePrompt as any)({ data: { prompt_id: id } });
    if (res?.error) {
      alert(res.error);
      return;
    }
    load();
  }

  async function handleToggle(p: any) {
    setTogglingId(p.id);
    await (togglePromptPublished as any)({
      data: { prompt_id: p.id, is_published: p.is_published === false },
    });
    setTogglingId(null);
    load();
  }

  const promptCount = prompts.length;
  const totalViews = prompts.reduce((a: number, p: any) => a + (p.views_count || 0), 0);
  const totalSaves = prompts.reduce((a: number, p: any) => a + (p.saves_count || 0), 0);

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text">
                Creator Dashboard
              </h1>
              <p className="mt-0.5 text-sm text-zinc-500">
                Manage your prompts and grow your audience.
              </p>
            </div>
            <Link
              to="/dashboard/creator/upload"
              className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:opacity-90"
            >
              <Plus className="size-4" />
              Upload prompt
              <ArrowUpRight className="size-3 text-zinc-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              { label: "Total Prompts", value: String(promptCount), icon: FileText, gradient: "from-blue-500/10 via-blue-500/5 to-transparent", border: "border-blue-500/20" },
              { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, gradient: "from-amber-500/10 via-amber-500/5 to-transparent", border: "border-amber-500/20" },
              { label: "Total Saves", value: totalSaves.toLocaleString(), icon: Star, gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent", border: "border-emerald-500/20" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                custom={i}
                className="group relative overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 hover:border-zinc-700/60 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px ${s.border}`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-zinc-500">{s.label}</span>
                    <div className="size-8 rounded-lg bg-zinc-800/80 flex items-center justify-center ring-1 ring-white/5">
                      <s.icon className="size-4 text-zinc-400" />
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-semibold text-zinc-100">{s.value}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800/50 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <FileText className="size-4 text-zinc-500" />
                <h2 className="text-sm font-medium text-zinc-200">Your Prompts</h2>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <svg className="size-6 animate-spin text-zinc-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 5.373 0 12 4z" />
                  </svg>
                  <p className="text-xs text-zinc-500">Loading prompts...</p>
                </div>
              </div>
            ) : prompts.length === 0 ? (
              <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
                <div className="size-12 rounded-xl bg-zinc-800/50 flex items-center justify-center ring-1 ring-white/5">
                  <Package className="size-6 text-zinc-600" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">No prompts yet</p>
                  <p className="text-xs text-zinc-600 mt-1">Upload your first prompt to get started</p>
                </div>
                <Link
                  to="/dashboard/creator/upload"
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-200 ring-1 ring-white/10 hover:bg-zinc-700 transition-all"
                >
                  <Upload className="size-3.5" />
                  Upload a prompt
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {prompts.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-zinc-800/20">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="size-8 shrink-0 rounded-lg bg-zinc-800/80 ring-1 ring-white/5 flex items-center justify-center">
                        <FileText className="size-4 text-zinc-400" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          to="/prompt/$id"
                          params={{ id: p.id }}
                          className="text-sm font-medium text-zinc-200 hover:text-zinc-100 truncate block"
                        >
                          {p.title}
                        </Link>
                        <p className="text-xs text-zinc-500 truncate">
                          {p.categories?.name || "Uncategorized"} ·{" "}
                          {(p.saves_count || 0).toLocaleString()} saves
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Link
                        to="/dashboard/creator/edit/$id"
                        params={{ id: p.id }}
                        className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition"
                        title="Edit"
                      >
                        <Edit3 className="size-3.5" />
                      </Link>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                          p.is_published !== false
                            ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                            : "bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/20"
                        }`}
                      >
                        {p.is_published !== false ? "Published" : "Draft"}
                      </span>
                      <button
                        onClick={() => handleToggle(p)}
                        disabled={togglingId === p.id}
                        className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition"
                        title={p.is_published !== false ? "Set as Draft" : "Publish"}
                      >
                        {togglingId === p.id ? (
                          <svg className="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 5.373 0 12 4z" />
                          </svg>
                        ) : p.is_published !== false ? (
                          <ToggleRight className="size-3.5" />
                        ) : (
                          <ToggleLeft className="size-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => setDeleting(p)}
                        className="rounded-lg p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Delete"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageTransition>

      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => {
          if (!o) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete prompt?</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete "{deleting?.title}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleting(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleting?.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
