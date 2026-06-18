import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, SlidersHorizontal, Bookmark, Sparkles, Loader2, X } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition, fadeUp, stagger } from "@/components/PageTransition";
import { listPrompts } from "@/utils/supabase-server";

interface ExploreSearch {
  q?: string;
  category?: string;
  model?: string;
  sort?: string;
  free?: string;
}

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, string>): ExploreSearch => ({
    q: search.q || "",
    category: search.category || "",
    model: search.model || "",
    sort: search.sort || "",
    free: search.free || "",
  }),
  head: () => ({
    meta: [
      { title: "Explore Prompts — PromptOS" },
      {
        name: "description",
        content:
          "Browse thousands of high-performance prompts for ChatGPT, Claude, Midjourney, Flux and more. Filter by model, category, and price.",
      },
      { property: "og:title", content: "Explore Prompts — PromptOS" },
      {
        property: "og:description",
        content:
          "The marketplace for engineered prompts. Search, filter, and deploy across every major AI model.",
      },
    ],
  }),
  component: ExplorePage,
});

type Prompt = {
  id: string;
  title: string;
  desc: string;
  category: string;
  model: string;
  price: number;
  rating: number;
  saves: number;
  createdAt: number;
  img: string;
  coverImage: string;
  author: string;
};

const CATEGORIES = [
  "All",
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
const MODELS = [
  "All models",
  "GPT-4o",
  "Claude 3.5",
  "Gemini 1.5",
  "Midjourney v6",
  "Flux Pro",
  "Stable Diffusion 3",
  "DALL-E 3",
];
const SORTS = [
  { id: "trending", label: "Trending" },
  { id: "newest", label: "Newest" },
  { id: "top", label: "Top rated" },
  { id: "price-low", label: "Price: low to high" },
  { id: "price-high", label: "Price: high to low" },
] as const;

const PAGE_SIZE = 9;

function ExplorePage() {
  const search = useSearch({ from: "/explore" });
  const navigate = useNavigate();
  const [query, setQuery] = useState(search.q || "");
  const [category, setCategory] = useState(categoryFromSlug(search.category || "") || "All");
  const [model, setModel] = useState(search.model || "All models");
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>(
    (search.sort as (typeof SORTS)[number]["id"]) || "trending",
  );
  const [priceMax, setPriceMax] = useState(50);
  const [freeOnly, setFreeOnly] = useState(search.free === "true");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    setLoadingData(true);
    listPrompts().then((res) => {
      const mapped: Prompt[] = (res.prompts || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        desc: p.description || "",
        category: p.categories?.name || "Uncategorized",
        model: p.model,
        price: Number(p.price) || 0,
        rating: Number(p.rating) || 0,
        saves: p.saves_count || 0,
        createdAt: new Date(p.created_at).getTime(),
        img: p.users?.avatar_url || "",
        coverImage: p.cover_image || "",
        author: p.users?.username || "anonymous",
      }));
      setPrompts(mapped);
      setLoadingData(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = prompts.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (model !== "All models" && p.model !== model) return false;
      if (freeOnly && p.price !== 0) return false;
      if (!freeOnly && p.price > priceMax) return false;
      if (q && !`${p.title} ${p.desc} ${p.category} ${p.model}`.toLowerCase().includes(q))
        return false;
      return true;
    });
    switch (sort) {
      case "newest":
        list.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "top":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "price-low":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        list.sort((a, b) => b.price - a.price);
        break;
      default:
        list.sort((a, b) => b.saves - a.saves);
    }
    return list;
  }, [query, category, model, sort, priceMax, freeOnly, prompts]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [query, category, model, sort, priceMax, freeOnly]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        const [e] = entries;
        if (e.isIntersecting && visible < filtered.length && !loading) {
          setLoading(true);
          const t = setTimeout(() => {
            setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length));
            setLoading(false);
          }, 450);
          return () => clearTimeout(t);
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [visible, filtered.length, loading]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  function handleCategoryChange(c: string) {
    setCategory(c);
    navigate({
      to: "/explore",
      search: { category: c === "All" ? undefined : slugFromCategory(c) },
    });
  }

  return (
    <div className="relative min-h-screen hero-radial selection:bg-zinc-500/30">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 pb-32 pt-12">
        <PageTransition>
          <header className="mb-10 flex flex-col gap-3">
            <span className="font-mono-display text-[10px] uppercase tracking-wider text-zinc-500">
              / marketplace
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
              Explore prompts
            </h1>
            <p className="max-w-2xl text-sm text-zinc-500">
              {prompts.length.toLocaleString()} engineered prompts across 12 categories. Filter,
              preview, and deploy in seconds.
            </p>
          </header>

          <div className="sticky top-14 z-30 -mx-2 mb-8 rounded-xl border border-white/5 glass-card px-4 py-3 backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex h-10 flex-1 items-center gap-2 rounded-lg bg-zinc-900/60 px-3 ring-1 ring-white/10 focus-within:ring-zinc-400/40">
                <Search className="size-4 shrink-0 text-zinc-500" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, model, or use-case…"
                  className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-zinc-500 hover:text-zinc-200"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="cursor-pointer appearance-none rounded-lg border border-white/10 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 outline-none"
                >
                  {MODELS.map((m) => (
                    <option key={m} value={m} className="bg-zinc-900">
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="cursor-pointer appearance-none rounded-lg border border-white/10 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 outline-none"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id} className="bg-zinc-900">
                      {s.label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={freeOnly}
                    onChange={(e) => setFreeOnly(e.target.checked)}
                    className="size-3 accent-zinc-100"
                  />
                  Free only
                </label>
                {!freeOnly && (
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900/40 px-3 py-2">
                    <span className="font-mono-display text-[10px] uppercase tracking-wider text-zinc-500">
                      ≤ ${priceMax}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="h-1 w-24 accent-zinc-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => handleCategoryChange(c)}
                  className={
                    "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors " +
                    (active
                      ? "border-zinc-100 bg-zinc-100 text-zinc-950"
                      : "border-white/10 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100")
                  }
                >
                  {c}
                </button>
              );
            })}
          </div>

          {!loadingData && (
            <div className="mb-4 flex items-center justify-between text-xs text-zinc-500">
              <span>
                <span className="text-zinc-200">{filtered.length}</span> results
                {category !== "All" && <span> in {category}</span>}
              </span>
              <span className="font-mono-display text-[10px] uppercase tracking-wider">
                showing {shown.length}
              </span>
            </div>
          )}

          {loadingData ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="size-6 animate-spin text-zinc-500" />
            </div>
          ) : shown.length === 0 ? (
            <EmptyState
              onReset={() => {
                setQuery("");
                setCategory("All");
                setModel("All models");
                setFreeOnly(false);
                setPriceMax(50);
              }}
            />
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {shown.map((p, i) => (
                <PromptCard key={p.id} p={p} i={i} />
              ))}
            </motion.div>
          )}

          <div ref={sentinelRef} className="mt-12 flex items-center justify-center">
            {hasMore ? (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Loader2 className="size-4 animate-spin" />
                Loading more prompts…
              </div>
            ) : shown.length > 0 ? (
              <span className="font-mono-display text-[10px] uppercase tracking-wider text-zinc-600">
                — end of feed —
              </span>
            ) : null}
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}

function slugFromCategory(cat: string): string {
  return cat.toLowerCase().replace(/\s+/g, "-");
}

function categoryFromSlug(slug: string): string | null {
  const match = CATEGORIES.find((c) => slugFromCategory(c) === slug);
  return match || null;
}

function PromptCard({ p, i }: { p: Prompt; i: number }) {
  const colors = [
    "from-zinc-700 to-zinc-900",
    "from-zinc-800 to-zinc-950",
    "from-zinc-600 to-zinc-900",
  ];
  const grad = colors[i % colors.length];
  const initials = p.author.slice(0, 2).toUpperCase();

  return (
    <motion.article
      variants={fadeUp}
      custom={i}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="group relative flex flex-col gap-4 rounded-xl p-4 ring-1 ring-white/10 transition-colors hover:bg-zinc-900/40"
    >
      <Link to="/prompt/$id" params={{ id: p.id }} className="block">
        <div className="relative aspect-video w-full overflow-hidden rounded-[10px] bg-zinc-900 ring-1 ring-white/5">
          {p.coverImage ? (
            <img
              src={p.coverImage}
              alt={p.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : p.img ? (
            <img
              src={p.img}
              alt={p.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div
              className={`h-full w-full bg-gradient-to-br ${grad} flex items-center justify-center`}
            >
              <span className="text-4xl font-bold text-zinc-600">{initials}</span>
            </div>
          )}
          <div className="absolute left-2 top-2 rounded-md bg-zinc-950/70 px-2 py-1 font-mono-display text-[9px] uppercase tracking-wider text-zinc-200 backdrop-blur">
            {p.model}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert("Save feature coming soon");
            }}
            className="absolute right-2 top-2 grid size-7 place-items-center rounded-md bg-zinc-950/70 text-zinc-300 backdrop-blur transition-colors hover:text-zinc-100"
          >
            <Bookmark className="size-3.5" />
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono-display text-[10px] uppercase text-zinc-500">
              {p.category}
            </span>
            <span className="text-[10px] text-zinc-600">{p.saves.toLocaleString()} saves</span>
          </div>
          <h3 className="text-sm font-medium text-zinc-200">{p.title}</h3>
          <p className="line-clamp-2 text-xs leading-normal text-zinc-500">{p.desc}</p>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <div className="size-5 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 ring-1 ring-white/10" />
            {p.author}
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-400">★ {p.rating.toFixed(1)}</span>
          </div>
          <span
            className={
              "text-xs font-medium " + (p.price === 0 ? "text-emerald-400" : "text-zinc-100")
            }
          >
            {p.price === 0 ? "Free" : `$${p.price}`}
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 py-20 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-zinc-900 ring-1 ring-white/10">
        <Sparkles className="size-5 text-zinc-400" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-zinc-200">No prompts match your filters</h3>
        <p className="mt-1 text-xs text-zinc-500">Try widening the search or clearing filters.</p>
      </div>
      <button
        onClick={onReset}
        className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:opacity-90"
      >
        Reset filters
      </button>
    </div>
  );
}
