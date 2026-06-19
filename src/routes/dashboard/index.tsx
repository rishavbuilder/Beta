import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Bookmark,
  Eye,
  Users,
  Plus,
  Settings,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import { Loader } from "@/components/Loader";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getUserProfile, listMyPrompts, listSavedPrompts } from "@/utils/supabase-server";
import { getServerSupabase } from "@/lib/supabase-server-client";
import { PageTransition, fadeUp, stagger } from "@/components/PageTransition";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard — PromptOS" },
      {
        name: "description",
        content:
          "Your PromptOS dashboard. Manage your prompts, collections, and account settings.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [userPrompts, setUserPrompts] = useState<any[]>([]);
  const [savedPrompts, setSavedPrompts] = useState<any[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getUserProfile().then((r: any) => r.user),
      listMyPrompts().then((r: any) => r.prompts || []),
      listSavedPrompts().then((r: any) => r.prompts || []),
    ]).then(async ([user, prompts, saved]) => {
      setProfile(user);
      setUserPrompts(prompts.slice(0, 5));
      setSavedPrompts((saved || []).slice(0, 5));
      if (user) {
        const supabase = getServerSupabase() as any;
        const { count } = await supabase
          .from("followers")
          .select("id", { count: "exact", head: true })
          .eq("following_id", user.id);
        setFollowerCount(count || 0);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32">
          <Loader />
        </div>
      </DashboardLayout>
    );
  }

  const totalSaves = userPrompts.reduce(
    (a: number, p: any) => a + (p.saves_count || 0),
    0,
  );
  const totalViews = userPrompts.reduce(
    (a: number, p: any) => a + (p.views_count || 0),
    0,
  );

  const stats = [
    {
      label: "Total Prompts",
      value: userPrompts.length,
      icon: FileText,
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      border: "border-blue-500/20",
      glow: "bg-blue-400",
    },
    {
      label: "Total Saves",
      value: totalSaves,
      icon: Bookmark,
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      border: "border-emerald-500/20",
      glow: "bg-emerald-400",
    },
    {
      label: "Total Views",
      value: totalViews,
      icon: Eye,
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
      border: "border-amber-500/20",
      glow: "bg-amber-400",
    },
    {
      label: "Followers",
      value: followerCount,
      icon: Users,
      gradient: "from-violet-500/10 via-violet-500/5 to-transparent",
      border: "border-violet-500/20",
      glow: "bg-violet-400",
    },
  ];

  const publishedCount = userPrompts.filter(
    (p: any) => p.is_published !== false,
  ).length;

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 shrink-0 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 ring-1 ring-white/10 flex items-center justify-center overflow-hidden">
                <span className="text-lg font-bold text-zinc-200">
                  {(profile?.username || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text">
                  Welcome back{profile?.username ? `, ${profile.username}` : ""}
                </h1>
                <p className="mt-0.5 text-sm text-zinc-500">
                  {publishedCount} published · {userPrompts.length - publishedCount} drafts
                </p>
              </div>
            </div>
            <Link
              to="/dashboard/creator/upload"
              className="group inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:opacity-90 transition-all shrink-0"
            >
              <Plus className="size-4" />
              New prompt
              <ArrowUpRight className="size-3 text-zinc-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                custom={i}
                className="group relative overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 hover:border-zinc-700/60 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px ${s.border}`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-zinc-500">{s.label}</span>
                    <div className={`size-8 rounded-lg bg-zinc-800/80 flex items-center justify-center ring-1 ring-white/5`}>
                      <s.icon className="size-4 text-zinc-400" />
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-semibold text-zinc-100">
                      {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { to: "/dashboard/creator", icon: FileText, label: "Creator Dashboard", desc: "Manage your prompts" },
              { to: "/dashboard/collections", icon: Bookmark, label: "Collections", desc: "Organize your saves" },
              { to: "/dashboard/settings", icon: Settings, label: "Settings", desc: "Account & preferences" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group flex items-center gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-4 py-3.5 transition-all duration-200 hover:bg-zinc-800/30 hover:border-zinc-700/60 hover:shadow-lg hover:shadow-black/10"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-zinc-800/80 ring-1 ring-white/5 group-hover:bg-zinc-700/80 transition-colors">
                  <item.icon className="size-4 text-zinc-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">{item.label}</p>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
                <ExternalLink className="size-3.5 shrink-0 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </Link>
            ))}
          </div>

          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-2.5">
                <FileText className="size-4 text-zinc-500" />
                <h2 className="text-sm font-medium text-zinc-200">Recent prompts</h2>
              </div>
              <Link
                to="/dashboard/creator"
                className="text-xs font-medium text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                View all
              </Link>
            </div>
            {userPrompts.length === 0 ? (
              <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
                <div className="size-12 rounded-xl bg-zinc-800/50 flex items-center justify-center ring-1 ring-white/5">
                  <FileText className="size-6 text-zinc-600" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">No prompts yet</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Create your first prompt and share it with the community
                  </p>
                </div>
                <Link
                  to="/dashboard/creator/upload"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-200 ring-1 ring-white/10 hover:bg-zinc-700 transition-all"
                >
                  <Plus className="size-3" />
                  Create prompt
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {userPrompts.map((p: any) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-zinc-800/20"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-zinc-800/80 ring-1 ring-white/5">
                        <FileText className="size-4 text-zinc-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">
                          {p.title}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {(p.saves_count || 0).toLocaleString()} saves ·{" "}
                          {(p.views_count || 0).toLocaleString()} views
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                        p.is_published !== false
                          ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                          : "bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/20"
                      }`}
                    >
                      {p.is_published !== false ? "Published" : "Draft"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Prompts */}
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-2.5">
                <Bookmark className="size-4 text-zinc-500" />
                <h2 className="text-sm font-medium text-zinc-200">Saved Prompts</h2>
              </div>
            </div>
            {savedPrompts.length === 0 ? (
              <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
                <div className="size-12 rounded-xl bg-zinc-800/50 flex items-center justify-center ring-1 ring-white/5">
                  <Bookmark className="size-6 text-zinc-600" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">No saved prompts</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Bookmark prompts you like from the marketplace
                  </p>
                </div>
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-200 ring-1 ring-white/10 hover:bg-zinc-700 transition-all"
                >
                  Browse prompts
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {savedPrompts.map((p: any) => (
                  <Link
                    key={p.id}
                    to="/prompt/$id"
                    params={{ id: p.id }}
                    className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-zinc-800/20"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-zinc-800/80 ring-1 ring-white/5">
                        <FileText className="size-4 text-zinc-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">
                          {p.title}
                        </p>
                        <p className="text-xs text-zinc-500">
                          by {p.users?.username || "anonymous"} · {(p.saves_count || 0).toLocaleString()} saves
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="size-3.5 shrink-0 text-zinc-600" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
