import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Sparkles, Plus, X, Image as ImageIcon, ArrowUpRight, Tag, Globe, FileCode, Eye, BookMarked } from "lucide-react";
import { createPrompt } from "@/utils/supabase-server";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export const Route = createFileRoute("/dashboard/creator/upload")({
  head: () => ({
    meta: [
      { title: "Upload Prompt — PromptOS" },
      { name: "description", content: "Upload and publish a new prompt to the PromptOS marketplace." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: UploadPromptPage,
});

const categories = [
  { name: "Coding", icon: FileCode },
  { name: "Web Development", icon: Globe },
  { name: "Business", icon: BookMarked },
  { name: "Marketing", icon: Globe },
  { name: "SEO", icon: Globe },
  { name: "Design", icon: Eye },
  { name: "Education", icon: BookMarked },
  { name: "Resume", icon: FileCode },
  { name: "Productivity", icon: Sparkles },
  { name: "Content Creation", icon: BookMarked },
  { name: "Image Generation", icon: Eye },
  { name: "Video Generation", icon: Eye },
];

const models = ["ChatGPT", "Claude", "Gemini", "Midjourney", "Flux", "Stable Diffusion", "Other"];

function UploadPromptPage() {
  const navigate = useNavigate();
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

    let coverDataUrl = "";
    if (coverFile) {
      const img = await createImageBitmap(coverFile);
      const max = 800;
      let w = img.width, h = img.height;
      if (w > max || h > max) {
        if (w > h) { h = Math.round((h * max) / w); w = max; }
        else { w = Math.round((w * max) / h); h = max; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      coverDataUrl = canvas.toDataURL("image/webp", 0.7);
      img.close();
    }

    const res: any = await (createPrompt as any)({
      data: {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        category_name: category,
        model: model || "Other",
        tags,
        cover_image: coverDataUrl || undefined,
      },
    });
    setSubmitting(false);
    if (res.error) {
      setError(res.error);
    } else {
      navigate({ to: "/dashboard/creator" });
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text">
              Upload Prompt
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500">
              Share your prompt with the community.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-900/60 px-3 py-2 ring-1 ring-white/5">
              <span className="text-zinc-400">Fields marked with</span>
              <span className="text-red-400">*</span>
              <span className="text-zinc-400">are required</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8 xl:grid-cols-3">
          {/* Main form */}
          <div className="space-y-6 xl:col-span-2">
            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-500/10 px-4 py-3 text-xs text-red-400 ring-1 ring-red-500/20 flex items-center gap-2.5">
                <div className="size-1.5 rounded-full bg-red-400 shrink-0" />
                {error}
              </div>
            )}

            {/* Basic info */}
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-zinc-800/50 pb-3">
                <div className="size-7 rounded-lg bg-zinc-800/80 ring-1 ring-white/5 flex items-center justify-center">
                  <FileCode className="size-3.5 text-zinc-400" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-zinc-200">Basic Information</h2>
                  <p className="text-[11px] text-zinc-500">Title, description, and content of your prompt</p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-zinc-400">
                  Title <span className="text-red-400">*</span>
                  <span className="ml-auto text-zinc-600">{title.length}/120</span>
                </label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value.slice(0, 120))}
                  placeholder="e.g., Ultra-Realistic Portraiture v4"
                  className="flex h-10 w-full rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all" />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-zinc-400">
                  Description <span className="text-zinc-600">(optional)</span>
                  <span className="ml-auto text-zinc-600">{description.length}/500</span>
                </label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 500))} rows={3}
                  placeholder="Describe what this prompt does, ideal use cases, and what makes it special..."
                  className="flex w-full rounded-lg bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 resize-none transition-all" />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-zinc-400">
                  Prompt Content <span className="text-red-400">*</span>
                  <span className="ml-auto text-zinc-600">{content.length.toLocaleString()} chars</span>
                </label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12}
                  placeholder="Paste your full prompt content here..."
                  className="flex w-full rounded-lg bg-zinc-900/60 px-3 py-2.5 font-mono text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 resize-none transition-all" />
              </div>
            </div>

            {/* Categorization */}
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-zinc-800/50 pb-3">
                <div className="size-7 rounded-lg bg-zinc-800/80 ring-1 ring-white/5 flex items-center justify-center">
                  <Tag className="size-3.5 text-zinc-400" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-zinc-200">Categorization</h2>
                  <p className="text-[11px] text-zinc-500">Category, model, and tags to help users find your prompt</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="flex h-10 w-full rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all appearance-none cursor-pointer">
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Target Model</label>
                  <select value={model} onChange={(e) => setModel(e.target.value)}
                    className="flex h-10 w-full rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all appearance-none cursor-pointer">
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
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 rounded-full bg-zinc-800/80 px-2.5 py-1 text-[11px] text-zinc-300 ring-1 ring-white/5">
                        #{t}
                        <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}
                          className="text-zinc-500 hover:text-zinc-200 transition-colors">
                          <X className="size-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cover image */}
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-zinc-800/50 pb-3">
                <div className="size-7 rounded-lg bg-zinc-800/80 ring-1 ring-white/5 flex items-center justify-center">
                  <ImageIcon className="size-3.5 text-zinc-400" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-zinc-200">Cover Image</h2>
                  <p className="text-[11px] text-zinc-500">Optional · 16:9 recommended</p>
                </div>
              </div>
              <div onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-800 bg-zinc-900/60 p-6 transition-all hover:border-zinc-600 group"
              >
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { setCoverFile(file); const r = new FileReader(); r.onload = () => setCoverPreview(r.result as string); r.readAsDataURL(file); }
                  }} />
                {coverPreview ? (
                  <div className="relative w-full">
                    <img src={coverPreview} alt="" className="w-full aspect-video object-cover rounded-lg ring-1 ring-white/10" />
                    <button type="button" onClick={(e) => { e.stopPropagation(); setCoverFile(null); setCoverPreview(""); }}
                      className="absolute -top-2 -right-2 rounded-full bg-red-500/20 p-1.5 text-red-400 hover:bg-red-500/30 transition-all">
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="size-10 rounded-lg bg-zinc-800/80 flex items-center justify-center ring-1 ring-white/5 mb-3 group-hover:bg-zinc-700/80 transition-all">
                      <ImageIcon className="size-5 text-zinc-500" />
                    </div>
                    <p className="text-sm text-zinc-400">Upload cover image</p>
                    <p className="text-xs text-zinc-600 mt-1">PNG, JPG, WebP · 16:9</p>
                  </>
                )}
              </div>
            </div>

            {/* Publish */}
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-zinc-800/50 pb-3">
                <div className="size-7 rounded-lg bg-zinc-800/80 ring-1 ring-white/5 flex items-center justify-center">
                  <Sparkles className="size-3.5 text-zinc-400" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-zinc-200">Publish</h2>
                  <p className="text-[11px] text-zinc-500">Review before publishing</p>
                </div>
              </div>

              <div className="rounded-lg bg-zinc-800/30 p-3 space-y-2">
                {[
                  { label: "Title", value: title || <span className="italic text-zinc-600">Not set</span> },
                  { label: "Category", value: category || <span className="italic text-zinc-600">Not set</span> },
                  { label: "Model", value: model || <span className="italic text-zinc-600">Not set</span> },
                  { label: "Tags", value: tags.length ? tags.slice(0, 3).join(", ") + (tags.length > 3 ? ` +${tags.length - 3}` : "") : <span className="italic text-zinc-600">None</span> },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">{item.label}</span>
                    <span className="text-zinc-300 truncate ml-2 max-w-[140px]">{item.value}</span>
                  </div>
                ))}
              </div>

              <button type="submit" disabled={submitting}
                className="group relative w-full overflow-hidden rounded-lg bg-zinc-100 py-2.5 text-sm font-medium text-zinc-950 ring-1 ring-zinc-100 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative flex items-center justify-center gap-2">
                  {submitting ? (
                    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 5.373 0 12 4z" />
                    </svg>
                  ) : <Sparkles className="size-4" />}
                  {submitting ? "Publishing..." : "Publish prompt"}
                  {!submitting && <ArrowUpRight className="size-3 text-zinc-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                </div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
