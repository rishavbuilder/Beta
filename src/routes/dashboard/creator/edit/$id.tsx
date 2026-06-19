import { createFileRoute, useParams, useNavigate, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Sparkles, Plus, X, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { Loader } from "@/components/Loader";
import { updatePrompt, getPromptById, uploadImage } from "@/utils/supabase-server";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export const Route = createFileRoute("/dashboard/creator/edit/$id")({
  head: () => ({
    meta: [
      { title: "Edit Prompt — PromptOS" },
      { name: "description", content: "Edit your prompt." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EditPromptPage,
});

const categories = [
  "Coding", "Web Development", "Business", "Marketing", "SEO",
  "Design", "Education", "Resume", "Productivity",
  "Content Creation", "Image Generation", "Video Generation",
];
const models = ["ChatGPT", "Claude", "Gemini", "Midjourney", "Flux", "Stable Diffusion", "Other"];

function EditPromptPage() {
  const { id } = useParams({ from: "/dashboard/creator/edit/$id" });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [model, setModel] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [coverPreview, setCoverPreview] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (getPromptById as any)({ data: { id } }).then((res: any) => {
      const p = res.prompt;
      if (p) {
        setTitle(p.title || "");
        setDescription(p.description || "");
        setContent(p.content || "");
        setCategory(p.categories?.name || "");
        setModel(p.model || "");
        setTags(p.tags || []);
        setCoverPreview(p.cover_image || "");
      }
      setLoading(false);
    });
  }, [id]);

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and prompt content are required.");
      return;
    }
    setSubmitting(true);
    setError("");

    let coverDataUrl = coverPreview;
    if (coverFile) {
      const reader = new FileReader();
      coverDataUrl = await new Promise((resolve) => {
        reader.onload = async () => {
          const base64 = reader.result as string;
          const res: any = await (uploadImage as any)({ data: { base64, fileName: coverFile.name } });
          resolve(res?.url || coverPreview);
        };
        reader.readAsDataURL(coverFile);
      });
    }

    const res: any = await (updatePrompt as any)({
      data: {
        prompt_id: id,
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        category_name: category,
        model: model || "Other",
        tags,
        ...(coverDataUrl ? { cover_image: coverDataUrl } : {}),
      },
    });
    setSubmitting(false);
    if (res.error) {
      setError(res.error);
    } else {
      navigate({ to: "/dashboard/creator" });
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32"><Loader /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <button
          onClick={() => navigate({ to: "/dashboard/creator" })}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 transition-colors group"
        >
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to creator dashboard
        </button>

        <div>
          <h1 className="text-xl font-semibold tracking-tight text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text">Edit Prompt</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Update your prompt details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-6">
          {error && (
            <div className="rounded-lg bg-red-500/10 px-4 py-2.5 text-xs text-red-400 ring-1 ring-red-500/20 flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-red-400 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="flex h-10 w-full rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="flex w-full rounded-lg bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 resize-none transition-all" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Cover Image</label>
            <div onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-800 bg-zinc-900/60 p-8 transition-all hover:border-zinc-600"
            >
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setCoverFile(file);
                    const reader = new FileReader();
                    reader.onload = () => setCoverPreview(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} />
              {coverPreview ? (
                <div className="relative w-full max-w-xs">
                  <img src={coverPreview} alt="Preview" className="w-full aspect-video object-cover rounded-lg ring-1 ring-white/10" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); setCoverFile(null); setCoverPreview(""); }}
                    className="absolute -top-2 -right-2 rounded-full bg-red-500/20 p-1.5 text-red-400 hover:bg-red-500/30 transition-all">
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="size-10 rounded-lg bg-zinc-800/80 flex items-center justify-center ring-1 ring-white/5 mb-3">
                    <ImageIcon className="size-5 text-zinc-500" />
                  </div>
                  <p className="text-sm text-zinc-400">Click to change cover image</p>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Prompt Content *</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10}
              className="flex w-full rounded-lg bg-zinc-900/60 px-3 py-2.5 font-mono text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 resize-none transition-all" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Target Model</label>
              <select value={model} onChange={(e) => setModel(e.target.value)}
                className="flex h-10 w-full rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all">
                <option value="">Select model</option>
                {models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Tags</label>
            <div className="flex items-center gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Add a tag and press Enter..."
                className="flex h-10 flex-1 rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all" />
              <button type="button" onClick={addTag}
                className="rounded-lg bg-zinc-800/80 p-2.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-all">
                <Plus className="size-4" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800/80 px-3 py-1 text-xs text-zinc-300 ring-1 ring-white/5">
                    #{t}
                    <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}
                      className="text-zinc-500 hover:text-zinc-200 transition-colors">
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting}
            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 py-2.5 text-sm font-medium text-zinc-950 ring-1 ring-zinc-100 transition hover:opacity-90 disabled:opacity-50">
            {submitting ? (
              <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 5.373 0 12 4z" />
              </svg>
            ) : <Sparkles className="size-4" />}
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
