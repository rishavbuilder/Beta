import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  BarChart3,
  LayoutDashboard,
  ChevronRight,
  DollarSign,
  Activity,
  Loader2,
} from "lucide-react";
import { getAdminStats } from "@/utils/supabase-server";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin — PromptOS" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const adminLinks = [
  { to: "/admin/users", icon: Users, label: "Users", desc: "Manage user accounts", count: "12.4K" },
  { to: "/admin", icon: BarChart3, label: "Analytics", desc: "Platform analytics", count: "+23%" },
];

const stats = [
  { label: "Total Users", value: "12,482", change: "+342", icon: Users },
  { label: "Total Prompts", value: "4,291", change: "+128", icon: FileText },
  { label: "Revenue (MTD)", value: "$8,420", change: "+12.4%", icon: DollarSign },
  { label: "Active Battles", value: "18", change: "+3", icon: Activity },
];

function AdminPage() {
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then((res: any) => {
      if (res.stats) setAdminStats(res.stats);
      setLoading(false);
    });
  }, []);

  const stats = [
    {
      label: "Total Users",
      value: adminStats?.totalUsers?.toLocaleString() || "12,482",
      change: "+342",
      icon: Users,
    },
    {
      label: "Total Prompts",
      value: adminStats?.totalPrompts?.toLocaleString() || "4,291",
      change: "+128",
      icon: FileText,
    },
    { label: "Revenue (MTD)", value: "$8,420", change: "+12.4%", icon: DollarSign },
    { label: "Active Battles", value: "18", change: "+3", icon: Activity },
  ];

  return (
    <div className="relative min-h-screen hero-radial">
      <div className="flex">
        <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-zinc-950/40 lg:block">
          <div className="flex h-14 items-center border-b border-white/5 px-6">
            <Link to="/" className="flex items-center gap-2">
              <LayoutDashboard className="size-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-200">Admin Panel</span>
            </Link>
          </div>
          <nav className="space-y-1 p-4">
            {adminLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to as any}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-200"
              >
                <span className="flex items-center gap-3">
                  <link.icon className="size-4" />
                  {link.label}
                </span>
                <ChevronRight className="size-3.5" />
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-5xl space-y-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-zinc-500">Platform overview and moderation tools.</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-6 animate-spin text-zinc-500" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl bg-zinc-900/40 p-5 ring-1 ring-white/5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-zinc-500">{s.label}</span>
                        <s.icon className="size-4 text-zinc-500" />
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-2xl font-semibold text-zinc-100">{s.value}</span>
                        <span className="text-xs font-medium text-emerald-400">{s.change}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {adminLinks.map((link, i) => (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                    >
                      <Link
                        to={link.to as any}
                        className="flex items-center gap-4 rounded-xl bg-zinc-900/40 p-5 ring-1 ring-white/5 transition-colors hover:bg-zinc-900/60"
                      >
                        <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-800 ring-1 ring-white/10">
                          <link.icon className="size-5 text-zinc-300" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-zinc-200">{link.label}</h3>
                          <p className="text-xs text-zinc-500">{link.desc}</p>
                        </div>
                        <span className="text-sm font-medium text-zinc-400">{link.count}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
