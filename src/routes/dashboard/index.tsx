import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Bookmark,
  Eye,
  Users,
  DollarSign,
  Activity,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getUserProfile, listMyPrompts } from "@/utils/supabase-server";
import { getServerSupabase } from "@/lib/supabase-server-client";
import { PageTransition, fadeUp, stagger } from "@/components/PageTransition";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [{ title: "Dashboard — PromptOS" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [userPrompts, setUserPrompts] = useState<any[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getUserProfile().then((r: any) => r.user),
      listMyPrompts().then((r: any) => r.prompts || []),
    ]).then(async ([user, prompts]) => {
      setProfile(user);
      setUserPrompts(prompts.slice(0, 5));
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
          <Loader2 className="size-6 animate-spin text-zinc-500" />
        </div>
      </DashboardLayout>
    );
  }

  const totalSaves = userPrompts.reduce((a: number, p: any) => a + (p.saves_count || 0), 0);
  const totalViews = userPrompts.reduce((a: number, p: any) => a + (p.views_count || 0), 0);
  const totalEarnings = userPrompts.reduce((a: number, p: any) => a + (Number(p.price) || 0), 0);

  const stats = [
    {
      label: "Total Prompts",
      value: String(userPrompts.length),
      change: "+0",
      positive: true,
      icon: FileText,
    },
    {
      label: "Total Saves",
      value: totalSaves.toLocaleString(),
      change: "+0",
      positive: true,
      icon: Bookmark,
    },
    {
      label: "Total Views",
      value: totalViews.toLocaleString(),
      change: "+0",
      positive: true,
      icon: Eye,
    },
    {
      label: "Followers",
      value: followerCount.toLocaleString(),
      change: "+0",
      positive: true,
      icon: Users,
    },
    {
      label: "Listed Price",
      value: `$${totalEarnings.toFixed(2)}`,
      change: "+$0",
      positive: true,
      icon: DollarSign,
    },
    { label: "Avg. Rating", value: "—", change: "", positive: true, icon: Activity },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageTransition>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {profile
                ? `Welcome back, ${profile.username || profile.email}!`
                : "Welcome back! Here&apos;s an overview of your prompts."}
            </p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                custom={i}
                className="rounded-xl bg-zinc-900/40 p-5 ring-1 ring-white/5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-zinc-500">{s.label}</span>
                  <s.icon className="size-4 text-zinc-500" />
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-semibold text-zinc-100">{s.value}</span>
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${s.positive ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {s.positive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                    {s.change}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="rounded-xl bg-zinc-900/40 ring-1 ring-white/5">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <h2 className="text-sm font-medium text-zinc-200">Recent Prompts</h2>
              <Link
                to="/dashboard/creator"
                className="text-xs font-medium text-zinc-400 hover:text-zinc-200"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {userPrompts.length === 0 ? (
                <div className="px-6 py-8 text-center text-xs text-zinc-500">
                  No prompts yet. Create your first prompt from the{" "}
                  <Link to="/dashboard/creator/upload" className="text-zinc-300 underline">
                    Creator Dashboard
                  </Link>
                  .
                </div>
              ) : (
                userPrompts.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-zinc-800 ring-1 ring-white/10 flex items-center justify-center">
                        <FileText className="size-4 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{p.title}</p>
                        <p className="text-xs text-zinc-500">
                          {(p.saves_count || 0).toLocaleString()} saves ·{" "}
                          {(p.views_count || 0).toLocaleString()} views
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                        p.is_published !== false
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-zinc-500/10 text-zinc-400"
                      }`}
                    >
                      {p.is_published !== false ? "Published" : "Draft"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </PageTransition>
      </div>
    </DashboardLayout>
  );
}
