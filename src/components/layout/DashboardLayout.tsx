import { Link, Outlet, useRouter } from "@tanstack/react-router";
import { LayoutDashboard, FileText, FolderOpen, Settings, LogOut, ChevronLeft } from "lucide-react";
import logoSrc from "@/assets/logo.png";
import { useAuth } from "@/hooks/use-auth";
import { useRef, useState, useLayoutEffect, type ReactNode } from "react";

const sidebarLinks = (creatorMode: boolean) => [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
  ...(creatorMode
    ? [
        {
          to: "/dashboard/creator" as const,
          icon: FileText as typeof FileText,
          label: "Creator Dashboard",
        },
      ]
    : []),
  { to: "/dashboard/collections", icon: FolderOpen, label: "Collections" },
  { to: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function DashboardLayout({ children }: { children?: ReactNode }) {
  const { profile, user, signOut, creatorMode } = useAuth();
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const navRef = useRef<HTMLDivElement>(null);
  const gliderRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  function isActive(to: string, exact?: boolean) {
    if (exact) return currentPath === to;
    return currentPath.startsWith(to);
  }

  const links = sidebarLinks(creatorMode);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const glider = gliderRef.current;
    if (!nav || !glider) return;
    const activeIdx = links.findIndex((link) => isActive(link.to, link.exact));
    if (activeIdx === -1) return;
    const items = nav.children;
    if (items[activeIdx]) {
      const el = items[activeIdx] as HTMLElement;
      glider.style.top = `${nav.offsetTop + el.offsetTop}px`;
      glider.style.height = `${el.offsetHeight}px`;
      if (!ready) setReady(true);
    }
  }, [currentPath, creatorMode]);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <aside className="hidden w-56 shrink-0 border-r border-zinc-800/50 bg-zinc-950/95 lg:flex lg:flex-col">
        {/* Brand header */}
        <div className="flex h-12 items-center gap-2.5 border-b border-zinc-800/50 px-4">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logoSrc} alt="PromptOS" className="size-8 rounded" />
            <div>
              <span className="text-base font-bold tracking-tight text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text">
                PromptOS
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 px-3 py-4">

          {/* Glowing indicator */}
          <div
            ref={gliderRef}
            className={`absolute left-3 pointer-events-none ${ready ? "transition-all duration-500" : "opacity-0"}`}
            style={{ top: 0, height: 0 }}
          >
            <div className="w-[3px] h-full rounded-full bg-gradient-to-b from-transparent via-amber-400 to-transparent shadow-sm shadow-amber-500/30" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-56 h-8 bg-amber-400 blur-2xl opacity-10" />
            <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-amber-400/8 to-transparent" />
          </div>

          {/* Nav links */}
          <div ref={navRef} className="relative space-y-0.5">
            {links.map((link) => {
              const active = isActive(link.to, link.exact);
              return (
                <Link
                  key={link.to}
                  to={link.to as any}
                  activeOptions={{ exact: link.exact }}
                  className={`relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40 ${
                    active
                      ? "text-amber-300 bg-amber-500/8 shadow-sm shadow-amber-500/5"
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/30"
                  }`}
                >
                  <link.icon className={`size-3.5 shrink-0 transition-all duration-200 ${active ? "text-amber-400" : ""}`} />
                  <span className={active ? "drop-shadow-sm drop-shadow-amber-500/30" : ""}>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-zinc-800/50 px-3 py-3.5">
          <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 bg-zinc-900/40 ring-1 ring-white/5">
            <div className="size-7 shrink-0 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-800 ring-1 ring-white/10 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-[11px] font-bold text-zinc-300">
                  {(profile?.username || user?.email || "U").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-zinc-300 truncate">
                {profile?.username || user?.email?.split("@")[0]}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              signOut();
              router.navigate({ to: "/" });
            }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-medium text-zinc-500 transition-all hover:bg-red-500/10 hover:text-red-400 group"
          >
            <LogOut className="size-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto pb-16 lg:pb-0">
        <div className="mx-auto max-w-6xl px-6 py-8">{children || <Outlet />}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800/50 bg-zinc-950/95 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-around px-2 py-1.5">
          {links.map((link) => {
            const active = isActive(link.to, link.exact);
            return (
              <Link
                key={link.to}
                to={link.to as any}
                activeOptions={{ exact: link.exact }}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-all ${
                  active
                    ? "text-amber-300"
                    : "text-zinc-500 hover:text-zinc-200"
                }`}
              >
                <link.icon className={`size-4 ${active ? "text-amber-400" : ""}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
