import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Users, Eye, Star, MapPin, Globe, Twitter, Github, ExternalLink, ChevronLeft, BookmarkCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/PageTransition";
import { getUserByUsername, listUserPrompts, checkFollow, toggleFollow } from "@/utils/supabase-server";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/creator/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} — PromptOS` },
      { name: "description", content: `View ${params.username}'s profile and prompts on PromptOS.` },
    ],
  }),
  component: CreatorProfilePage,
});

function CreatorProfilePage() {
  const { username } = useParams({ from: "/creator/$username" });
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [following, setFollowing] = useState(false);
  const [promptCount, setPromptCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    (getUserByUsername as any)({ data: { username } }).then(async (res: any) => {
      if (res.error) { setError(res.error); setLoading(false); return; }
      setProfile(res.user);
      setPromptCount(res.promptCount);
      const [promptsRes, collectionsRes] = await Promise.all([
        (listUserPrompts as any)({ data: { userId: res.user.id } }),
        fetch(`/api/collections?userId=${res.user.id}`).catch(() => ({ collections: [] })),
      ]);
      setPrompts(promptsRes.prompts || []);
      setCollections(collectionsRes.collections || []);
      if (currentUser && currentUser.id !== res.user.id) {
        const followRes: any = await (checkFollow as any)({ data: { userId: res.user.id } });
        setFollowing(followRes.following);
      }
      setLoading(false);
    });
  }, [username, currentUser]);

  async function handleFollow() {
    if (!currentUser) return;
    setFollowing(!following);
    await (toggleFollow as any)({ data: { following_id: profile.id } });
  }

  if (loading) {
    return (
      <div className="min-h-screen hero-radial">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <svg className="size-6 animate-spin text-zinc-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 5.373 0 12 4z" />
          </svg>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen hero-radial">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="size-12 rounded-xl bg-zinc-800/50 flex items-center justify-center ring-1 ring-white/5">
            <Users className="size-6 text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-500">{error}</p>
          <Link to="/explore" className="text-xs text-zinc-400 hover:text-zinc-200 underline">Browse prompts</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const totalViews = prompts.reduce((a: number, p: any) => a + (p.views_count || 0), 0);
  const totalSaves = prompts.reduce((a: number, p: any) => a + (p.saves_count || 0), 0);

  return (
    <div className="min-h-screen hero-radial selection:bg-zinc-500/30">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pb-32 pt-16">
        <PageTransition>
          <Link to="/explore" className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200 transition-colors mb-8">
            <ChevronLeft className="size-3" />
            Back to explore
          </Link>

          {/* Profile header */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between mb-10">
            <div className="flex items-center gap-5">
              <div className="size-16 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-800 ring-2 ring-white/10 flex items-center justify-center overflow-hidden shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="size-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-zinc-300">
                    {(profile.username || profile.full_name || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text">
                  {profile.full_name || profile.username}
                </h1>
                <p className="text-sm text-zinc-500">@{profile.username}</p>
                {profile.bio && <p className="text-sm text-zinc-400 mt-1.5 max-w-md">{profile.bio}</p>}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {profile.location && (
                    <span className="flex items-center gap-1 text-xs text-zinc-500"><MapPin className="size-3" />{profile.location}</span>
                  )}
                  {profile.website && (
                    <a href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200 transition-colors">
                      <Globe className="size-3" />Website <ExternalLink className="size-2.5" />
                    </a>
                  )}
                  {profile.twitter && (
                    <a href={profile.twitter.startsWith("http") ? profile.twitter : `https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200 transition-colors">
                      <Twitter className="size-3" />Twitter
                    </a>
                  )}
                  {profile.github && (
                    <a href={profile.github.startsWith("http") ? profile.github : `https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200 transition-colors">
                      <Github className="size-3" />GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
            {currentUser && currentUser.id !== profile.id && (
              <button onClick={handleFollow}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  following ? "bg-zinc-800 text-zinc-300 ring-1 ring-white/10 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-950 hover:opacity-90"
                }`}
              >
                {following ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3 mb-10">
            {[
              { label: "Prompts", value: promptCount, icon: FileText },
              { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye },
              { label: "Total Saves", value: totalSaves.toLocaleString(), icon: Star },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500">{s.label}</span>
                  <s.icon className="size-4 text-zinc-500" />
                </div>
                <span className="text-xl font-semibold text-zinc-100">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Prompts grid */}
          <h2 className="text-sm font-medium text-zinc-200 mb-4">Published Prompts</h2>
          {prompts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center rounded-xl border border-zinc-800/60 bg-zinc-900/40">
              <div className="size-10 rounded-lg bg-zinc-800/50 flex items-center justify-center ring-1 ring-white/5">
                <FileText className="size-5 text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-500">No published prompts yet</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {prompts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link to="/prompt/$id" params={{ id: p.id }}
                    className="group block rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 ring-1 ring-white/[0.02] hover:border-zinc-700/60 transition-all"
                  >
                    <h3 className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors line-clamp-1">{p.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{p.description}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-zinc-600">
                      <span className="flex items-center gap-1"><Eye className="size-3" />{p.views_count || 0}</span>
                      <span className="flex items-center gap-1"><Star className="size-3" />{p.saves_count || 0}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
