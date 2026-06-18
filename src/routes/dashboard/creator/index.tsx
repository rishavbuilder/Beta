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
  Loader2,
  Trash2,
  ToggleLeft,
  ToggleRight,
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
    meta: [{ title: "Creator Dashboard — PromptOS" }],
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
      <div className="space-y-8">
        <PageTransition>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                Creator Dashboard
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Manage your prompts, track revenue, and grow your audience.
              </p>
            </div>
            <Link
              to="/dashboard/creator/upload"
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:opacity-90"
            >
              <Plus className="size-4" />
              Upload prompt
            </Link>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              { label: "Total Prompts", value: String(promptCount), icon: FileText },
              { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye },
              { label: "Total Saves", value: totalSaves.toLocaleString(), icon: Star },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                custom={i}
                className="rounded-xl bg-zinc-900/40 p-5 ring-1 ring-white/5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-zinc-500">{s.label}</span>
                  <s.icon className="size-4 text-zinc-500" />
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-semibold text-zinc-100">{s.value}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="rounded-xl bg-zinc-900/40 ring-1 ring-white/5">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <h2 className="text-sm font-medium text-zinc-200">Your Prompts</h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-5 animate-spin text-zinc-500" />
              </div>
            ) : prompts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                <Package className="size-8 text-zinc-600" />
                <p className="text-sm text-zinc-500">No prompts yet</p>
                <p className="text-xs text-zinc-600">Upload your first prompt to get started</p>
                <Link
                  to="/dashboard/creator/upload"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 ring-1 ring-white/10 transition hover:bg-zinc-700"
                >
                  <Upload className="size-4" />
                  Upload a prompt
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {prompts.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="size-8 shrink-0 rounded-lg bg-zinc-800 ring-1 ring-white/10 flex items-center justify-center">
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
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          p.is_published !== false
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-zinc-500/10 text-zinc-400"
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
                          <Loader2 className="size-3.5 animate-spin" />
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
        </PageTransition>
      </div>

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
