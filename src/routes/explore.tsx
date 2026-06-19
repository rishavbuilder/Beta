import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Bookmark, BookmarkCheck, FolderPlus, Sparkles, X } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition, fadeUp, stagger } from "@/components/PageTransition";
import { SkeletonPromptCard } from "@/components/Skeletons";
import { listPrompts, toggleSave, listCollections, addToCollection, listFollowingPrompts } from "@/utils/supabase-server";
import { useAuth } from "@/hooks/use-auth";

interface ExploreSearch {
  q?: string;
  category?: string;
  model?: string;
  sort?: string;
}

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, string>): ExploreSearch => ({
    q: search.q || undefined,
    category: search.category || undefined,
    model: search.model || undefined,
    sort: search.sort || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Explore Prompts — PromptOS" },
      {
        name: "description",
        content:
          "Browse thousands of high-performance prompts. Filter by category and model.",
      },
      { property: "og:title", content: "Explore Prompts — PromptOS" },
      {
        property: "og:description",
        content:
          "The marketplace for crafted prompts. Search, filter, and find what you need.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
const SORTS = [
  { id: "trending", label: "Trending" },
  { id: "newest", label: "Newest" },
  { id: "top", label: "Top rated" },
] as const;

const PAGE_SIZE = 9;

function ExplorePage() {
  const search = useSearch({ from: "/explore" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState(search.q || "");
  const [category, setCategory] = useState(categoryFromSlug(search.category || "") || "All");
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>(
    (search.sort as (typeof SORTS)[number]["id"]) || "trending",
  );
  const [page, setPage] = useState(0);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [collections, setCollections] = useState<any[]>([]);
  const [addingToPrompt, setAddingToPrompt] = useState<string | null>(null);
  const [feed, setFeed] = useState<"all" | "following">("all");

  useEffect(() => {
    listCollections().then((res: any) => setCollections(res.collections || []));
  }, []);
  useEffect(() => {
    setLoadingData(true);
    if (feed === "following") {
      listFollowingPrompts().then((res: any) => {
        const mapped: Prompt[] = (res.prompts || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          desc: p.description || "",
          category: p.categories?.name || "Uncategorized",
          model: p.model,
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
    } else {
      listPrompts().then((res) => {
        const mapped: Prompt[] = (res.prompts || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          desc: p.description || "",
          category: p.categories?.name || "Uncategorized",
          model: p.model,
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
    }
  }, [feed]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = prompts.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
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
      default:
        list.sort((a, b) => b.saves - a.saves);
    }
    return list;
  }, [query, category, sort, prompts]);

  useEffect(() => {
    setPage(0);
  }, [query, category, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const shown = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleCategoryChange(c: string) {
    setCategory(c);
    navigate({
      to: "/explore",
      search: { category: c === "All" ? undefined : slugFromCategory(c) },
    });
  }

  async function handleToggleSave(promptId: string) {
    if (!user) return;
    const res: any = await (toggleSave as any)({ data: { prompt_id: promptId } });
    if (res && !res.error) {
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (res.saved) next.add(promptId);
        else next.delete(promptId);
        return next;
      });
      setPrompts((prev: Prompt[]) =>
        prev.map((x) =>
          x.id === promptId ? { ...x, saves: x.saves + (res.saved ? 1 : -1) } : x,
        ),
      );
    }
  }

  async function handleAddToCollection(promptId: string, collectionId: string) {
    await (addToCollection as any)({ data: { collection_id: collectionId, prompt_id: promptId } });
    setAddingToPrompt(null);
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 selection:bg-zinc-500/30">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 pb-32 pt-16">
        <PageTransition>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 flex flex-col gap-4"
          >
            <span className="font-mono-display text-[10px] uppercase tracking-widest text-zinc-600">
              / marketplace
            </span>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-zinc-100 md:text-5xl">
                  Explore prompts
                </h1>
                <p className="mt-2 text-sm text-zinc-500">
                  {prompts.length.toLocaleString()} prompts across {CATEGORIES.length - 1} categories
                </p>
              </div>
            </div>
          </motion.div>

          {/* Search + Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-3 rounded-xl bg-zinc-900/80 px-4 py-3 ring-1 ring-white/10 focus-within:ring-zinc-400/40 transition-all">
                <Search className="size-4 shrink-0 text-zinc-500" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search prompts..."
                  className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                  aria-label="Search prompts"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-zinc-500 hover:text-zinc-200" aria-label="Clear search">
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="cursor-pointer appearance-none rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-xs text-zinc-200 outline-none ring-1 ring-white/5 focus:ring-zinc-400/40"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-zinc-900">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 flex flex-wrap gap-2"
          >
            {user && (
              <button
                onClick={() => { setFeed(feed === "following" ? "all" : "following"); setCategory("All"); }}
                className={
                  "rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200 " +
                  (feed === "following"
                    ? "border-zinc-100 bg-zinc-100 text-zinc-950 shadow-lg shadow-zinc-100/10"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200")
                }
              >
                Following
              </button>
            )}
            {feed !== "following" && CATEGORIES.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => handleCategoryChange(c)}
                  className={
                    "rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200 " +
                    (active
                      ? "border-zinc-100 bg-zinc-100 text-zinc-950 shadow-lg shadow-zinc-100/10"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200")
                  }
                >
                  {c}
                </button>
              );
            })}
          </motion.div>

          {/* Results count */}
          {!loadingData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6 flex items-center justify-between text-xs text-zinc-600"
            >
              <span>
                {feed === "following" ? (
                  <><span className="text-zinc-300 font-medium">{filtered.length}</span> prompts from creators you follow</>
                ) : (
                  <><span className="text-zinc-300 font-medium">{filtered.length}</span> results
                  {category !== "All" && <span> in <span className="text-zinc-300">{category}</span></span>}</>
                )}
              </span>
            </motion.div>
          )}

          {/* Grid */}
          {loadingData ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <SkeletonPromptCard key={i} />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <EmptyState
              onReset={() => {
                setQuery("");
                setCategory("All");
              }}
            />
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {shown.map((p, i) => (
                <PromptCard key={p.id} p={p} i={i} user={user} savedIds={savedIds} onToggleSave={handleToggleSave} collections={collections} addingToPrompt={addingToPrompt} setAddingToPrompt={setAddingToPrompt} onAddToCollection={handleAddToCollection} />
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-14 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-2.5 text-xs font-medium text-zinc-300 transition-all hover:bg-zinc-800 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-30"
              >
                ← Previous
              </button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={
                      "grid size-9 place-items-center rounded-lg text-xs font-medium transition-all " +
                      (i === page
                        ? "bg-zinc-100 text-zinc-950 shadow-lg shadow-zinc-100/10"
                        : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300")
                    }
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-2.5 text-xs font-medium text-zinc-300 transition-all hover:bg-zinc-800 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
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

function PromptCard({ p, i, user, savedIds, onToggleSave, collections, addingToPrompt, setAddingToPrompt, onAddToCollection }: {
  p: Prompt; i: number; user: any; savedIds: Set<string>; onToggleSave: (id: string) => void;
  collections: any[]; addingToPrompt: string | null; setAddingToPrompt: (id: string | null) => void; onAddToCollection: (promptId: string, collectionId: string) => void;
}) {
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
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative flex flex-col gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-900/60 hover:shadow-lg hover:shadow-black/20"
    >
      <Link to="/prompt/$id" params={{ id: p.id }} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-white/5">
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
              <span className="text-2xl font-bold text-zinc-600">{initials}</span>
            </div>
          )}
          <div className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-zinc-300 backdrop-blur-sm">
            {p.model}
          </div>
          <div className="absolute right-1.5 top-1.5 flex gap-1">
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!user) return;
                onToggleSave(p.id);
              }}
              className={`grid size-6 place-items-center rounded-md backdrop-blur-sm transition-all ${
                savedIds.has(p.id)
                  ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                  : "bg-black/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
              aria-label={savedIds.has(p.id) ? "Remove bookmark" : "Bookmark prompt"}
            >
              {savedIds.has(p.id) ? (
                <BookmarkCheck className="size-3" />
              ) : (
                <Bookmark className="size-3" />
              )}
            </button>
            {user && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAddingToPrompt(addingToPrompt === p.id ? null : p.id);
                  }}
                  className="grid size-6 place-items-center rounded-md bg-black/60 text-zinc-400 backdrop-blur-sm transition-all hover:bg-zinc-800 hover:text-zinc-100"
                  aria-label="Add to collection"
                >
                  <FolderPlus className="size-3" />
                </button>
                {addingToPrompt === p.id && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={(e) => { e.stopPropagation(); setAddingToPrompt(null); }}
                  />
                )}
                {addingToPrompt === p.id && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-zinc-800 bg-zinc-950 py-1 shadow-2xl">
                    <p className="px-3 py-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                      Add to collection
                    </p>
                    {collections.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-zinc-600">No collections yet</p>
                    ) : (
                      collections.map((c) => (
                        <button
                          key={c.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAddToCollection(p.id, c.id);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition text-left"
                        >
                          <FolderPlus className="size-3 shrink-0 text-zinc-500" />
                          {c.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-zinc-500">
              {p.category}
            </span>
            <span className="text-[10px] text-zinc-600">{p.saves.toLocaleString()} saves</span>
          </div>
          <h3 className="text-xs font-semibold text-zinc-200 leading-snug">{p.title}</h3>
          <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-500">{p.desc}</p>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-zinc-800/60 pt-2">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <div className="size-4 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 ring-1 ring-white/10" />
            {p.author}
          </div>
          <span className="text-[11px] text-zinc-600">★ {p.rating.toFixed(1)}</span>
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
