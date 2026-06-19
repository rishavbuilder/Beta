import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Plus, Lock, Globe, X, Sparkles, Trash2, ExternalLink, Bookmark, ArrowUpRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { listCollections, createCollection, deleteCollection } from "@/utils/supabase-server";
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

export const Route = createFileRoute("/dashboard/collections/")({
  head: () => ({
    meta: [
      { title: "Collections — PromptOS" },
      { name: "description", content: "Your saved prompt collections on PromptOS." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<any>(null);

  function load() {
    setLoading(true);
    listCollections().then((res: any) => {
      setCollections(res.collections || []);
      setLoading(false);
    });
  }

  useEffect(load, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    const res: any = await (createCollection as any)({
      data: { name: newName.trim(), description: newDesc.trim() },
    });
    setCreating(false);
    if (res.collection) {
      setShowCreate(false);
      setNewName("");
      setNewDesc("");
      load();
    }
  }

  async function handleDelete(id: string) {
    const res: any = await (deleteCollection as any)({ data: { collection_id: id } });
    if (!res?.error) {
      setDeleting(null);
      load();
    }
  }

  return (
    <DashboardLayout>
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-xl border border-zinc-800/60 bg-zinc-950 p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-100">New Collection</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="My collection"
                  className="flex h-10 w-full rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  placeholder="Optional description..."
                  className="flex w-full rounded-lg bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 resize-none transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  className="peer size-4 appearance-none rounded border border-zinc-700 bg-zinc-800 checked:border-zinc-400 checked:bg-zinc-100 transition-all cursor-pointer"
                />
                <svg
                  className="absolute size-4 p-0.5 text-zinc-950 opacity-0 peer-checked:opacity-100 pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <label htmlFor="isPublic" className="text-xs text-zinc-400 cursor-pointer select-none">Make public</label>
              </div>
              <button
                type="submit"
                disabled={creating || !newName.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 py-2.5 text-sm font-medium text-zinc-950 hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {creating ? (
                  <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 5.373 0 12 4z" />
                  </svg>
                ) : (
                  <Sparkles className="size-4" />
                )}
                {creating ? "Creating..." : "Create collection"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => { if (!o) setDeleting(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection?</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete "{deleting?.name}"? Prompts in this collection will not be deleted.
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

      <PageTransition>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text">Collections</h1>
              <p className="mt-0.5 text-sm text-zinc-500">Organize your prompts into collections.</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="group inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:opacity-90"
            >
              <Plus className="size-4" />
              New collection
              <ArrowUpRight className="size-3 text-zinc-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <svg className="size-6 animate-spin text-zinc-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 5.373 0 12 4z" />
                </svg>
                <p className="text-xs text-zinc-500">Loading collections...</p>
              </div>
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {collections.length === 0 ? (
                <div className="col-span-full flex flex-col items-center gap-4 py-16 text-center">
                  <div className="size-12 rounded-xl bg-zinc-800/50 flex items-center justify-center ring-1 ring-white/5">
                    <FolderOpen className="size-6 text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">No collections yet</p>
                    <p className="text-xs text-zinc-600 mt-1">Create your first collection to organize prompts</p>
                  </div>
                </div>
              ) : (
                collections.map((c: any, i: number) => (
                  <Link
                    key={c.id}
                    to="/dashboard/collections/$id"
                    params={{ id: c.id }}
                  >
                    <motion.div
                      variants={fadeUp}
                      custom={i}
                      className="group relative overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 transition-all duration-200 hover:bg-zinc-800/30 hover:border-zinc-700/60 hover:shadow-lg hover:shadow-black/10"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="size-10 rounded-lg bg-zinc-800/80 flex items-center justify-center ring-1 ring-white/5">
                          <FolderOpen className="size-5 text-zinc-300" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {c.is_public !== false ? (
                            <Globe className="size-3.5 text-zinc-500" />
                          ) : (
                            <Lock className="size-3.5 text-zinc-500" />
                          )}
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleting(c); }}
                            className="rounded-lg p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
                            title="Delete collection"
                            aria-label="Delete collection"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-zinc-200 mb-1 group-hover:text-zinc-100 transition-colors">{c.name}</h3>
                      <p className="text-xs text-zinc-500 mb-4 line-clamp-2">{c.description || "No description"}</p>
                      <div className="flex items-center justify-between text-xs pt-3 border-t border-zinc-800/50">
                        <span className="text-zinc-500">{c.prompt_count || 0} prompts</span>
                        <div className="flex items-center gap-2">
                          {c.users?.username && (
                            <span className="text-zinc-600">by {c.users.username}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))
              )}
            </motion.div>
          )}
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
