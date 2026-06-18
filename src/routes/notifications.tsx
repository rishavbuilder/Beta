import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Loader2, ChevronLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition, fadeUp, stagger } from "@/components/PageTransition";
import { getNotifications, markNotificationRead } from "@/utils/supabase-server";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [{ title: "Notifications — PromptOS" }],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<Set<string>>(new Set());

  useEffect(() => {
    getNotifications().then((res: any) => {
      setNotifications(res.notifications || []);
      setLoading(false);
    });
  }, []);

  async function handleMarkRead(id: string) {
    setMarking((prev) => new Set(prev).add(id));
    await markNotificationRead({ data: { id } });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setMarking((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative min-h-screen hero-radial selection:bg-zinc-500/30">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pb-32 pt-16">
        <PageTransition>
          <Link
            to="/dashboard"
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-200"
          >
            <ChevronLeft className="size-3.5" />
            Back to dashboard
          </Link>

          <div className="mb-8 flex items-end justify-between">
            <div>
              <span className="font-mono-display text-[10px] uppercase tracking-wider text-zinc-500">
                / notifications
              </span>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
                Notifications
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
                  : "All caught up!"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="size-6 animate-spin text-zinc-500" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 py-20 text-center">
              <Bell className="size-8 text-zinc-600" />
              <div>
                <h3 className="text-sm font-medium text-zinc-200">No notifications yet</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  When someone interacts with your prompts, you'll see it here.
                </p>
              </div>
            </div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
              {notifications.map((n: any, i: number) => (
                <motion.div
                  key={n.id}
                  variants={fadeUp}
                  custom={i}
                  className={`rounded-xl p-4 ring-1 transition-colors ${
                    n.is_read ? "bg-zinc-900/40 ring-white/5" : "bg-zinc-800/60 ring-zinc-500/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 size-2 shrink-0 rounded-full ${
                        n.is_read ? "bg-transparent" : "bg-zinc-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200">{n.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{n.message}</p>
                      <span className="mt-1.5 block text-[10px] text-zinc-600">
                        {n.created_at ? new Date(n.created_at).toLocaleDateString() : ""}
                      </span>
                    </div>
                    {!n.is_read && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(n.id)}
                        disabled={marking.has(n.id)}
                        className="shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-medium text-zinc-400 ring-1 ring-white/10 hover:bg-zinc-700 hover:text-zinc-200 transition-colors disabled:opacity-50"
                      >
                        {marking.has(n.id) ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          "Mark read"
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
