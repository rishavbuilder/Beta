import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, ArrowLeft, ExternalLink, Trash2, FolderPlus, Edit3, X, Check, Sparkles } from "lucide-react";
import { Loader } from "@/components/Loader";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { listCollectionPrompts, removeFromCollection, addToCollection, listCollections, renameCollection } from "@/utils/supabase-server";
import { PageTransition, fadeUp, stagger } from "@/components/PageTransition";
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

export const Route = createFileRoute("/dashboard/collections/$id")({
  head: () => ({
    meta: [
      { title: "Collection — PromptOS" },
      { name: "description", content: "View prompts in this collection." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CollectionDetailPage,
});

function CollectionDetailPage() {
  const { id } = useParams({ from: "/dashboard/collections/$id" });
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showRename, setShowRename] = useState(false);
  const [renameName, setRenameName] = useState("");
  const [renameDesc, setRenameDesc] = useState("");
  const [renaming, setRenaming] = useState(false);

  const [removing, setRemoving] = useState<string | null>(null);

  const [movingPrompt, setMovingPrompt] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([
      (listCollectionPrompts as any)({ data: { collection_id: id } }),
      (listCollections as any)(),
    ]).then(([promptsRes, colRes]: [any, any]) => {
      setPrompts(promptsRes.prompts || []);
      setCollections((colRes.collections || []).filter((c: any) => c.id !== id));
      setLoading(false);
    });
  }

  useEffect(load, [id]);

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!renameName.trim()) return;
    setRenaming(true);
    await (renameCollection as any)({
      data: { collection_id: id, name: renameName.trim(), description: renameDesc.trim() },
    });
    setRenaming(false);
    setShowRename(false);
  }

  async function handleRemove(promptId: string) {
    await (removeFromCollection as any)({ data: { collection_id: id, prompt_id: promptId } });
    setRemoving(null);
    load();
  }

  async function handleMove(promptId: string, targetId: string) {
    await (addToCollection as any)({ data: { collection_id: targetId, prompt_id: promptId } });
    await (removeFromCollection as any)({ data: { collection_id: id, prompt_id: promptId } });
    setMovingPrompt(null);
    load();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <button
          onClick={() => navigate({ to: "/dashboard/collections" })}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 transition-colors group"
        >
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to collections
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text">
              Collection
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500">
              {prompts.length} {prompts.length === 1 ? "prompt" : "prompts"}
            </p>
          </div>
          <button
            onClick={() => {
              setRenameName("");
              setRenameDesc("");
              setShowRename(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-300 ring-1 ring-white/10 hover:bg-zinc-700 transition-all"
          >
            <Edit3 className="size-3.5" />
            Rename
          </button>
        </div>

        {showRename && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-xl border border-zinc-800/60 bg-zinc-950 p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-semibold text-zinc-100">Rename Collection</h2>
                <button
                  onClick={() => setShowRename(false)}
                  className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition"
                >
                  <X className="size-4" />
                </button>
              </div>
              <form onSubmit={handleRename} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Name</label>
                  <input
                    type="text"
                    value={renameName}
                    onChange={(e) => setRenameName(e.target.value)}
                    placeholder="Collection name"
                    className="flex h-10 w-full rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Description</label>
                  <textarea
                    value={renameDesc}
                    onChange={(e) => setRenameDesc(e.target.value)}
                    rows={3}
                    placeholder="Optional description..."
                    className="flex w-full rounded-lg bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 resize-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={renaming || !renameName.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 py-2.5 text-sm font-medium text-zinc-950 hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {renaming ? (
                    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 5.373 0 12 4z" />
                    </svg>
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  {renaming ? "Saving..." : "Save"}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        <AlertDialog
          open={!!removing}
          onOpenChange={(o) => { if (!o) setRemoving(null); }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove prompt?</AlertDialogTitle>
              <AlertDialogDescription>
                Remove this prompt from the collection? The prompt itself won't be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setRemoving(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleRemove(removing!)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : prompts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="size-12 rounded-xl bg-zinc-800/50 flex items-center justify-center ring-1 ring-white/5">
              <FileText className="size-6 text-zinc-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">No prompts in this collection</p>
              <p className="text-xs text-zinc-600 mt-1">Add prompts from the marketplace</p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-200 ring-1 ring-white/10 hover:bg-zinc-700 transition-all"
            >
              Browse prompts
            </Link>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            {prompts.map((p: any, i: number) => (
              <motion.div
                key={p.id}
                variants={fadeUp}
                custom={i}
                className="group relative"
              >
                <div className="flex items-center gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-4 py-3.5 transition-all hover:bg-zinc-800/30 hover:border-zinc-700/60">
                  <Link
                    to="/prompt/$id"
                    params={{ id: p.id }}
                    className="flex items-center gap-3 min-w-0 flex-1"
                  >
                    <div className="size-8 shrink-0 rounded-lg bg-zinc-800/80 ring-1 ring-white/5 flex items-center justify-center">
                      <FileText className="size-4 text-zinc-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-200 truncate">{p.title}</p>
                      <p className="text-xs text-zinc-500">
                        by {p.users?.username || "anonymous"} · {(p.saves_count || 0).toLocaleString()} saves
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMovingPrompt(movingPrompt === p.id ? null : p.id); }}
                        className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition"
                        title="Move to collection"
                      >
                        <FolderPlus className="size-3.5" />
                      </button>
                      {movingPrompt === p.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setMovingPrompt(null)} />
                          <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-zinc-800 bg-zinc-950 py-1 shadow-2xl">
                            <p className="px-3 py-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                              Move to collection
                            </p>
                            {collections.length === 0 ? (
                              <p className="px-3 py-2 text-xs text-zinc-600">No other collections</p>
                            ) : (
                              collections.map((c) => (
                                <button
                                  key={c.id}
                                  onClick={(e) => { e.stopPropagation(); handleMove(p.id, c.id); }}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition text-left"
                                >
                                  <FolderPlus className="size-3 shrink-0 text-zinc-500" />
                                  {c.name}
                                </button>
                              ))
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => setRemoving(p.id)}
                      className="rounded-lg p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Remove from collection"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
