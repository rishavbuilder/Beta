import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Plus, Lock, Globe, Loader2, X, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { listCollections, createCollection } from "@/utils/supabase-server";
import { PageTransition, fadeUp, stagger } from "@/components/PageTransition";

export const Route = createFileRoute("/dashboard/collections/")({
  head: () => ({
    meta: [{ title: "Collections — PromptOS" }],
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

  function load() {
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

  return (
    <DashboardLayout>
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-zinc-900 p-6 ring-1 ring-white/10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-100">New Collection</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-zinc-500 hover:text-zinc-200"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="My collection"
                  className="flex h-10 w-full rounded-lg bg-zinc-800 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  placeholder="Optional description..."
                  className="flex w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={creating || !newName.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 py-2 text-sm font-medium text-zinc-950 hover:opacity-90 disabled:opacity-50"
              >
                {creating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {creating ? "Creating..." : "Create collection"}
              </button>
            </form>
          </div>
        </div>
      )}
      <div className="space-y-8">
        <PageTransition>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Collections</h1>
              <p className="mt-1 text-sm text-zinc-500">Organize your prompts into collections.</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 ring-1 ring-zinc-100 transition hover:opacity-90"
            >
              <Plus className="size-4" />
              New collection
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-zinc-500" />
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {collections.map((c: any, i: number) => (
                <motion.div
                  key={c.id}
                  variants={fadeUp}
                  custom={i}
                  className="group cursor-pointer rounded-xl bg-zinc-900/40 p-5 ring-1 ring-white/5 transition-colors hover:bg-zinc-900/60"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-800 ring-1 ring-white/10">
                      <FolderOpen className="size-5 text-zinc-300" />
                    </div>
                    {c.is_public !== false ? (
                      <Globe className="size-3.5 text-zinc-500" />
                    ) : (
                      <Lock className="size-3.5 text-zinc-500" />
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-zinc-200 mb-1">{c.name}</h3>
                  <p className="text-xs text-zinc-500 mb-3">{c.description || ""}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">{c.prompt_count || 0} prompts</span>
                    <button
                      onClick={() => alert("Collection options coming soon")}
                      className="text-zinc-500 hover:text-zinc-200"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </PageTransition>
      </div>
    </DashboardLayout>
  );
}
