import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Plus,
  ChevronUp,
  Pin,
  X,
  Sparkles,
  Trash2,
  Send,
  Search,
  Users,
  MessageSquare,
} from "lucide-react";
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
import { SkeletonDiscussionCard } from "@/components/Skeletons";
import { Loader } from "@/components/Loader";
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
  deleteDiscussionReply,
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
          "Share ideas and connect with other prompt enthusiasts in the PromptOS community.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommunityPage,
});

const CATEGORIES = [
  "All",
  "Tips",
  "Questions",
  "Share",
  "Requests",
  "Discussion",
  "Comparison",
  "Showcase",
];

const SORTS = [
  { id: "newest", label: "New" },
  { id: "popular", label: "Top" },
  { id: "replies", label: "Comments" },
] as const;

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

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

  useEffect(() => {
    if (open) {
      setTitle("");
      setContent("");
      setCategory("Discussion");
      setError("");
    }
  }, [open]);

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
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Create a post</h2>
            <p className="mt-0.5 text-xs text-zinc-500">Share something with the community</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-colors" aria-label="Close modal">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              className="flex h-10 w-full rounded-lg bg-zinc-800/80 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all placeholder:text-zinc-600"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Write your post..."
              className="flex w-full rounded-lg bg-zinc-800/80 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all placeholder:text-zinc-600 resize-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-10 w-full rounded-lg bg-zinc-800/80 px-3 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all"
            >
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c} className="bg-zinc-900">
                  {c}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 py-2.5 text-sm font-medium text-zinc-950 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="size-4 animate-pulse">...</span>
                Posting...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Post
              </>
            )}
          </button>
        </form>
      </motion.div>
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
  const [submittingReply, setSubmittingReply] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "replies">("newest");
  const [visible, setVisible] = useState(10);
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const replyInputRef = useRef<HTMLInputElement | null>(null);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    let list = discussions;
    if (selectedCategory !== "All") {
      list = list.filter((d) => d.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (d) =>
          d.title?.toLowerCase().includes(q) ||
          d.content?.toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    switch (sortBy) {
      case "popular":
        sorted.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
        break;
      case "replies":
        sorted.sort((a, b) => (b.comment_count || 0) - (a.comment_count || 0));
        break;
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
    }
    return sorted;
  }, [discussions, selectedCategory, searchQuery, sortBy]);

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
    const prevUpvoted = upvoted.has(id);
    setUpvoted((prev) => {
      const next = new Set(prev);
      if (prevUpvoted) next.delete(id);
      else next.add(id);
      return next;
    });
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, upvotes: (d.upvotes || 0) + (prevUpvoted ? -1 : 1) }
          : d,
      ),
    );
    const res: any = await (upvoteDiscussion as any)({ data: { id } });
    if (res.error) {
      setUpvoted((prev) => {
        const next = new Set(prev);
        if (prevUpvoted) next.add(id);
        else next.delete(id);
        return next;
      });
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, upvotes: (d.upvotes || 0) + (prevUpvoted ? 1 : -1) }
            : d,
        ),
      );
    }
  }

  async function handleDelete(id: string) {
    const res: any = await (deleteDiscussion as any)({ data: { id } });
    if (res.success) {
      setDiscussions((prev) => prev.filter((d) => d.id !== id));
    }
    setDeleting(null);
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
      const res: any = await (getDiscussionReplies as any)({
        data: { discussion_id: discussionId },
      });
      setReplies((prev) => ({ ...prev, [discussionId]: res.replies || [] }));
      setLoadingReplies((prev) => {
        const next = new Set(prev);
        next.delete(discussionId);
        return next;
      });
    }
  }

  async function handleAddReply(discussionId: string, parentId?: string) {
    const text = replyText[discussionId]?.trim();
    if (!text || !currentUserId) return;
    setSubmittingReply((prev) => new Set(prev).add(discussionId));
    const payload: any = { discussion_id: discussionId, content: text };
    if (parentId) payload.parent_id = parentId;
    const res: any = await (createDiscussionReply as any)({ data: payload });
    setSubmittingReply((prev) => {
      const next = new Set(prev);
      next.delete(discussionId);
      return next;
    });
    if (res.reply) {
      const newReply = { ...res.reply, parent_id: parentId || null };
      setReplies((prev) => ({
        ...prev,
        [discussionId]: [...(prev[discussionId] || []), newReply],
      }));
      setReplyText((prev) => ({ ...prev, [discussionId]: "" }));
      setReplyingTo(null);
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === discussionId
            ? { ...d, comment_count: (d.comment_count || 0) + 1 }
            : d,
        ),
      );
    }
  }

  async function handleDeleteReply(discussionId: string, replyId: string) {
    const res: any = await (deleteDiscussionReply as any)({
      data: { id: replyId, discussion_id: discussionId },
    });
    if (res.success) {
      setReplies((prev) => ({
        ...prev,
        [discussionId]: (prev[discussionId] || []).filter((r: any) => r.id !== replyId),
      }));
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === discussionId
            ? { ...d, comment_count: Math.max(0, (d.comment_count || 0) - 1) }
            : d,
        ),
      );
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

  const stats = useMemo(() => {
    const uniqueUsers = new Set(discussions.map((d) => d.user_id));
    return { total: discussions.length, members: uniqueUsers.size };
  }, [discussions]);

  return (
    <div className="relative min-h-screen bg-zinc-950 selection:bg-zinc-500/30">
      <Navbar />
      <NewDiscussionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={fetchDiscussions}
      />
      <main className="mx-auto max-w-4xl px-6 pb-32 pt-16">
        <PageTransition>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono-display text-[10px] uppercase tracking-widest text-zinc-600">
                    / community
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-zinc-600">
                    <Users className="size-3" />
                    {stats.members}
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-100 md:text-4xl">
                  Community
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                  {stats.total} {stats.total === 1 ? "post" : "posts"} · Share, ask, and discuss
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950 transition-all hover:opacity-90 sm:inline-flex"
              >
                <Plus className="size-4" />
                Create post
              </button>
            </div>
          </motion.div>

          {/* Toolbar: search, sort, create (mobile) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-zinc-900/80 px-3 py-2.5 ring-1 ring-white/10 focus-within:ring-zinc-400/40 transition-all">
              <Search className="size-4 shrink-0 text-zinc-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search discussions..."
                className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                aria-label="Search discussions"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-zinc-500 hover:text-zinc-200" aria-label="Clear search">
                  <X className="size-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {SORTS.map((s) => {
                const active = sortBy === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSortBy(s.id as typeof sortBy);
                      setVisible(PAGE_SIZE);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      active
                        ? "bg-zinc-800 text-zinc-100"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 transition-all hover:opacity-90 sm:hidden"
              >
                <Plus className="size-3.5" />
                Post
              </button>
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-5 flex flex-wrap gap-1.5"
          >
            {CATEGORIES.map((c) => {
              const active = c === selectedCategory;
              return (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedCategory(c);
                    setVisible(PAGE_SIZE);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    active
                      ? "bg-zinc-800 text-zinc-200"
                      : "text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </motion.div>

          {/* Posts */}
          {loading ? (
            <div className="space-y-1.5">
              {Array.from({ length: 5 }, (_, i) => (
                <SkeletonDiscussionCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-800 py-16 text-center"
            >
              <MessageCircle className="size-8 text-zinc-600" />
              <div>
                <h3 className="text-sm font-medium text-zinc-300">No posts yet</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  {searchQuery ? "Try a different search" : "Be the first to post"}
                </p>
              </div>
              {!searchQuery && (
                <button
                  onClick={() => setShowModal(true)}
                  className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:opacity-90"
                >
                  <Plus className="mr-1 inline size-3" />
                  Create a post
                </button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-1.5">
              {filtered.slice(0, visible).map((d: any, i: number) => {
                const isUpvoted = upvoted.has(d.id);
                const isExpanded = expanded.has(d.id);
                const isLoadingReplies = loadingReplies.has(d.id);
                const isSubmittingReply = submittingReply.has(d.id);
                const discReplies = replies[d.id] || [];
                const isOwner = currentUserId && d.user_id === currentUserId;

                return (
                  <motion.div key={d.id} variants={fadeUp} custom={i}>
                    {/* Post Card */}
                    <div className="flex items-start rounded-xl border border-zinc-800/50 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors">
                      {/* Vote Column */}
                      <div className="flex shrink-0 flex-col items-center gap-1 px-2.5 py-3 bg-zinc-900/60 rounded-l-xl">
                        <button
                          type="button"
                          onClick={() => handleUpvote(d.id)}
                          className={`rounded p-0.5 transition-all ${
                            isUpvoted
                              ? "text-orange-400"
                              : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800"
                          }`}
                          aria-label="Upvote"
                        >
                          <ChevronUp className="size-5" />
                        </button>
                        <span
                          className={`text-xs font-bold tabular-nums ${
                            isUpvoted ? "text-orange-400" : "text-zinc-400"
                          }`}
                        >
                          {d.upvotes || 0}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-4 py-3">
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                          {d.is_pinned && (
                            <span className="flex items-center gap-0.5 text-zinc-400">
                              <Pin className="size-3" />
                              Pinned
                            </span>
                          )}
                          <span>
                            Posted by{" "}
                            <span className="font-medium text-zinc-400">
                              @{d.users?.username || "anonymous"}
                            </span>
                          </span>
                          <span>·</span>
                          <span>{relativeTime(d.created_at)}</span>
                          <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                            {d.category}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-zinc-200 leading-snug">
                          {d.title}
                        </h3>
                        <p className="line-clamp-2 text-xs text-zinc-400 leading-relaxed">
                          {d.content}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs">
                          <button
                            type="button"
                            onClick={() => toggleReplies(d.id)}
                            className={`flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors ${
                              isExpanded
                                ? "bg-zinc-800 text-zinc-200"
                                : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                            }`}
                          >
                            <MessageCircle className="size-3.5" />
                            {d.comment_count || 0}{" "}
                            {(d.comment_count || 0) === 1 ? "comment" : "comments"}
                          </button>
                          {isOwner && (
                            <button
                              type="button"
                              onClick={() => setDeleting(d.id)}
                              className="flex items-center gap-1 rounded-lg px-2 py-1 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 className="size-3.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-6 pl-3 border-l-2 border-zinc-800/60">
                          {isLoadingReplies ? (
                            <div className="flex items-center gap-2 py-4 text-xs text-zinc-500">
                              <span className="animate-pulse">...</span>
                              Loading comments...
                            </div>
                          ) : (
                            <div className="py-2 space-y-2">
                              {discReplies.length === 0 && (
                                <p className="py-3 text-xs text-zinc-600">No comments yet.</p>
                              )}
                              {discReplies.map((reply: any) => {
                                const isReplyOwner = currentUserId && reply.user_id === currentUserId;
                                return (
                                  <div
                                    key={reply.id}
                                    className="rounded-lg bg-zinc-900/20 px-3.5 py-2.5 ring-1 ring-white/5"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-2">
                                        <div className="size-5 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 ring-1 ring-white/10" />
                                        <span className="text-xs font-medium text-zinc-300">
                                          @{reply.users?.username || "anonymous"}
                                        </span>
                                        {reply.parent_id && (
                                          <span className="text-[10px] text-zinc-600">· reply</span>
                                        )}
                                        <span className="text-[10px] text-zinc-600">
                                          {relativeTime(reply.created_at)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {currentUserId && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setReplyText((prev) => ({ ...prev, [d.id]: "" }));
                                              setReplyingTo({
                                                id: reply.id,
                                                username: reply.users?.username || "anonymous",
                                              });
                                              setTimeout(() => replyInputRef.current?.focus(), 50);
                                            }}
                                            className="rounded px-1.5 py-0.5 text-[10px] text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                                          >
                                            Reply
                                          </button>
                                        )}
                                        {isReplyOwner && (
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteReply(d.id, reply.id)}
                                            className="rounded px-1.5 py-0.5 text-[10px] text-zinc-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                          >
                                            Delete
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-xs text-zinc-400 leading-relaxed pl-7">
                                      {reply.parent_id && (
                                        <span className="text-zinc-600 mr-1">↳</span>
                                      )}
                                      {reply.content}
                                    </p>
                                  </div>
                                );
                              })}
                              {currentUserId && (
                                <div className="flex items-start gap-2 pt-1 pl-0">
                                  <div className="size-6 shrink-0 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 ring-1 ring-white/10 mt-1" />
                                  <div className="flex-1">
                                    {replyingTo && (
                                      <div className="mb-1 flex items-center gap-1.5 text-[10px] text-zinc-500">
                                        <span>
                                          Replying to{" "}
                                          <span className="font-medium text-zinc-400">
                                            @{replyingTo.username}
                                          </span>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => setReplyingTo(null)}
                                          className="rounded p-0.5 text-zinc-600 hover:text-zinc-300"
                                          aria-label="Cancel reply"
                                        >
                                          <X className="size-3" />
                                        </button>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <input
                                        ref={replyInputRef}
                                        type="text"
                                        value={replyText[d.id] || ""}
                                        onChange={(e) =>
                                          setReplyText((prev) => ({
                                            ...prev,
                                            [d.id]: e.target.value,
                                          }))
                                        }
                                        placeholder={
                                          replyingTo
                                            ? `Reply to @${replyingTo.username}...`
                                            : "What are your thoughts?"
                                        }
                                        className="flex-1 rounded-lg bg-zinc-800/80 px-3 py-2 text-xs text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-zinc-400/40 transition-all placeholder:text-zinc-600"
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAddReply(
                                              d.id,
                                              replyingTo?.id || undefined,
                                            );
                                          }
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleAddReply(d.id, replyingTo?.id || undefined)
                                        }
                                        disabled={!replyText[d.id]?.trim()}
                                        className="rounded-lg bg-zinc-100 p-2 text-zinc-950 transition-all hover:opacity-90 disabled:opacity-30"
                                        aria-label="Send reply"
                                      >
                                        <Send className="size-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Infinite scroll */}
          {!loading && filtered.length > visible && (
            <div
              ref={sentinelRef}
              className="flex items-center justify-center py-8 text-xs text-zinc-500"
            >
              <Loader />
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <p className="mt-4 text-center text-xs text-zinc-600">
              Showing {Math.min(visible, filtered.length)} of {filtered.length}{" "}
              {filtered.length === 1 ? "post" : "posts"}
            </p>
          )}
        </PageTransition>
      </main>
      <Footer />

      <AlertDialog open={!!deleting} onOpenChange={(o) => { if (!o) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post and all replies will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleting(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && handleDelete(deleting)} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
