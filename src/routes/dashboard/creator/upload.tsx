import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Sparkles, ChevronLeft, Plus, X, Loader2, Image as ImageIcon } from "lucide-react";
import { createPrompt } from "@/utils/supabase-server";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export const Route = createFileRoute("/dashboard/creator/upload")({
  head: () => ({
    meta: [{ title: "Upload Prompt — PromptOS" }],
  }),
  component: UploadPromptPage,
});

const categories = [
  "Coding",
  "Web Development",
  "Business",
  "Marketing",
  "SEO",
  "Design",
  "Education",
  "Resume",
  "Productivity",
  "Content Creation",
  "Image Generation",
  "Video Generation",
];
const models = ["ChatGPT", "Claude", "Gemini", "Midjourney", "Flux", "Stable Diffusion", "Other"];

function UploadPromptPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("0");
  const [tags, setTags] = useState<string[]>([]);
  const [coverPreview, setCoverPreview] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
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
      let w = img.width,
        h = img.height;
      if (w > max || h > max) {
        if (w > h) {
          h = Math.round((h * max) / w);
          w = max;
        } else {
          w = Math.round((w * max) / h);
          h = max;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
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
        price: parseFloat(price) || 0,
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Upload Prompt</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Share your prompt with the community or sell it.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl bg-zinc-900/40 p-6 ring-1 ring-white/5"
        >
          {error && (
            <div className="rounded-lg bg-red-500/10 px-4 py-2 text-xs text-red-400 ring-1 ring-red-500/20">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Ultra-Realistic Portraiture v4"
              className="flex h-10 w-full items-center gap-2 rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this prompt does..."
              rows={3}
              className="flex w-full rounded-lg bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 resize-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Cover Image</label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith("image/")) {
                  setCoverFile(file);
                  const reader = new FileReader();
                  reader.onload = () => setCoverPreview(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition ${
                dragOver
                  ? "border-zinc-400 bg-zinc-800/50"
                  : "border-white/10 bg-zinc-900/60 hover:border-zinc-500"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setCoverFile(file);
                    const reader = new FileReader();
                    reader.onload = () => setCoverPreview(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {coverPreview ? (
                <div className="relative w-full max-w-xs">
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="w-full aspect-video object-cover rounded-lg ring-1 ring-white/10"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCoverFile(null);
                      setCoverPreview("");
                    }}
                    className="absolute -top-2 -right-2 rounded-full bg-red-500/20 p-1 text-red-400 hover:bg-red-500/30"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <ImageIcon className="size-8 text-zinc-500 mb-2" />
                  <p className="text-sm text-zinc-400">Drop an image here or click to browse</p>
                  <p className="text-xs text-zinc-600 mt-1">PNG, JPG, WebP (max 5MB)</p>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Prompt Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your prompt content here..."
              rows={10}
              className="flex w-full rounded-lg bg-zinc-900/60 px-3 py-2 font-mono text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full items-center rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Target Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="flex h-10 w-full items-center rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40"
              >
                <option value="">Select model</option>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Price (USD)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={0}
              step={0.01}
              className="flex h-10 w-40 items-center rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40"
            />
            {parseFloat(price) === 0 && (
              <p className="mt-1 text-[11px] text-zinc-600">Free prompts get more visibility</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Tags</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag and press Enter..."
                className="flex h-10 flex-1 items-center rounded-lg bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40"
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-lg bg-zinc-800 p-2.5 text-zinc-400 hover:text-zinc-200"
              >
                <Plus className="size-4" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((x) => x !== t))}
                      className="text-zinc-500 hover:text-zinc-200"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 py-2.5 text-sm font-medium text-zinc-950 ring-1 ring-zinc-100 transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {submitting ? "Publishing..." : "Publish prompt"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
