import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Plus,
  ChevronUp,
  Pin,
  Loader2,
  X,
  Sparkles,
  Trash2,
  Send,
  ChevronDown,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition, fadeUp, stagger } from "@/components/PageTransition";
import {
  getDiscussions,
  createDiscussion,
  upvoteDiscussion,
  deleteDiscussion,
  getUserProfile,
  getDiscussionReplies,
  createDiscussionReply,
  getUserUpvotes,
} from "@/utils/supabase-server";

export const Route = createFileRoute("/community/")({
  head: () => ({
    meta: [
      { title: "Community — PromptOS" },
      {
        name: "description",
        content:
          "Join the PromptOS community. Discuss prompts, share ideas, and request new prompts.",
      },
      { property: "og:title", content: "Community — PromptOS" },
      {
        property: "og:description",
        content:
          "Discuss AI prompts, share ideas, and connect with other prompt engineers in the PromptOS community.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommunityPage,
});

const categories = [
  "All",
  "Tips",
  "Questions",
  "Share",
  "Requests",
  "Discussion",
  "Comparison",
  "Showcase",
];
const catOptions = categories.filter((c) => c !== "All");

function NewDiscussionModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Discussion");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    const res: any = await (createDiscussion as any)({
      data: { title: title.trim(), content: content.trim(), category },
    });
    setSubmitting(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setTitle("");
    setContent("");
    setCategory("Discussion");
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-zinc-900 p-6 ring-1 ring-white/10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">New Discussion</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              className="flex h-10 w-full rounded-lg bg-zinc-800 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Write your discussion..."
              className="flex w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 resize-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-10 w-full rounded-lg bg-zinc-800 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40"
            >
              {catOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 py-2 text-sm font-medium text-zinc-950 hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {submitting ? "Posting..." : "Post discussion"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CommunityPage() {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [replies, setReplies] = useState<Record<string, any[]>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visible, setVisible] = useState(10);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    if (selectedCategory === "All") return discussions;
    return discussions.filter((d) => d.category === selectedCategory);
  }, [discussions, selectedCategory]);

  function fetchDiscussions() {
    getDiscussions().then((res: any) => {
      setDiscussions(res.discussions || []);
      setLoading(false);
    });
  }

  function fetchUser() {
    getUserProfile().then((res: any) => {
      if (res.user) {
        setCurrentUserId(res.user.id);
        getUserUpvotes().then((u: any) => {
          if (u.upvoted_ids) setUpvoted(new Set(u.upvoted_ids));
        });
      }
    });
  }

  async function handleUpvote(id: string) {
    if (!currentUserId) return;
    const res: any = await upvoteDiscussion({ data: { id } });
    if (res.upvotes !== undefined) {
      setUpvoted((prev) => {
        const next = new Set(prev);
        if (res.upvoted) next.add(id);
        else next.delete(id);
        return next;
      });
      setDiscussions((prev) => prev.map((d) => (d.id === id ? { ...d, upvotes: res.upvotes } : d)));
    }
  }

  async function handleDelete(id: string) {
    const res: any = await deleteDiscussion({ data: { id } });
    if (res.success) {
      setDiscussions((prev) => prev.filter((d) => d.id !== id));
    } else {
      alert(res?.error || "Failed to delete");
    }
  }

  async function toggleReplies(discussionId: string) {
    if (expanded.has(discussionId)) {
      setExpanded((prev) => {
        const next = new Set(prev);
        next.delete(discussionId);
        return next;
      });
      return;
    }
    setExpanded((prev) => new Set(prev).add(discussionId));
    if (!replies[discussionId]) {
      setLoadingReplies((prev) => new Set(prev).add(discussionId));
      const res: any = await getDiscussionReplies({ data: { discussion_id: discussionId } });
      setReplies((prev) => ({ ...prev, [discussionId]: res.replies || [] }));
      setLoadingReplies((prev) => {
        const next = new Set(prev);
        next.delete(discussionId);
        return next;
      });
    }
  }

  async function handleAddReply(discussionId: string) {
    const text = replyText[discussionId]?.trim();
    if (!text || !currentUserId) return;
    const res: any = await createDiscussionReply({
      data: { discussion_id: discussionId, content: text },
    });
    if (res.reply) {
      setReplies((prev) => ({
        ...prev,
        [discussionId]: [...(prev[discussionId] || []), res.reply],
      }));
      setReplyText((prev) => ({ ...prev, [discussionId]: "" }));
      if (res.comment_count !== undefined) {
        setDiscussions((prev) =>
          prev.map((d) => (d.id === discussionId ? { ...d, comment_count: res.comment_count } : d)),
        );
      }
    } else {
      alert(res?.error || "Failed to reply");
    }
  }

  useEffect(() => {
    fetchDiscussions();
    fetchUser();
  }, []);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visible < filtered.length) {
          setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [visible, filtered.length]);

  return (
    <div className="relative min-h-screen hero-radial selection:bg-zinc-500/30">
      <Navbar />
      <NewDiscussionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={fetchDiscussions}
      />
      <main className="mx-auto max-w-5xl px-6 pb-32 pt-16">
        <PageTransition>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-mono-display text-[10px] uppercase tracking-wider text-zinc-500">
                / community
              </span>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
                Discussions
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Join the conversation. Share, discuss, and request prompts.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 ring-1 ring-zinc-100 transition hover:opacity-90"
            >
              <Plus className="size-4" />
              New discussion
            </button>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setSelectedCategory(c);
                  setVisible(PAGE_SIZE);
                }}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  c === selectedCategory
                    ? "border-zinc-100 bg-zinc-100 text-zinc-950"
                    : "border-white/10 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="size-6 animate-spin text-zinc-500" />
            </div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
              {filtered.slice(0, visible).map((d: any, i: number) => {
                const isUpvoted = upvoted.has(d.id);
                const isExpanded = expanded.has(d.id);
                const isLoadingReplies = loadingReplies.has(d.id);
                const discReplies = replies[d.id] || [];

                return (
                  <motion.div key={d.id} variants={fadeUp} custom={i}>
                    <div className="flex items-start gap-4 rounded-xl bg-zinc-900/40 p-5 ring-1 ring-white/5 transition-colors hover:bg-zinc-900/60">
                      <button
                        type="button"
                        onClick={() => handleUpvote(d.id)}
                        className={`mt-0.5 flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-colors ${
                          isUpvoted
                            ? "text-zinc-100 bg-zinc-800"
                            : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
                        }`}
                      >
                        <ChevronUp className="size-4" />
                        <span className="text-xs font-medium">{d.upvotes || 0}</span>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {d.is_pinned && <Pin className="size-3 text-zinc-500" />}
                          <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                            {d.category}
                          </span>
                        </div>
                        <h3 className="text-sm font-medium text-zinc-200">{d.title}</h3>
                        <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                          <span>{d.users?.username ? `@${d.users.username}` : "anonymous"}</span>
                          <span>·</span>
                          <span>
                            {d.created_at ? new Date(d.created_at).toLocaleDateString() : ""}
                          </span>
                          <span>·</span>
                          <button
                            type="button"
                            onClick={() => toggleReplies(d.id)}
                            className={`flex items-center gap-1 hover:text-zinc-200 transition-colors ${
                              isExpanded ? "text-zinc-200" : ""
                            }`}
                          >
                            <MessageCircle className="size-3" />
                            {d.comment_count || 0} replies
                            <ChevronDown
                              className={`size-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </button>
                        </div>
                      </div>
                      {currentUserId && d.user_id === currentUserId && (
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id)}
                          className="shrink-0 rounded-lg p-2 text-zinc-600 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Delete discussion"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="ml-16 mr-4 pb-4">
                        {isLoadingReplies ? (
                          <div className="flex items-center gap-2 py-3 text-xs text-zinc-500">
                            <Loader2 className="size-3 animate-spin" />
                            Loading replies...
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {discReplies.length === 0 && (
                              <p className="py-3 text-xs text-zinc-600">No replies yet.</p>
                            )}
                            {discReplies.map((reply: any) => (
                              <div
                                key={reply.id}
                                className="rounded-lg bg-zinc-900/30 px-4 py-3 ring-1 ring-white/5"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-zinc-300">
                                    {reply.users?.username || "anonymous"}
                                  </span>
                                  <span className="text-[10px] text-zinc-600">
                                    {reply.created_at
                                      ? new Date(reply.created_at).toLocaleDateString()
                                      : ""}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-400">{reply.content}</p>
                              </div>
                            ))}
                            {currentUserId && (
                              <div className="flex items-center gap-2 pt-2">
                                <input
                                  type="text"
                                  value={replyText[d.id] || ""}
                                  onChange={(e) =>
                                    setReplyText((prev) => ({ ...prev, [d.id]: e.target.value }))
                                  }
                                  placeholder="Write a reply..."
                                  className="flex-1 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleAddReply(d.id);
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddReply(d.id)}
                                  disabled={!replyText[d.id]?.trim()}
                                  className="rounded-lg bg-zinc-100 p-1.5 text-zinc-950 hover:opacity-90 disabled:opacity-30"
                                >
                                  <Send className="size-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
          {!loading && filtered.length > visible && (
            <div
              ref={sentinelRef}
              className="flex items-center justify-center py-8 text-xs text-zinc-500"
            >
              <Loader2 className="mr-2 size-3 animate-spin" />
              Loading more discussions...
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <p className="mt-4 text-center text-xs text-zinc-600">
              Showing {Math.min(visible, filtered.length)} of {filtered.length} discussions
            </p>
          )}
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
