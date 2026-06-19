import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Bookmark,
  Share2,
  Copy,
  Check,
  Star,
  Clock,
  Download,
  ChevronLeft,
  Loader2,
  Send,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition, fadeUp, stagger } from "@/components/PageTransition";
import { useAuth } from "@/hooks/use-auth";
import {
  getPromptById,
  toggleFollow,
  toggleLike,
  toggleSave,
  incrementView,
  createReview,
  getPromptReviews,
} from "@/utils/supabase-server";

export const Route = createFileRoute("/prompt/$id")({
  loader: async ({ params }) => {
    try {
      const res = await getPromptById({ data: { id: params.id, userId: null } });
      return res;
    } catch {
      return { prompt: null };
    }
  },
  head: ({ loaderData }) => {
    const p = loaderData?.prompt;
    const title = p?.title ? `${p.title} — PromptOS` : "Prompt — PromptOS";
    const desc = p?.description || "View this prompt on PromptOS.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: `https://rishavbuilder-beta.vercel.app/prompt/${params.id}` },
      ],
    };
  },
  component: PromptDetailPage,
});

type PromptData = {
  id: string;
  title: string;
  content: string;
  description: string;
  category: string;
  model: string;
  price: number;
  rating: number;
  ratingCount: number;
  savesCount: number;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  tags: string[];
  author: { id: string; name: string; username: string; bio: string; followers: number };
  createdAt: string;
  reviews: {
    id: string;
    userId: string;
    user: string;
    rating: number;
    content: string;
    date: string;
  }[];
  liked: boolean;
  saved: boolean;
  following: boolean;
};

function PromptDetailPage() {
  const { id } = useParams({ from: "/prompt/$id" });
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [p, setP] = useState<PromptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    (incrementView as any)({ data: { prompt_id: id } });
    (getPromptById as any)({ data: { id, userId: user?.id || null } }).then((res: any) => {
      const d = res.prompt;
      if (d) {
        setP({
          id: d.id,
          title: d.title,
          content: d.content,
          description: d.description || "",
          category: d.categories?.name || "Uncategorized",
          model: d.model,
          price: Number(d.price) || 0,
          rating: Number(d.rating) || 0,
          ratingCount: d.rating_count || 0,
          savesCount: d.saves_count || 0,
          likesCount: d.likes_count || 0,
          commentsCount: d.comments_count || 0,
          viewsCount: d.views_count || 0,
          tags: d.tags || [],
          author: {
            id: d.user_id || "",
            name: d.users?.full_name || d.users?.username || "Anonymous",
            username: d.users?.username ? `@${d.users.username}` : "@anonymous",
            bio: d.users?.bio || "",
            followers: d.followers_count || 0,
          },
          createdAt: d.created_at
            ? new Date(d.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "",
          reviews: [],
          liked: !!d.liked,
          saved: !!d.saved,
          following: !!d.following,
        });
        setLiked(!!d.liked);
        setSaved(!!d.saved);
        setFollowing(!!d.following);
      }
      setLoading(false);
    });
    (getPromptReviews as any)({ data: { prompt_id: id } }).then((res: any) => {
      setReviews(res.reviews || []);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="relative min-h-screen hero-radial selection:bg-zinc-500/30">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 pb-32 pt-8 flex items-center justify-center min-h-[60vh]">
          <PageTransition>
            <Loader2 className="size-8 animate-spin text-zinc-500" />
          </PageTransition>
        </main>
        <Footer />
      </div>
    );
  }

  if (!p) {
    return (
      <div className="relative min-h-screen hero-radial selection:bg-zinc-500/30">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 pb-32 pt-8 text-center">
          <PageTransition>
            <h1 className="text-2xl text-zinc-400">Prompt not found</h1>
            <Link
              to="/explore"
              className="text-sm text-zinc-500 hover:text-zinc-200 mt-4 inline-block"
            >
              Back to explore
            </Link>
          </PageTransition>
        </main>
        <Footer />
      </div>
    );
  }

  function copyContent() {
    navigator.clipboard.writeText(p!.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative min-h-screen hero-radial selection:bg-zinc-500/30">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pb-32 pt-8">
        <PageTransition>
          <Link
            to="/explore"
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-200"
          >
            <ChevronLeft className="size-3.5" />
            Back to explore
          </Link>

          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-zinc-800 px-3 py-1 font-mono-display text-[10px] uppercase text-zinc-400">
                    {p.category}
                  </span>
                  <span className="rounded-full bg-zinc-800 px-3 py-1 font-mono-display text-[10px] uppercase text-zinc-400">
                    {p.model}
                  </span>
                  {p.price === 0 && (
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-mono-display text-[10px] uppercase text-emerald-400">
                      Free
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">{p.title}</h1>
                <p className="text-sm leading-relaxed text-zinc-400">{p.description}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl bg-zinc-900/60 p-6 ring-1 ring-white/10"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono-display text-[10px] uppercase tracking-wider text-zinc-500">
                    Prompt content
                  </span>
                  <button
                    onClick={copyContent}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
                  >
                    {copied ? (
                      <Check className="size-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-mono-display text-sm leading-relaxed text-zinc-300">
                  {p.content}
                </pre>
              </motion.div>

              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="flex flex-wrap gap-2"
              >
                {p.tags.map((tag) => (
                  <motion.div key={tag} variants={fadeUp}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/explore"
                        search={{ q: tag }}
                        className="rounded-full border border-white/10 bg-zinc-900/40 px-3.5 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                      >
                        #{tag}
                      </Link>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>

              <div className="flex flex-wrap items-center gap-4 border-y border-white/5 py-4">
                <button
                  onClick={async () => {
                    if (!user) return;
                    const res: any = await (toggleLike as any)({ data: { prompt_id: id } });
                    if (res && !res.error) {
                      setLiked(res.liked);
                      setP((prev) =>
                        prev
                          ? { ...prev, likesCount: prev.likesCount + (res.liked ? 1 : -1) }
                          : prev,
                      );
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    liked
                      ? "border-red-500/30 bg-red-500/10 text-red-400"
                      : "border-white/10 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  <Heart className={`size-3.5 ${liked ? "fill-red-400" : ""}`} />
                  {p.likesCount}
                </button>
                <button
                  onClick={async () => {
                    if (!user) return;
                    const res: any = await (toggleSave as any)({ data: { prompt_id: id } });
                    if (res && !res.error) {
                      setSaved(res.saved);
                      setP((prev) =>
                        prev
                          ? { ...prev, savesCount: prev.savesCount + (res.saved ? 1 : -1) }
                          : prev,
                      );
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    saved
                      ? "border-zinc-100/30 bg-zinc-100/10 text-zinc-200"
                      : "border-white/10 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  <Bookmark className={`size-3.5 ${saved ? "fill-zinc-200" : ""}`} />
                  {saved ? "Saved" : "Save"}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800"
                >
                  <Share2 className="size-3.5" />
                  Share
                </button>
                <span className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500">
                  <Clock className="size-3.5" />
                  {p.createdAt}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Download className="size-3.5" />
                  {p.savesCount.toLocaleString()} saves
                </span>
              </div>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-100">Reviews ({reviews.length})</h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`size-4 ${s <= Math.round(p.rating) ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-zinc-200">{p.rating.toFixed(1)}</span>
                  <span className="text-xs text-zinc-500">({p.ratingCount} ratings)</span>
                </div>

                {user && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!reviewContent.trim()) return;
                      setSubmittingReview(true);
                      const res: any = await (createReview as any)({
                        data: {
                          prompt_id: id,
                          rating: reviewRating,
                          content: reviewContent.trim(),
                        },
                      });
                      setSubmittingReview(false);
                      if (res?.review) {
                        setReviews((prev) => [res.review, ...prev]);
                        setReviewContent("");
                        setReviewRating(5);
                      }
                    }}
                    className="flex flex-col gap-3 rounded-lg bg-zinc-900/40 p-4 ring-1 ring-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">Your rating:</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} type="button" onClick={() => setReviewRating(s)}>
                            <Star
                              className={`size-4 ${s <= reviewRating ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="Write your review..."
                      rows={3}
                      className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 resize-none"
                    />
                    <button
                      type="submit"
                      disabled={submittingReview || !reviewContent.trim()}
                      className="inline-flex items-center gap-1.5 self-end rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:opacity-90 disabled:opacity-50"
                    >
                      {submittingReview ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Send className="size-3.5" />
                      )}
                      Submit review
                    </button>
                  </form>
                )}

                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {reviews.map((review: any) => (
                    <motion.div
                      key={review.id}
                      variants={fadeUp}
                      className="rounded-lg bg-zinc-900/40 p-4 ring-1 ring-white/5"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-300">
                          {review.users?.username || "anonymous"}
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`size-3 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-400">{review.content}</p>
                      <span className="mt-2 block text-[10px] text-zinc-600">
                        {review.created_at ? new Date(review.created_at).toLocaleDateString() : ""}
                      </span>
                    </motion.div>
                  ))}
                  {reviews.length === 0 && (
                    <p className="text-xs text-zinc-500 py-4 text-center">No reviews yet.</p>
                  )}
                </motion.div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="rounded-xl bg-zinc-900/60 p-6 ring-1 ring-white/10">
                <div className="mb-4 flex items-center gap-3">
                  <div className="size-12 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-900 ring-1 ring-white/10" />
                  <div>
                    <h3 className="text-sm font-medium text-zinc-200">{p.author.name}</h3>
                    <p className="text-xs text-zinc-500">{p.author.username}</p>
                  </div>
                </div>
                <p className="mb-4 text-xs text-zinc-400">{p.author.bio}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">
                    {p.author.followers.toLocaleString()} followers
                  </span>
                  {user && user.id !== p.author.id && (
                    <button
                      onClick={async () => {
                        const res: any = await (toggleFollow as any)({
                          data: { user_id: p.author.id },
                        });
                        if (res?.error) alert(res.error);
                        else {
                          setFollowing(res.following);
                          setP((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  author: {
                                    ...prev.author,
                                    followers: prev.author.followers + (res.following ? 1 : -1),
                                  },
                                }
                              : prev,
                          );
                        }
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        following
                          ? "bg-zinc-800 text-zinc-300 ring-1 ring-white/10"
                          : "bg-zinc-100 text-zinc-950 hover:opacity-90"
                      }`}
                    >
                      {following ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-zinc-900/60 p-6 ring-1 ring-white/10">
                <h3 className="mb-4 text-sm font-medium text-zinc-200">Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Views</span>
                    <span className="font-medium text-zinc-200">
                      {p.viewsCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Likes</span>
                    <span className="font-medium text-zinc-200">
                      {p.likesCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Saves</span>
                    <span className="font-medium text-zinc-200">
                      {p.savesCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Comments</span>
                    <span className="font-medium text-zinc-200">{p.commentsCount}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
